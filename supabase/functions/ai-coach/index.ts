// AI Coach Edge Function - VitaSync Premium
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/vitasyncai\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^http:\/\/localhost:(5173|8080)$/,
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin))
    ? origin
    : "https://vitasyncai.lovable.app";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// ============================================
// MODEL TIERING — Updated per audit
// ============================================
type ModelTier = 'lite' | 'standard' | 'pro';

function getModelTier(model: string): ModelTier {
  if (model === 'google/gemini-2.5-flash-lite') return 'lite';
  if (model === 'google/gemini-3.1-pro-preview') return 'pro';
  return 'standard'; // gemini-2.5-flash or fallback
}

// Audit fix: max_tokens set to 1024 minimum to avoid truncation
const TIER_CONFIG: Record<ModelTier, { maxTokens: number; messageSlice: number; historyDays: number }> = {
  lite:     { maxTokens: 1024,  messageSlice: 10, historyDays: 7 },
  standard: { maxTokens: 4096,  messageSlice: 20, historyDays: 90 },
  pro:      { maxTokens: 8192,  messageSlice: 20, historyDays: 90 },
};

// Shopify config
const SHOPIFY_STORE_DOMAIN = "vitasync2.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

async function fetchShopifyCatalog(): Promise<string> {
  const storefrontToken = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  if (!storefrontToken) {
    console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN not configured");
    return "Catalog unavailable.";
  }

  try {
    const query = `query { products(first: 250) { edges { node { id title tags variants(first: 1) { edges { node { id price { amount currencyCode } availableForSale } } } } } } }`;

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': storefrontToken },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.error("Shopify API error:", response.status);
      return "Catalog unavailable.";
    }

    const data = await response.json();
    const products = data?.data?.products?.edges || [];
    if (products.length === 0) return "No products available.";

    // deno-lint-ignore no-explicit-any
    const allProducts = products.map((edge: any) => {
      const p = edge.node;
      const v = p.variants.edges[0]?.node;
      const pid = p.id.split('/').pop();
      const vid = v?.id?.split('/').pop() || '';
      const price = v?.price?.amount || '0';
      const stock = v?.availableForSale ? '✓' : '✗';
      const tags = (p.tags || []).slice(0, 3).join(',');
      return `${p.title}|${pid}|${vid}|${price}$|${stock}|${tags}`;
    });

    return `CATALOG (${products.length}) — Name|PID|VID|Price|Stock|Tags\n${allProducts.join('\n')}\nRecommendation format: [[PRODUCT:productId:variantId:name:price:timing:dosage:meal]]`;
  } catch (error) {
    console.error("Error fetching Shopify catalog:", error);
    return "Catalog unavailable.";
  }
}

// deno-lint-ignore no-explicit-any
async function fetchUserSupplements(supabase: any, userId: string) {
  const { data } = await supabase
    .from("supplement_tracking")
    .select("product_name, dosage, time_of_day, recommended_by_ai")
    .eq("user_id", userId)
    .eq("active", true);
  return data || [];
}

// deno-lint-ignore no-explicit-any
async function fetchBloodTestAnalyses(supabase: any, userId: string) {
  const { data } = await supabase
    .from("blood_test_analyses")
    .select("id, file_name, status, deficiencies, analyzed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
  return data || [];
}

// deno-lint-ignore no-explicit-any
async function fetchEnrichedProductData(supabase: any) {
  const { data } = await supabase
    .from("product_enriched_data")
    .select("shopify_product_title, best_for_tags, coach_tip, safety_warnings");
  return data || [];
}

// deno-lint-ignore no-explicit-any
async function fetchRecentCheckins(supabase: any, userId: string, historyDays: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - historyDays);
  const { data } = await supabase
    .from("daily_checkins")
    .select("sleep_quality, energy_level, stress_level, mood, checkin_date")
    .eq("user_id", userId)
    .gte("checkin_date", startDate.toISOString().split("T")[0])
    .order("checkin_date", { ascending: false });
  return data || [];
}

// deno-lint-ignore no-explicit-any
function formatSupplements(supplements: any[]): string {
  if (!supplements.length) return "None.";
  // deno-lint-ignore no-explicit-any
  return supplements.map((s: any) => {
    const time = s.time_of_day === 'morning' ? 'Morning' : s.time_of_day === 'noon' ? 'Noon' : s.time_of_day === 'evening' ? 'Evening' : s.time_of_day || '?';
    return `- ${s.product_name}|${s.dosage || '?'}|${time}${s.recommended_by_ai ? ' [AI]' : ''}`;
  }).join('\n');
}

