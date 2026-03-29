// AI Coach Edge Function - VitaSync Premium
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://vitasyncai.lovable.app",
  "https://id-preview--7f75c63b-4202-49a9-a875-e20700f8a0c8.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}

// ============================================
// MODEL TIERING
// ============================================
type ModelTier = 'lite' | 'standard' | 'pro';

function getModelTier(model: string): ModelTier {
  if (model === 'google/gemini-2.5-flash-lite') return 'lite';
  if (model === 'google/gemini-3.1-pro-preview') return 'pro';
  return 'standard'; // gemini-3-flash-preview or fallback
}

const TIER_CONFIG: Record<ModelTier, { maxTokens: number; messageSlice: number; historyDays: number }> = {
  lite:     { maxTokens: 2048,  messageSlice: 10, historyDays: 7 },
  standard: { maxTokens: 8192,  messageSlice: 20, historyDays: 90 },
  pro:      { maxTokens: 16384, messageSlice: 20, historyDays: 90 },
};

// Shopify config
const SHOPIFY_STORE_DOMAIN = "vitasync2.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

async function fetchShopifyCatalog(): Promise<string> {
  const storefrontToken = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  if (!storefrontToken) {
    console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN not configured");
    return "Catalogue non disponible.";
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
      return "Catalogue non disponible.";
    }

    const data = await response.json();
    const products = data?.data?.products?.edges || [];
    if (products.length === 0) return "Aucun produit.";

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

    return `CATALOGUE (${products.length}) — Nom|PID|VID|Prix|Stock|Tags\n${allProducts.join('\n')}\nFormat reco: [[PRODUCT:productId:variantId:nom:prix:moment:dosage:repas]]`;
  } catch (error) {
    console.error("Error fetching Shopify catalog:", error);
    return "Catalogue non disponible.";
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
  if (!supplements.length) return "Aucun.";
  // deno-lint-ignore no-explicit-any
  return supplements.map((s: any) => {
    const time = s.time_of_day === 'morning' ? 'Matin' : s.time_of_day === 'noon' ? 'Midi' : s.time_of_day === 'evening' ? 'Soir' : s.time_of_day || '?';
    return `- ${s.product_name}|${s.dosage || '?'}|${time}${s.recommended_by_ai ? ' [IA]' : ''}`;
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
// SYSTEM PROMPT — TIERED
// ============================================
function getBaseSystemPrompt(tier: ModelTier): string {
  const maxProducts = tier === 'lite' ? 1 : 2;

  let prompt = `Tu es VitaSync AI, coach santé & nutrition premium. Français obligatoire.

RÔLE: Aider les utilisateurs avec objectifs santé (énergie, sommeil, performance, nutrition), proposer compléments pertinents${tier === 'lite' ? '.' : ', construire stacks personnalisés.'}

PRINCIPES:
• SÉCURITÉ: Jamais diagnostiquer. Bien-être uniquement. Symptômes graves → médecin.
• STYLE: Calme, premium, ${tier === 'lite' ? '4-6' : '6-10'} lignes max. Emojis, titres Markdown (##/###), listes à puces, **gras**.
• CONVERSION SOFT: Valeur d'abord. Max ${maxProducts} produit${maxProducts > 1 ? 's' : ''}/réponse. "Voici ${maxProducts > 1 ? '2 options' : 'une option'}" jamais "Achète maintenant".
• Vente USA uniquement.

⚠️ SÉCURITÉ MÉDICALE — RÈGLES ABSOLUES:
1. JAMAIS diagnostiquer une maladie, interpréter des symptômes comme un médecin, ou suggérer d'arrêter/modifier un traitement médical.
2. GROSSESSE & ALLAITEMENT: Si mentionné → "Je te recommande vivement de consulter ton médecin ou gynécologue avant de prendre tout complément pendant la grossesse/l'allaitement." NE PAS recommander de produit sans cette mention.
3. INTERACTIONS MÉDICAMENTEUSES: Si l'utilisateur mentionne des médicaments → toujours ajouter "Vérifie avec ton médecin ou pharmacien qu'il n'y a pas d'interaction avec ton traitement." avant toute recommandation.
4. SYMPTÔMES GRAVES (douleur thoracique, essoufflement, saignement, perte de conscience, fièvre >39°C, douleur aiguë persistante): STOP immédiat → "⚠️ Ces symptômes nécessitent une consultation médicale urgente. Contacte ton médecin ou le 15 (SAMU)." NE PAS recommander de complément.
5. CONDITIONS CHRONIQUES (diabète, hypertension, maladie cardiaque, rénale, hépatique, auto-immune): Toujours mentionner "Étant donné ta condition, consulte ton médecin avant de commencer un nouveau complément."
6. DISCLAIMER SYSTÉMATIQUE: Chaque réponse contenant une recommandation produit doit se terminer par une ligne "💡 *Ces conseils ne remplacent pas un avis médical professionnel.*"

MOTEUR DE DÉCISION (chaque message):
1. Classifier: Énergie|Performance|Sommeil|Nutrition|Produit|Stack|Prix|Shipping|Effets|Support
2. Risque: Low→normal, Medium(grossesse,interactions,conditions chroniques)→prudence+disclaimer, High(symptômes graves)→STOP+médecin+SAMU
3. Quiz non fait→2-3 questions+reco starter+CTA quiz. Quiz fait→utiliser données.
4. Format: 💡Reco → 📖Pourquoi → ⏰Comment → ⚠️Précautions → 👉Next step

RECOMMANDATION PRODUIT - FORMAT OBLIGATOIRE:
[[PRODUCT:productId:variantId:nom:prix:moment:dosage:repas]]
• moment=morning|noon|afternoon|evening • dosage="1 gélule","5g" etc • repas=before|during|after
• Chaque [[PRODUCT:...]] sur sa propre ligne, TOUJOURS une ligne vide avant et après chaque tag
• Max ${maxProducts} produit${maxProducts > 1 ? 's' : ''}/réponse
• ⚠️ RÈGLE ABSOLUE : Ne recommande JAMAIS 2 fois le même produit (même ProductID) dans une même réponse NI dans la conversation. Vérifie les messages précédents avant de recommander.
• Ne recommande PAS un produit déjà dans les compléments actifs de l'utilisateur
• CROSS-CHECK ALLERGIES: Avant CHAQUE recommandation, vérifie les allergies et conditions de l'utilisateur. Si un produit contient un allergène listé → NE PAS recommander et proposer une alternative.

PERSONNALISATION BUDGET & PRÉFÉRENCES:
• Si l'utilisateur a un budget défini → respecte-le strictement. Mentionne le prix et propose des alternatives moins chères si le budget est serré.
• Si l'utilisateur préfère certaines formes (gélules, poudre, liquide) → priorise ces formes.
• Sommeil <3 → priorise sommeil • Énergie <3 → boosters • Stress >3.5 → anti-stress`;

  // LITE: No stack, no subscription format
  if (tier !== 'lite') {
    prompt += `

ABONNEMENT MENSUEL (quand demandé):
[[SUBSCRIPTION_START]]
- Produit: [Nom] | VariantID: [gid://...] | Dose: [X]/jour | Packs: [N]/mois | Prix: [XX.XX]$ (-10%) | Original: [YY.YY]$
[[SUBSCRIPTION_END]]
💰 TOTAL: [XXX.XX]$/mois (économie [YY.YY]$)
Formule: packs=ceil(dose_per_day*30/pack_units), prix_final=prix*0.90

STACK MENSUEL (panneau latéral):
• Ajouter: [[STACK_ADD:productId:variantId:nom:prix:quantité]]
• Retirer: [[STACK_REMOVE:productId]]
• Modifier: [[STACK_UPDATE:productId:quantité]]
• Vider: [[STACK_CLEAR]]
• TOUJOURS demander confirmation avant d'ajouter
• Après ajout: "✅ Ajouté à ton stack !"`;
  }

  // LITE: Add restrictions notice
  if (tier === 'lite') {
    prompt += `

⚠️ RESTRICTIONS MODE LITE:
• Tu ne peux PAS générer de quiz interactifs ([[QUIZ_START]])
• Tu ne peux PAS générer de graphiques ([[CHART:...]])
• Tu ne peux PAS ajouter au stack IA ([[STACK_ADD:...]], [[STACK_REMOVE:...]], [[STACK_UPDATE:...]], [[STACK_CLEAR]])
• Tu ne peux PAS générer de références interactives ([[HEALTH_PROFILE]], [[MY_STACK]], etc.)
• Si l'utilisateur demande un quiz, un graphique, un stack ou une analyse sanguine, dis-lui : "Cette fonctionnalité est disponible avec **VitaSync 3 Flash** ou **VitaSync 3 Pro** 🚀. Tu peux changer de modèle en haut du chat."
• Réponds de manière concise et directe.`;
  }

  return prompt;
}

// deno-lint-ignore no-explicit-any
function buildSystemPrompt(tier: ModelTier, userProfile: any, healthProfile: any, catalog: string, trends: any, supplements: any[], enrichedProducts: any[], checkins: any[], bloodTests: any[]): string {
  const parts: string[] = [getBaseSystemPrompt(tier)];

  // Catalog — all tiers get it
  parts.push(`\n\nCATALOGUE:\n${catalog}`);

  // User context — all tiers get full profile
  const ctx: string[] = [];
  if (userProfile?.first_name) ctx.push(`Prénom: ${userProfile.first_name}`);
  const quizDone = healthProfile?.onboarding_completed === true;
  ctx.push(`Quiz: ${quizDone ? 'OUI' : 'NON → proposer quiz'}`);
  if (healthProfile) {
    const h = healthProfile;
    if (h.age_range) ctx.push(`Âge: ${h.age_range}`);
    if (h.health_goals?.length) ctx.push(`Objectifs: ${h.health_goals.join(', ')}`);
    if (h.current_issues?.length) ctx.push(`Problèmes: ${h.current_issues.join(', ')}`);
    if (h.activity_level) ctx.push(`Activité: ${h.activity_level}`);
    if (h.diet_type) ctx.push(`Alimentation: ${h.diet_type}`);
    if (h.allergies?.length) ctx.push(`⚠️ALLERGIES: ${h.allergies.join(', ')}`);
    if (h.medical_conditions?.length) ctx.push(`⚠️CONDITIONS: ${h.medical_conditions.join(', ')}`);
    if (h.monthly_budget) ctx.push(`Budget: ${h.monthly_budget}`);
    if (h.preferred_forms?.length) ctx.push(`Formes: ${h.preferred_forms.join(', ')}`);
  }
  if (ctx.length) parts.push(`\nPROFIL:\n${ctx.join('\n')}`);

  // Trends — all tiers
  if (trends) {
    let t = `\n📊 SUIVI (${trends.count}j): Sommeil ${trends.avgSleep.toFixed(1)}/5, Énergie ${trends.avgEnergy.toFixed(1)}/5, Stress ${trends.avgStress.toFixed(1)}/5`;
    if (trends.latestMood) t += `, Humeur: ${trends.latestMood}`;
    const alerts: string[] = [];
    if (trends.avgSleep < 3) alerts.push('🚨 Sommeil bas');
    if (trends.avgEnergy < 3) alerts.push('🚨 Énergie basse');
    if (trends.avgStress > 3.5) alerts.push('🚨 Stress élevé');
    if (alerts.length) t += `\n${alerts.join(' | ')}`;
    parts.push(t);
  }

  // Current supplements — all tiers
  parts.push(`\nCOMPLÉMENTS ACTIFS:\n${formatSupplements(supplements)}`);

  // Raw check-in data — standard & pro only (lite gets only trends above)
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
    parts.push(`\nCHECK-INS BRUTS (${checkins.length}j):\n${lines.join('\n')}\n⚠️ Utilise ces vraies données pour les graphiques.`);
  }

  // Blood tests — pro only
  if (tier === 'pro' && bloodTests.length > 0) {
    // deno-lint-ignore no-explicit-any
    const btLines = bloodTests.map((bt: any) => {
      const defs = Array.isArray(bt.deficiencies) ? bt.deficiencies.map((d: any) => d.name || '').filter(Boolean).join(',') : '';
      return `${bt.file_name}|${bt.status}${defs ? `|Carences:${defs}` : ''}`;
    });
    parts.push(`\n🩸 ANALYSES (${bloodTests.length}):\n${btLines.join('\n')}`);
  }

  // Enriched products / science — pro only
  if (tier === 'pro' && enrichedProducts.length > 0) {
    parts.push(`\nBASE SCIENTIFIQUE (${enrichedProducts.length} fiches):\n${formatEnrichedProducts(enrichedProducts)}`);
  }

  // QUIZ — standard & pro
  if (tier !== 'lite') {
    parts.push(`\n\nQUIZ INTERACTIF — RÈGLES STRICTES:
• Ne génère un quiz QUE si l'utilisateur le demande explicitement
• Format EXACT (pas de Markdown entre les tags, chaque question sur UNE seule ligne):
[[QUIZ_START]]
TITLE: Titre du quiz
Q1: Quelle est ta question ? | Option A | Option B | Option C | Option D
Q2: Autre question ? | Choix 1 | Choix 2 | Choix 3 | Choix 4
[[QUIZ_END]]
• Max 10 questions, exactement 4 options chacune
• PAS de texte entre [[QUIZ_START]] et [[QUIZ_END]] autre que TITLE et Q1-Q10
• Le séparateur entre question et options est |`);
  }

  // CHARTS & REFERENCES — standard & pro
  if (tier !== 'lite') {
    parts.push(`\n\nGRAPHIQUES (format sur 1 ligne):
[[CHART:type:{"title":"...","data":[...],"xKey":"...","yKeys":["..."]}]]
Types: bar, line, pie. Max 2/réponse. Utilise les vraies données check-in.`);

    // References — standard gets partial, pro gets all
    if (tier === 'pro') {
      parts.push(`\nRÉFÉRENCES INTERACTIVES:
[[HEALTH_PROFILE]] [[MY_STACK]] [[PRODUCT_DETAIL:titre]] [[BLOOD_TEST:id]] [[REPORT:stack|health]]
Max 3 blocs/réponse.`);
    } else {
      parts.push(`\nRÉFÉRENCES INTERACTIVES:
[[HEALTH_PROFILE]] [[MY_STACK]] [[PRODUCT_DETAIL:titre]]
Max 2 blocs/réponse. Les références [[BLOOD_TEST]] et [[REPORT]] sont réservées à VitaSync 3 Pro.`);
    }
  }

  return parts.join('');
}

// Input validation
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 8000;

function validateMessages(messages: unknown): { valid: boolean; error?: string; data?: { role: string; content: string }[] } {
  if (!Array.isArray(messages) || messages.length === 0) return { valid: false, error: "Messages invalides" };
  if (messages.length > MAX_MESSAGES) return { valid: false, error: `Max ${MAX_MESSAGES} messages` };

  const validated: { role: string; content: string }[] = [];
  for (const msg of messages) {
    if (!msg?.role || !['user', 'assistant'].includes(msg.role)) return { valid: false, error: "Rôle invalide" };
    const content = typeof msg.content === 'string' ? msg.content.trim() : '';
    if (!content || content.length > MAX_MESSAGE_LENGTH) return { valid: false, error: "Contenu invalide" };
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error("Auth failed:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = user.id;
    console.log("User:", userId);

    // Parse body
    let requestBody: Record<string, unknown>;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "JSON invalide" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const requestedModel = (requestBody.model as string) || 'google/gemini-3-flash-preview';
    const ALLOWED_MODELS = ['google/gemini-2.5-flash-lite', 'google/gemini-3-flash-preview', 'google/gemini-3-pro-preview'];
    const model = ALLOWED_MODELS.includes(requestedModel) ? requestedModel : 'google/gemini-3-flash-preview';

    // Determine tier
    const tier = getModelTier(model);
    const tierConfig = TIER_CONFIG[tier];
    console.log(`Model: ${model}, Tier: ${tier}, maxTokens: ${tierConfig.maxTokens}, msgSlice: ${tierConfig.messageSlice}, historyDays: ${tierConfig.historyDays}`);

    // Validate messages
    const validation = validateMessages(requestBody.messages);
    if (!validation.valid || !validation.data) {
      return new Response(JSON.stringify({ error: validation.error }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Truncate messages based on tier
    const messages = validation.data.slice(-tierConfig.messageSlice);
    console.log(`Messages: ${validation.data.length} → ${messages.length} (tier: ${tier})`);

    // Fetch all data in parallel
    const serviceClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // Only fetch what the tier needs
    const fetchPromises: Promise<unknown>[] = [
      supabaseClient.from("profiles").select("first_name, last_name").eq("user_id", userId).single(),
      supabaseClient.from("user_health_profiles").select("*").eq("user_id", userId).single(),
      fetchRecentCheckins(supabaseClient, userId, tierConfig.historyDays),
      fetchShopifyCatalog(),
      fetchUserSupplements(supabaseClient, userId),
    ];

    // Enriched data — pro only
    if (tier === 'pro') {
      fetchPromises.push(fetchEnrichedProductData(serviceClient));
    } else {
      fetchPromises.push(Promise.resolve([]));
    }

    // Blood tests — pro only
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
        JSON.stringify({ error: isAbort ? "Le service IA met trop de temps. Réessaie." : `Erreur réseau: ${msg}` }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "⏳ Trop de requêtes. Réessaie dans quelques instants." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "💳 Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Streaming response to client. Tier:", tier);
    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("AI coach error:", msg);
    return new Response(
      JSON.stringify({ error: "Une erreur interne s'est produite. Réessaie." }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
