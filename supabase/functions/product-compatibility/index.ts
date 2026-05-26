import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Light QA pass on AI output:
// - swap forbidden disease-claim verbs for compliant structure/function phrasing
// - replace common untranslated English wellness terms when the locale isn't English
function sanitizeInsight(text: string, locale: string): string {
  if (!text) return text;
  let out = text;

  // Regulatory: forbidden -> compliant. Order matters (longest first).
  const enClaims: Array<[RegExp, string]> = [
    [/\bcures?\b/gi, "supports"],
    [/\bcured\b/gi, "supported"],
    [/\btreats?\b/gi, "helps support"],
    [/\btreated\b/gi, "supported"],
    [/\bprevents?\b/gi, "helps maintain"],
    [/\bdiagnoses?\b/gi, "helps you understand"],
    [/\bheals?\b/gi, "supports"],
  ];
  const frClaims: Array<[RegExp, string]> = [
    [/\bgu[ée]rit\b/gi, "soutient"],
    [/\bgu[ée]rir\b/gi, "soutenir"],
    [/\btraite\b/gi, "aide à soutenir"],
    [/\btraiter\b/gi, "aider à soutenir"],
    [/\bpr[ée]vient\b/gi, "aide à maintenir"],
    [/\bpr[ée]venir\b/gi, "aider à maintenir"],
    [/\bdiagnostique\b/gi, "aide à comprendre"],
    [/\bsoigne\b/gi, "soutient"],
  ];
  for (const [re, rep] of enClaims) out = out.replace(re, rep);
  if (locale === "fr") for (const [re, rep] of frClaims) out = out.replace(re, rep);

  // Untranslated English wellness terms when target isn't English.
  if (locale !== "en") {
    const dict: Record<string, Record<string, string>> = {
      fr: {
        sleep: "sommeil", energy: "énergie", stress: "stress", focus: "concentration",
        recovery: "récupération", strength: "force", immunity: "immunité",
        mood: "humeur", "gut health": "santé digestive", digestion: "digestion",
        skin: "peau", hair: "cheveux", "weight loss": "perte de poids",
        performance: "performance", workout: "entraînement", stack: "routine",
      },
    };
    const d = dict[locale];
    if (d) {
      for (const [en, tr] of Object.entries(d)) {
        const re = new RegExp(`\\b${en}\\b`, "gi");
        out = out.replace(re, tr);
      }
    }
  }

  return out.replace(/\s{2,}/g, " ").trim();
}

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/vitasyncai\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^http:\/\/localhost:(5173|8080)$/,
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin))
    ? origin
    : "https://vitasyncai.lovable.app";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { product_handle, product_title, product_summary, product_best_for_tags, product_coach_tip, locale } = body;
    const LOCALE_NAMES: Record<string, string> = {
      en: "English", fr: "French", es: "Spanish", de: "German", it: "Italian", pt: "Portuguese",
    };
    const localeCode = typeof locale === "string" && LOCALE_NAMES[locale] ? locale : "en";
    const localeName = LOCALE_NAMES[localeCode];

    if (!product_handle || !product_title) {
      return new Response(JSON.stringify({ error: "product_handle and product_title required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Fetch user health profile
    const { data: profile } = await supabase
      .from("user_health_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Fetch user's current supplement stack
    const { data: stack } = await supabase
      .from("supplement_tracking")
      .select("product_name, dosage, time_of_day")
      .eq("user_id", user.id)
      .eq("active", true);

    const profileContext = profile ? `
User Profile:
- Age range: ${profile.age_range || "unknown"}
- Health goals: ${(profile.health_goals || []).join(", ") || "none specified"}
- Activity level: ${profile.activity_level || "unknown"}
- Diet type: ${profile.diet_type || "unknown"}
- Allergies: ${(profile.allergies || []).join(", ") || "none"}
- Medical conditions: ${(profile.medical_conditions || []).join(", ") || "none"}
- Current issues: ${(profile.current_issues || []).join(", ") || "none"}
- Sleep quality: ${profile.sleep_quality || "unknown"}
- Stress level: ${profile.stress_level || "unknown"}
- Energy level: ${profile.energy_level || "unknown"}
- Supplements experience: ${profile.supplements_experience || "unknown"}
` : "No health profile available.";

    const stackContext = stack && stack.length > 0
      ? `Current supplement stack:\n${stack.map(s => `- ${s.product_name} (${s.dosage || "no dosage"}, ${s.time_of_day || "anytime"})`).join("\n")}`
      : "No supplements currently tracked.";

    const productContext = `
Product to analyze:
- Name: ${product_title}
- Summary: ${product_summary || "N/A"}
- Best for: ${(product_best_for_tags || []).join(", ") || "N/A"}
- Coach tip: ${product_coach_tip || "N/A"}
`;

    const systemPrompt = `You are VitaSync's product compatibility analyzer. Your job is to evaluate how well a specific supplement product matches a user's health profile.

Analyze the user's profile, their current supplement stack, and the product details. Return a JSON response with:
1. "score": an integer 0-100 representing compatibility (0=terrible match, 100=perfect match)
2. "insight": a concise 1-2 sentence explanation of why this product is or isn't a good match for this user

Scoring guidelines:
- 80-100: Product directly addresses user's top health goals and has no contraindications
- 60-79: Product is relevant but not a top priority for the user's profile
- 40-59: Product has some relevance but better alternatives may exist
- 20-39: Product doesn't align well with user's goals or has potential concerns
- 0-19: Product may be contraindicated or completely irrelevant

Consider:
- Goal alignment (most important factor)
- Potential interactions with existing stack
- Allergies and medical conditions
- Activity level and lifestyle fit
- Whether user already takes similar supplements

LANGUAGE: Respond strictly in ${localeName} (locale code: ${localeCode}). The "insight" field MUST be written in ${localeName}.

STYLE & TONE:
- Write naturally and fluently, as a human wellness coach would speak — not a literal translation of an English template.
- Use ONLY ${localeName}. Never mix languages. Translate every term, including supplement categories, goals and ingredients (e.g. in French: "sommeil" not "sleep", "force" not "strength", "énergie" not "energy"). Brand and product names stay as-is.
- Avoid robotic constructions like "Ce produit correspond à votre profil de sleep". Rephrase fully.
- Keep it warm, concise and credible (1–2 short sentences).

REGULATORY COMPLIANCE (structure/function claims only):
- Use compliant verbs: "supports / helps / contributes to / promotes" (and their ${localeName} equivalents: e.g. FR "soutient / aide à / contribue à / favorise").
- NEVER use "treats / cures / prevents / diagnoses / heals" or their ${localeName} equivalents (FR: "traite / guérit / prévient / diagnostique / soigne"). No disease claims.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks. Example:
{"score": 75, "insight": "This product aligns well with your sleep improvement goals, though you may want to start with a lower dose given your current stack."}`;

    const userMessage = `${profileContext}\n${stackContext}\n${productContext}\n\nPlease analyze the compatibility and return your JSON response.`;

    // Call AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", await aiResponse.text());
      return new Response(JSON.stringify({ error: "AI analysis failed" }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response
    let score = 50;
    let insight = "";
    try {
      const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      score = Math.max(0, Math.min(100, parseInt(parsed.score) || 50));
      insight = parsed.insight || "";
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      insight = rawContent.slice(0, 500);
    }

    insight = sanitizeInsight(insight, localeCode);

    // Upsert into DB
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceKey);
    
    const { error: upsertError } = await adminClient
      .from("product_compatibility_analyses")
      .upsert({
        user_id: user.id,
        product_handle,
        product_title,
        compatibility_score: score,
        insight_text: insight,
      }, { onConflict: "user_id,product_handle" });

    if (upsertError) {
      console.error("Upsert error:", upsertError);
    }

    return new Response(JSON.stringify({ score, insight }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});