// deno-lint-ignore no-explicit-any
function formatEnrichedProducts(products: any[]): string {
  if (!products.length) return "";
  // deno-lint-ignore no-explicit-any
  return products.map((p: any) => {
    const parts: string[] = [p.shopify_product_title];
    if (p.best_for_tags?.length) parts.push(`tags:${p.best_for_tags.slice(0, 4).join(',')}`);
    if (p.coach_tip) parts.push(`tip:${p.coach_tip.length > 60 ? p.coach_tip.slice(0, 60) + '…' : p.coach_tip}`);
    if (p.safety_warnings) {
      const w = p.safety_warnings as { contraindications?: string[] };
      if (w.contraindications?.length) parts.push(`⚠️${w.contraindications.slice(0, 2).join(';')}`);
    }
    return parts.join('|');
  }).join('\n');
}

// deno-lint-ignore no-explicit-any
function calculateTrends(checkins: any[]) {
  if (!checkins.length) return null;
  // deno-lint-ignore no-explicit-any
  const avg = (arr: any[], key: string) => {
    const vals = arr.filter(c => c[key] !== null).map(c => c[key]);
    return vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
  };
  return {
    avgSleep: avg(checkins, 'sleep_quality'),
    avgEnergy: avg(checkins, 'energy_level'),
    avgStress: avg(checkins, 'stress_level'),
    count: checkins.length,
    latestMood: checkins[0]?.mood || null
  };
}

