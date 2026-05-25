import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductSummary {
  handle: string;
  title: string;
  productType?: string;
  tags?: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const products: ProductSummary[] = Array.isArray(body?.products) ? body.products : [];
    if (products.length === 0) {
      return new Response(JSON.stringify({ ranking: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("user_health_profiles").select("*").eq("user_id", user.id).maybeSingle();

    const profileSummary = profile ? `
- Wellness goals: ${(profile.health_goals || []).join(", ") || "none"}
- Current focus areas: ${(profile.current_issues || []).join(", ") || "none"}
- Activity level: ${profile.activity_level || "n/a"}
- Sports: ${(profile.sport_types || []).join(", ") || "none"}
- Diet: ${profile.diet_type || "n/a"}
- Sleep quality: ${profile.sleep_quality || "n/a"}
- Stress level: ${profile.stress_level || "n/a"}
- Allergies (AVOID): ${(profile.allergies || []).join(", ") || "none"}
- Preferred forms: ${(profile.preferred_forms || []).join(", ") || "any"}
- Budget range: ${profile.budget_range_min ?? "?"}-${profile.budget_range_max ?? "?"} USD/month
` : "No profile available.";

    // Build compact catalog
    const catalogLines = products.slice(0, 250).map((p, i) =>
      `${i + 1}. ${p.handle} | ${p.title} | ${p.productType || ""} | ${(p.tags || []).slice(0, 6).join(",")}`
    ).join("\n");

    const systemPrompt = `You are VitaSync Lite, a wellness product personalization assistant.
Your task: rank the catalog by relevance to the user's wellness profile so the most useful products come first.

RULES:
- Output ONLY valid JSON: {"ranking": ["handle1","handle2",...]}.
- Include the TOP 40 most relevant handles, ordered best first.
- Use ONLY handles from the catalog (do not invent).
- Exclude products that conflict with allergies/diet.
- This is a general wellness ranking, not medical advice.

USER PROFILE:
${profileSummary}

CATALOG:
${catalogLines}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ ranking: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Rank the catalog for me. Return JSON only." },
        ],
        temperature: 0.2,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      const status = aiResponse.status === 429 || aiResponse.status === 402 ? aiResponse.status : 500;
      return new Response(JSON.stringify({ ranking: [], error: "ai_unavailable" }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    let ranking: string[] = [];
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) ranking = JSON.parse(match[0]).ranking || [];
    } catch (e) {
      console.error("Parse error:", e);
    }

    const validHandles = new Set(products.map(p => p.handle));
    ranking = ranking.filter(h => typeof h === "string" && validHandles.has(h));

    return new Response(JSON.stringify({ ranking }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown";
    return new Response(JSON.stringify({ error: message, ranking: [] }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});