// ============================================
// SYSTEM PROMPT — AUDIT-CORRECTED
// ============================================
function getBaseSystemPrompt(tier: ModelTier): string {
  const maxProducts = tier === 'lite' ? 1 : 2;

  let prompt = `You are VitaSync AI, a premium health & nutrition wellness coach. Respond in the user's language (English by default, French if user writes in French, etc.).

═══════════════════════════════════════════════
RULE 1 — SHIPPING ZONE (ABSOLUTE PRIORITY)
═══════════════════════════════════════════════
VitaSync ships EXCLUSIVELY within the United States via Supliful. Currency: USD only.
NEVER mention France, Europe, or any other country as a delivery zone.
If a user asks about shipping outside the US, respond EXACTLY:
"I'm sorry, VitaSync currently ships exclusively within the United States."
Do NOT suggest workarounds, forwarding services, or future international shipping plans.

═══════════════════════════════════════════════
RULE 2 — PRODUCT CATALOG (STRICT)
═══════════════════════════════════════════════
NEVER invent a VitaSync product name. ONLY recommend products that appear in the CATALOG section below.
If you are unsure about a product name, say: "Visit vitasync.co/shop for our full product range."
FORBIDDEN invented names include but are not limited to: OmegaFlow, MagVita, Focus Max, Sommeil Profond, Récup+, ZenMag, ImmunoPro, CardioVital, etc.
Always use the EXACT product title from the catalog.

═══════════════════════════════════════════════
RULE 3 — PRODUCT CLAIMS (NO UNVERIFIED CLAIMS)
═══════════════════════════════════════════════
NEVER claim a product is "lactose-free", "certified", "gluten-free", "highly dosed", "third-party tested", "organic", "vegan", or any similar claim UNLESS the information appears explicitly in the CATALOG or ENRICHED DATA below.
When unsure, ALWAYS say: "Please check the product label for ingredient specifics."

═══════════════════════════════════════════════
RULE 4 — MEDICAL DISCLAIMER (MANDATORY)
═══════════════════════════════════════════════
EVERY response MUST end with this exact disclaimer:
"As always, consult your healthcare provider before starting any new supplement, especially if you have a medical condition or take medications."

═══════════════════════════════════════════════
RULE 5 — RESPONSE FORMAT (TEMPLATE)
═══════════════════════════════════════════════
Every response MUST follow this structure:
1. Short greeting (1 line)
2. Restate the user's goal/question in your own words (1-2 lines)
3. 2-3 practical tips or advice
4. Maximum ${maxProducts} product recommendation(s) from the REAL catalog (use [[PRODUCT:...]] format)
5. Medical disclaimer (Rule 4)
6. 1 follow-up question to continue the conversation
Target length: 150-250 words. Avoid walls of text.

ROLE: Help users with health goals (energy, sleep, performance, nutrition), recommend relevant supplements from the real catalog${tier === 'lite' ? '.' : ', build personalized stacks.'}

CORE PRINCIPLES:
• SAFETY: Never diagnose. Wellness guidance only. Severe symptoms → doctor immediately.
• STYLE: Calm, premium, ${tier === 'lite' ? '4-6' : '6-10'} lines max. Emojis, Markdown headings (##/###), bullet lists, **bold**.
• SOFT CONVERSION: Value first. Max ${maxProducts} product${maxProducts > 1 ? 's' : ''}/response. "Here's an option" never "Buy now".
• US shipping only. USD only.

⚠️ MEDICAL SAFETY — ABSOLUTE RULES:
1. NEVER diagnose a disease, interpret symptoms like a doctor, or suggest stopping/modifying medical treatment.
2. PREGNANCY & BREASTFEEDING: If mentioned → "I strongly recommend consulting your doctor or OB-GYN before taking any supplement during pregnancy or breastfeeding." Do NOT recommend any product without this warning.
3. DRUG INTERACTIONS: If user mentions medications → always add "Check with your doctor or pharmacist for potential interactions with your current medications." before any recommendation.
4. SEVERE SYMPTOMS (chest pain, shortness of breath, bleeding, loss of consciousness, fever >102°F, acute persistent pain): STOP immediately → "⚠️ These symptoms require urgent medical attention. Please contact your doctor or call 911." Do NOT recommend any supplement.
5. CHRONIC CONDITIONS (diabetes, hypertension, heart/kidney/liver disease, autoimmune): Always mention "Given your condition, please consult your doctor before starting any new supplement."
6. SYSTEMATIC DISCLAIMER: Every response containing a product recommendation must end with the Rule 4 disclaimer.

DECISION ENGINE (each message):
1. Classify: Energy|Performance|Sleep|Nutrition|Product|Stack|Price|Shipping|Effects|Support
2. Risk: Low→normal, Medium(pregnancy,interactions,chronic conditions)→caution+disclaimer, High(severe symptoms)→STOP+doctor+911
3. Quiz not done→2-3 questions+starter reco+CTA quiz. Quiz done→use data.
4. Format: 💡Recommendation → 📖Why → ⏰How → ⚠️Cautions → 👉Next step

PRODUCT RECOMMENDATION — MANDATORY FORMAT:
[[PRODUCT:productId:variantId:name:price:timing:dosage:meal]]
• timing=morning|noon|afternoon|evening • dosage="1 capsule","5g" etc • meal=before|during|after
• Each [[PRODUCT:...]] on its own line, ALWAYS an empty line before and after each tag
• Max ${maxProducts} product${maxProducts > 1 ? 's' : ''}/response
• ⚠️ ABSOLUTE RULE: NEVER recommend the same product (same ProductID) twice in one response NOR in the conversation. Check previous messages before recommending.
• Do NOT recommend a product already in the user's active supplements
• ALLERGY CROSS-CHECK: Before EACH recommendation, check user allergies and conditions. If a product contains a listed allergen → DO NOT recommend and suggest an alternative.

BUDGET & PREFERENCES:
• If user has a defined budget → respect it strictly. Mention price and suggest cheaper alternatives if budget is tight.
• If user prefers certain forms (capsules, powder, liquid) → prioritize those forms.
• Sleep <3 → prioritize sleep • Energy <3 → boosters • Stress >3.5 → anti-stress`;

  // LITE: No stack, no subscription format
  if (tier !== 'lite') {
    prompt += `

MONTHLY SUBSCRIPTION (when asked):
[[SUBSCRIPTION_START]]
- Product: [Name] | VariantID: [gid://...] | Dose: [X]/day | Packs: [N]/month | Price: [XX.XX]$ (-10%) | Original: [YY.YY]$
[[SUBSCRIPTION_END]]
💰 TOTAL: [XXX.XX]$/month (savings [YY.YY]$)
Formula: packs=ceil(dose_per_day*30/pack_units), final_price=price*0.90

MONTHLY STACK (side panel):
• Add: [[STACK_ADD:productId:variantId:name:price:quantity]]
• Remove: [[STACK_REMOVE:productId]]
• Update: [[STACK_UPDATE:productId:quantity]]
• Clear: [[STACK_CLEAR]]
• ALWAYS ask for confirmation before adding
• After adding: "✅ Added to your stack!"`;
  }

  // LITE: Add restrictions notice
  if (tier === 'lite') {
    prompt += `

⚠️ LITE MODE RESTRICTIONS:
• You CANNOT generate interactive quizzes ([[QUIZ_START]])
• You CANNOT generate charts ([[CHART:...]])
• You CANNOT add to AI stack ([[STACK_ADD:...]], [[STACK_REMOVE:...]], [[STACK_UPDATE:...]], [[STACK_CLEAR]])
• You CANNOT generate interactive references ([[HEALTH_PROFILE]], [[MY_STACK]], etc.)
• If user asks for a quiz, chart, stack, or blood test analysis, say: "This feature is available with **VitaSync Standard** or **VitaSync Pro** 🚀. You can switch models at the top of the chat."
• Keep responses concise and direct.`;
  }

  return prompt;
}

// deno-lint-ignore no-explicit-any
function buildSystemPrompt(tier: ModelTier, userProfile: any, healthProfile: any, catalog: string, trends: any, supplements: any[], enrichedProducts: any[], checkins: any[], bloodTests: any[]): string {
  const parts: string[] = [getBaseSystemPrompt(tier)];

  // Catalog — all tiers get it
  parts.push(`\n\nCATALOG:\n${catalog}`);

  // User context — all tiers get full profile
  const ctx: string[] = [];
  if (userProfile?.first_name) ctx.push(`Name: ${userProfile.first_name}`);
  const quizDone = healthProfile?.onboarding_completed === true;
  ctx.push(`Quiz: ${quizDone ? 'YES' : 'NO → suggest quiz'}`);
  if (healthProfile) {
    const h = healthProfile;
    if (h.age_range) ctx.push(`Age: ${h.age_range}`);
    if (h.health_goals?.length) ctx.push(`Goals: ${h.health_goals.join(', ')}`);
    if (h.current_issues?.length) ctx.push(`Issues: ${h.current_issues.join(', ')}`);
    if (h.activity_level) ctx.push(`Activity: ${h.activity_level}`);
    if (h.diet_type) ctx.push(`Diet: ${h.diet_type}`);
    if (h.allergies?.length) ctx.push(`⚠️ALLERGIES: ${h.allergies.join(', ')}`);
    if (h.medical_conditions?.length) ctx.push(`⚠️CONDITIONS: ${h.medical_conditions.join(', ')}`);
    if (h.monthly_budget) ctx.push(`Budget: ${h.monthly_budget}`);
    if (h.preferred_forms?.length) ctx.push(`Forms: ${h.preferred_forms.join(', ')}`);
  }
  if (ctx.length) parts.push(`\nPROFILE:\n${ctx.join('\n')}`);

  // Trends — all tiers
  if (trends) {
    let t = `\n📊 TRACKING (${trends.count}d): Sleep ${trends.avgSleep.toFixed(1)}/5, Energy ${trends.avgEnergy.toFixed(1)}/5, Stress ${trends.avgStress.toFixed(1)}/5`;
    if (trends.latestMood) t += `, Mood: ${trends.latestMood}`;
    const alerts: string[] = [];
    if (trends.avgSleep < 3) alerts.push('🚨 Low sleep');
    if (trends.avgEnergy < 3) alerts.push('🚨 Low energy');
    if (trends.avgStress > 3.5) alerts.push('🚨 High stress');
    if (alerts.length) t += `\n${alerts.join(' | ')}`;
    parts.push(t);
  }

  // Current supplements — all tiers
  parts.push(`\nACTIVE SUPPLEMENTS:\n${formatSupplements(supplements)}`);

  // Raw check-in data — standard & pro only
  if (tier !== 'lite' && checkins.length > 0) {
    // deno-lint-ignore no-explicit-any
    const lines = checkins.slice(0, 30).map((c: any) => {
      const p: string[] = [];
      if (c.sleep_quality !== null) p.push(`s=${c.sleep_quality}`);
      if (c.energy_level !== null) p.push(`e=${c.energy_level}`);
      if (c.stress_level !== null) p.push(`st=${c.stress_level}`);
      if (c.mood) p.push(`m=${c.mood}`);
      return `${c.checkin_date}:${p.join(',')}`;
    });
    parts.push(`\nRAW CHECK-INS (${checkins.length}d):\n${lines.join('\n')}\n⚠️ Use this real data for charts.`);
  }

  // Blood tests — pro only
  if (tier === 'pro' && bloodTests.length > 0) {
    // deno-lint-ignore no-explicit-any
    const btLines = bloodTests.map((bt: any) => {
      const defs = Array.isArray(bt.deficiencies) ? bt.deficiencies.map((d: any) => d.name || '').filter(Boolean).join(',') : '';
      return `${bt.file_name}|${bt.status}${defs ? `|Deficiencies:${defs}` : ''}`;
    });
    parts.push(`\n🩸 ANALYSES (${bloodTests.length}):\n${btLines.join('\n')}`);
  }

  // Enriched products / science — pro only
  if (tier === 'pro' && enrichedProducts.length > 0) {
    parts.push(`\nSCIENCE BASE (${enrichedProducts.length} entries):\n${formatEnrichedProducts(enrichedProducts)}`);
  }

  // QUIZ — standard & pro
  if (tier !== 'lite') {
    parts.push(`\n\nINTERACTIVE QUIZ — STRICT RULES:
• Only generate a quiz if the user explicitly asks for one
• EXACT format (no Markdown between tags, each question on ONE line):
[[QUIZ_START]]
TITLE: Quiz title
Q1: What is your question? | Option A | Option B | Option C | Option D
Q2: Another question? | Choice 1 | Choice 2 | Choice 3 | Choice 4
[[QUIZ_END]]
• Max 10 questions, exactly 4 options each
• NO text between [[QUIZ_START]] and [[QUIZ_END]] other than TITLE and Q1-Q10
• Separator between question and options is |`);
  }

  // CHARTS & REFERENCES — standard & pro
  if (tier !== 'lite') {
    parts.push(`\n\nCHARTS (single-line format):
[[CHART:type:{"title":"...","data":[...],"xKey":"...","yKeys":["..."]}]]
Types: bar, line, pie. Max 2/response. Use real check-in data.`);

    if (tier === 'pro') {
      parts.push(`\nINTERACTIVE REFERENCES:
[[HEALTH_PROFILE]] [[MY_STACK]] [[PRODUCT_DETAIL:title]] [[BLOOD_TEST:id]] [[REPORT:stack|health]]
Max 3 blocks/response.`);
    } else {
      parts.push(`\nINTERACTIVE REFERENCES:
[[HEALTH_PROFILE]] [[MY_STACK]] [[PRODUCT_DETAIL:title]]
Max 2 blocks/response. [[BLOOD_TEST]] and [[REPORT]] are reserved for VitaSync Pro.`);
    }
  }

  return parts.join('');
}

// Input validation
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 8000;

function validateMessages(messages: unknown): { valid: boolean; error?: string; data?: { role: string; content: string }[] } {
  if (!Array.isArray(messages) || messages.length === 0) return { valid: false, error: "Invalid messages" };
  if (messages.length > MAX_MESSAGES) return { valid: false, error: `Max ${MAX_MESSAGES} messages` };

  const validated: { role: string; content: string }[] = [];
  for (const msg of messages) {
    if (!msg?.role || !['user', 'assistant'].includes(msg.role)) return { valid: false, error: "Invalid role" };
    const content = typeof msg.content === 'string' ? msg.content.trim() : '';
    if (!content || content.length > MAX_MESSAGE_LENGTH) return { valid: false, error: "Invalid content" };
    validated.push({ role: msg.role, content });
  }
  return { valid: true, data: validated };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  console.log("=== AI Coach request received ===");

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
    }

    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error("Auth failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
    }

    const userId = user.id;
    console.log("User:", userId);

    // Parse body with try/catch (Audit fix: PARAMÈTRE TECHNIQUE 3)
    let requestBody: Record<string, unknown>;
    try {
      requestBody = await req.json();
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr instanceof Error ? parseErr.message : String(parseErr));
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
    }

    const requestedModel = (requestBody.model as string) || 'google/gemini-2.5-flash';
    // Audit fix: Model migration — drop deprecated models, map to current ones
    const MODEL_MIGRATION: Record<string, string> = {
      'google/gemini-3-pro-preview': 'google/gemini-3.1-pro-preview',
      'google/gemini-3-flash-preview': 'google/gemini-2.5-flash',  // Audit: replace 3-flash with 2.5-flash
      'google/gemini-2.5-flash-lite': 'google/gemini-2.5-flash-lite', // keep lite
    };
    const migratedModel = MODEL_MIGRATION[requestedModel] || requestedModel;
    // Audit fix: Allowed models updated — free=2.5-flash-lite, standard=2.5-flash, pro=3.1-pro
    const ALLOWED_MODELS = ['google/gemini-2.5-flash-lite', 'google/gemini-2.5-flash', 'google/gemini-3.1-pro-preview'];
    const model = ALLOWED_MODELS.includes(migratedModel) ? migratedModel : 'google/gemini-2.5-flash';
    console.log(`Requested model: ${requestedModel}, Resolved: ${model}`);

    // Determine tier
    const tier = getModelTier(model);
    const tierConfig = TIER_CONFIG[tier];
    console.log(`Model: ${model}, Tier: ${tier}, maxTokens: ${tierConfig.maxTokens}, msgSlice: ${tierConfig.messageSlice}, historyDays: ${tierConfig.historyDays}`);

    // Validate messages
    const validation = validateMessages(requestBody.messages);
    if (!validation.valid || !validation.data) {
      return new Response(JSON.stringify({ error: validation.error }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
    }

    // Truncate messages based on tier
    const messages = validation.data.slice(-tierConfig.messageSlice);
    console.log(`Messages: ${validation.data.length} → ${messages.length} (tier: ${tier})`);

    // Fetch all data in parallel
    const serviceClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const fetchPromises: Promise<unknown>[] = [
      supabaseClient.from("profiles").select("first_name, last_name").eq("user_id", userId).single(),
      supabaseClient.from("user_health_profiles").select("*").eq("user_id", userId).single(),
      fetchRecentCheckins(supabaseClient, userId, tierConfig.historyDays),
      fetchShopifyCatalog(),
      fetchUserSupplements(supabaseClient, userId),
    ];

    if (tier === 'pro') {
      fetchPromises.push(fetchEnrichedProductData(serviceClient));
    } else {
      fetchPromises.push(Promise.resolve([]));
    }

    if (tier === 'pro') {
      fetchPromises.push(fetchBloodTestAnalyses(supabaseClient, userId));
    } else {
      fetchPromises.push(Promise.resolve([]));
    }

    const [profileRes, healthRes, checkins, catalog, supplements, enriched, bloodTests] = await Promise.all(fetchPromises) as [
      // deno-lint-ignore no-explicit-any
      any, any, any[], string, any[], any[], any[]
    ];

    console.log("Data loaded. Tier:", tier, "Supplements:", supplements.length);

    const trends = calculateTrends(checkins);
    const systemPrompt = buildSystemPrompt(
      tier,
      (profileRes as { data: unknown }).data,
      (healthRes as { data: unknown }).data,
      catalog as unknown as string,
      trends,
      supplements,
      enriched,
      checkins,
      bloodTests
    );

    console.log("System prompt:", systemPrompt.length, "chars. Model:", model, "Tier:", tier);

    // Gateway call
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    let response: Response;
    try {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: systemPrompt }, ...messages.map(m => ({ role: m.role, content: m.content }))],
          stream: true,
          max_tokens: tierConfig.maxTokens,
        }),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      console.error("Gateway fetch failed:", msg);
      const isAbort = msg.includes('abort') || msg.includes('signal');
      return new Response(
        JSON.stringify({ error: isAbort ? "The AI service is taking too long. Please try again." : `Network error: ${msg}` }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gateway error:", response.status, errorText);
      
      // Model deprecated or not found — try fallback
      if (response.status === 404 || response.status === 410) {
        console.warn(`Model ${model} unavailable (${response.status}), falling back to gemini-2.5-flash`);
        const fallbackResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [{ role: "system", content: systemPrompt }, ...messages.map(m => ({ role: m.role, content: m.content }))],
            stream: true,
            max_tokens: tierConfig.maxTokens,
          }),
        });
        if (fallbackResponse.ok) {
          console.log("Fallback model succeeded");
          return new Response(fallbackResponse.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream; charset=utf-8" } });
        }
        console.error("Fallback also failed:", fallbackResponse.status);
      }
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "⏳ Too many requests. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "💳 AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
      }
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
    }

    console.log("Streaming response to client. Tier:", tier);
    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream; charset=utf-8" } });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("AI coach error:", msg);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json; charset=utf-8" } }
    );
  }
});
