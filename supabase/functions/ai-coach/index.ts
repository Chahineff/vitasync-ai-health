// AI Coach Edge Function - VitaSync Premium
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const query = `
      query {
        products(first: 100) {
          edges {
            node {
              id
              title
              description
              productType
              tags
              vendor
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.error("Shopify API error:", response.status);
      return "Catalogue non disponible.";
    }

    const data = await response.json();
    const products = data?.data?.products?.edges || [];

    if (products.length === 0) {
      return "Aucun produit dans le catalogue.";
    }

    // Categorize products by type
    const categories: Record<string, string[]> = {
      "📦 PROTÉINES & MUSCLES": [],
      "💊 VITAMINES & MINÉRAUX": [],
      "🧠 NOOTROPIQUES & FOCUS": [],
      "😴 SOMMEIL & RELAXATION": [],
      "⚡ ÉNERGIE & PRE-WORKOUT": [],
      "🏋️ PERFORMANCE & RÉCUPÉRATION": [],
      "🍃 SANTÉ GÉNÉRALE": [],
    };

    // Format catalog for the prompt with pack units estimation
    const allProducts = products.map((edge: { node: { id: string; title: string; description: string; productType: string; tags: string[]; vendor: string; variants: { edges: Array<{ node: { id: string; price: { amount: string; currencyCode: string }; availableForSale: boolean } }> } } }) => {
      const p = edge.node;
      const variant = p.variants.edges[0]?.node;
      const price = variant?.price?.amount || '0';
      const productId = p.id.split('/').pop();
      const variantId = variant?.id || '';
      const inStock = variant?.availableForSale ? '✓ En stock' : '⚠ Rupture';
      const tags = p.tags || [];
      
      // Estimate pack_units based on product type
      let packUnits = 30; // Default
      const title = p.title.toLowerCase();
      const productType = (p.productType || '').toLowerCase();
      
      if (title.includes('powder') || title.includes('poudre') || title.includes('whey') || title.includes('pre-workout')) {
        packUnits = 30; // ~30 scoops
      } else if (title.includes('capsule') || title.includes('gummies') || title.includes('omega') || title.includes('vitamin')) {
        packUnits = 60; // Often 60 capsules
      }
      
      // Categorize
      let category = "🍃 SANTÉ GÉNÉRALE";
      if (productType.includes('protein') || title.includes('whey') || title.includes('protéine') || title.includes('creatine')) {
        category = "📦 PROTÉINES & MUSCLES";
      } else if (productType.includes('vitamin') || title.includes('vitamin') || title.includes('zinc') || title.includes('magnes')) {
        category = "💊 VITAMINES & MINÉRAUX";
      } else if (title.includes('focus') || title.includes('nootropic') || title.includes('brain') || title.includes('alpha-gpc') || title.includes('lion')) {
        category = "🧠 NOOTROPIQUES & FOCUS";
      } else if (title.includes('sleep') || title.includes('sommeil') || title.includes('melatonin') || title.includes('5-htp') || title.includes('ashwagandha')) {
        category = "😴 SOMMEIL & RELAXATION";
      } else if (title.includes('pre-workout') || title.includes('energy') || title.includes('caffeine') || title.includes('boost')) {
        category = "⚡ ÉNERGIE & PRE-WORKOUT";
      } else if (title.includes('bcaa') || title.includes('recovery') || title.includes('glutamine') || title.includes('collagen')) {
        category = "🏋️ PERFORMANCE & RÉCUPÉRATION";
      }
      
      const productLine = `- ${p.title} | ${inStock} | ${price}$ | ~${packUnits} doses
    ProductID: ${productId} | VariantID: ${variantId}
    Tags: ${tags.slice(0, 3).join(', ') || 'N/A'}
    Pour recommander: [[PRODUCT:${productId}:${variantId}:${p.title}:${price}]]`;
      
      // Add to category
      if (categories[category]) {
        categories[category].push(productLine);
      } else {
        categories["🍃 SANTÉ GÉNÉRALE"].push(productLine);
      }
      
      return productLine;
    });

    // Build categorized output
    const categorizedCatalog = Object.entries(categories)
      .filter(([_, items]) => items.length > 0)
      .map(([category, items]) => `${category}:\n${items.join('\n\n')}`)
      .join('\n\n═══════════════════════════════════════════════\n\n');

    return `CATALOGUE VITASYNC (${products.length} produits disponibles)
═══════════════════════════════════════════════

${categorizedCatalog}

═══════════════════════════════════════════════
RAPPEL: Utilise [[PRODUCT:id:variantId:nom:prix]] pour recommander`;
  } catch (error) {
    console.error("Error fetching Shopify catalog:", error);
    return "Catalogue non disponible.";
  }
}

// Fetch recent check-ins for the user (last 7 days)
interface DailyCheckin {
  sleep_quality: number | null;
  energy_level: number | null;
  stress_level: number | null;
  mood: string | null;
  checkin_date: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchRecentCheckins(supabase: any, userId: string): Promise<DailyCheckin[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const { data, error } = await supabase
    .from("daily_checkins")
    .select("sleep_quality, energy_level, stress_level, mood, checkin_date")
    .eq("user_id", userId)
    .gte("checkin_date", startDate.toISOString().split("T")[0])
    .order("checkin_date", { ascending: false });

  if (error) {
    console.error("Error fetching check-ins:", error);
    return [];
  }

  return data || [];
}

// Calculate trends from check-ins
interface Trends {
  avgSleep: number;
  avgEnergy: number;
  avgStress: number;
  count: number;
  latestMood: string | null;
}

function calculateTrends(checkins: DailyCheckin[]): Trends | null {
  if (!checkins.length) return null;

  const sleepValues = checkins.filter(c => c.sleep_quality !== null).map(c => c.sleep_quality!);
  const energyValues = checkins.filter(c => c.energy_level !== null).map(c => c.energy_level!);
  const stressValues = checkins.filter(c => c.stress_level !== null).map(c => c.stress_level!);

  const avgSleep = sleepValues.length > 0 
    ? sleepValues.reduce((sum, v) => sum + v, 0) / sleepValues.length 
    : 0;
  const avgEnergy = energyValues.length > 0 
    ? energyValues.reduce((sum, v) => sum + v, 0) / energyValues.length 
    : 0;
  const avgStress = stressValues.length > 0 
    ? stressValues.reduce((sum, v) => sum + v, 0) / stressValues.length 
    : 0;

  return {
    avgSleep,
    avgEnergy,
    avgStress,
    count: checkins.length,
    latestMood: checkins[0]?.mood || null
  };
}

// ============================================
// NEW PREMIUM SYSTEM PROMPT
// ============================================
const baseSystemPrompt = `Tu es VitaSync AI, un coach santé & nutrition (bien-être) premium.

═══════════════════════════════════════════════════════════════
RÔLE
═══════════════════════════════════════════════════════════════
Tu aides les utilisateurs à :
• Clarifier leurs objectifs (énergie, performance, sommeil, nutrition)
• Proposer un plan d'action simple (habitudes + compléments si pertinent)
• Construire un stack personnalisé sans être vendeur agressif
• Guider vers le Quiz 10 questions pour personnalisation poussée

═══════════════════════════════════════════════════════════════
CONTEXTE BUSINESS
═══════════════════════════════════════════════════════════════
• Vente USA uniquement (catalogue & fulfillment USA)
• Produits : compléments alimentaires (bien-être), PAS de médicaments
• Tu n'es PAS un "closer" : tu conseilles d'abord, puis proposes des options

═══════════════════════════════════════════════════════════════
PRINCIPES NON-NÉGOCIABLES
═══════════════════════════════════════════════════════════════

1️⃣ SÉCURITÉ (priorité absolue)
   • Ne JAMAIS diagnostiquer ni affirmer "tu as X"
   • Rester en "bien-être / éducation / organisation"
   • Si symptômes inquiétants → recommander un professionnel de santé

2️⃣ STYLE DE RÉPONSE
   • Ton : calme, premium, simple, rassurant
   • Structure : réponse courte → options → next step
   • Max 6-10 lignes avant de proposer "je peux détailler"
   • Français obligatoire

3️⃣ CONVERSION SOFT (jamais agressif)
   • Priorité : valeur & confiance
   • CTA doux :
     - "Je peux affiner via le quiz 10 questions"
     - "Voici 2 options (starter vs optimal), tu préfères laquelle ?"
     - "Tu veux que je l'ajoute à ton pack ?"

═══════════════════════════════════════════════════════════════
MOTEUR DE DÉCISION (exécuter à chaque message)
═══════════════════════════════════════════════════════════════

A. CLASSIFIER L'INTENTION
   Catégories : Énergie/fatigue | Performance sportive | Sommeil | 
   Nutrition/poids/muscle | Question produit | Stack complet | 
   Prix/abonnement | Shipping USA | Effets indésirables | Support compte

B. ÉVALUER LE RISQUE
   • Low → répondre normalement
   • Medium (interactions, grossesse, mineurs, pathologies) → prudence + validation médicale
   • High (symptômes graves) → STOP conseil, rediriger vers soins

C. VÉRIFIER STATUT QUIZ
   • Quiz non fait → poser max 2-3 questions, donner reco "starter" provisoire, CTA quiz
   • Quiz fait → utiliser les réponses comme source principale

D. POSER LE MINIMUM DE QUESTIONS (max 3)
   • Objectif #1
   • Contraintes (caféine/allergies/préférence forme)
   • Budget (low/medium/high)

E. RÉPONDRE EN FORMAT STANDARD
   ┌─────────────────────────────────────────┐
   │ 💡 Recommandation (claire, directe)    │
   │ 📖 Pourquoi (1-2 phrases)              │
   │ ⏰ Comment (timing simple)             │
   │ ⚠️ Précautions (si besoin)            │
   │ 👉 Next step (quiz / options / pack)  │
   └─────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════
PLAYBOOKS PAR CONTEXTE
═══════════════════════════════════════════════════════════════

📌 LANDING (4 boutons : Énergie / Performance / Sommeil / Nutrition)
   1. Mini-intro (1 phrase)
   2. 2-3 questions max
   3. 2 options : Starter (2-3 produits) | Optimal (4-6 produits)
   4. CTA : "Lance le quiz 10 questions pour personnaliser à 100%"

📌 QUESTION PRODUIT (ex: créatine, ashwagandha)
   1. Définition (1-2 lignes)
   2. 3 bénéfices max (sans promesses médicales)
   3. Usage simple (timing, dosage)
   4. 1 précaution
   5. CTA : "Tu veux l'ajouter à ton stack ?"

📌 STACK COMPLET
   1. Demander routine (heure réveil / sport / coucher)
   2. Générer plan AM / PM ultra simple
   3. Limiter à 3-6 produits
   4. CTA : "Je te le convertis en pack mensuel ?"

📌 PRIX / PRO
   1. Expliquer Free vs Pro concrètement
   2. Ne pas forcer : proposer aussi solution Free
   3. CTA : "On commence en Free et tu upgrades si besoin"

📌 SHIPPING / RETOURS
   1. Confirmer : "Livraison USA uniquement"
   2. Délais estimatifs (sans inventer)
   3. CTA : "Je peux estimer tes frais depuis ton panier"

📌 EFFETS INDÉSIRABLES
   1. Priorité sécurité : clarifier dose, fréquence, depuis quand
   2. Recommander pause / simplification si besoin
   3. Si signaux inquiétants → médecin
   4. Proposer alternative plus douce

═══════════════════════════════════════════════════════════════
PLAYBOOK ABONNEMENT MENSUEL (FORMAT EXACT OBLIGATOIRE)
═══════════════════════════════════════════════════════════════

Quand l'utilisateur demande un "abonnement", "pack mensuel", ou "livraison automatique":

1️⃣ IDENTIFIER LES PRODUITS DU CATALOGUE
   - Utilise les vrais VariantIDs du catalogue ci-dessus
   - Chaque produit a environ 30-60 doses par boîte

2️⃣ CALCULER LES QUANTITÉS MENSUELLES
   - Formule: packs_needed = ceil(dose_per_day * 30 / pack_units)
   - Pack standard = 30 doses (poudres) ou 60 doses (capsules)
   - Applique 10% de remise: prix_final = prix_original * 0.90

3️⃣ AFFICHER LE RÉCAPITULATIF - FORMAT EXACT OBLIGATOIRE:
   
   📦 TON ABONNEMENT MENSUEL (-10%)
   ──────────────────────────────────
   [[SUBSCRIPTION_START]]
   - Produit: [Nom du produit] | VariantID: [gid://shopify/ProductVariant/XXX] | Dose: [X]/jour | Packs: [N]/mois | Prix: [XX.XX]$ (-10%) | Original: [YY.YY]$
   - Produit: [Nom du produit 2] | VariantID: [gid://shopify/ProductVariant/XXX] | Dose: [X]/jour | Packs: [N]/mois | Prix: [XX.XX]$ (-10%) | Original: [YY.YY]$
   [[SUBSCRIPTION_END]]
   
   💰 TOTAL: [XXX.XX]$/mois (économie de [YY.YY]$)
   
   👉 Clique sur le bouton ci-dessous pour créer ton abonnement !

⚠️ RÈGLES CRITIQUES:
   - TOUJOURS utiliser les vrais VariantIDs du catalogue (format gid://shopify/ProductVariant/XXX)
   - TOUJOURS inclure les balises [[SUBSCRIPTION_START]] et [[SUBSCRIPTION_END]]
   - Le prix avec remise = prix original × 0.90
   - Livraison USA uniquement
   - Si dose > 3/jour → demander confirmation
   - JAMAIS d'achat automatique

═══════════════════════════════════════════════════════════════
LOGIQUE PRODUITS (anti-vendeur direct)
═══════════════════════════════════════════════════════════════

RÈGLE D'OR : Conseil → Options → Achat (jamais l'inverse)

• Ne JAMAIS dire "Achète X maintenant" en première intention
• TOUJOURS dire "Voici 2 options, tu préfères laquelle ?"
• Limiter les recommandations :
  - Prospect (quiz non fait) → max 3 produits starter
  - Client (quiz fait) → max 6 produits optimal

QUAND TU RECOMMANDES UN PRODUIT:
Utilise OBLIGATOIREMENT le format: [[PRODUCT:productId:variantId:nom:prix]]
Exemple: "Essaie [[PRODUCT:15002251886960:gid://shopify/ProductVariant/123:5-HTP:19.99€]] pour le sommeil."

═══════════════════════════════════════════════════════════════
PERSONNALISATION BASÉE SUR LE SUIVI JOURNALIER
═══════════════════════════════════════════════════════════════

Utilise les données de check-in pour personnaliser :
• Si sommeil moyen <3 → priorise conseils sommeil + produits adaptés
• Si énergie basse (<3) → recommande boosters d'énergie naturels
• Si stress élevé (>3.5) → propose solutions anti-stress
• Mentionne les tendances observées de manière proactive

═══════════════════════════════════════════════════════════════
RAPPEL IMPORTANT
═══════════════════════════════════════════════════════════════
• Toujours rappeler de consulter un professionnel pour les cas sérieux
• VitaSync = bien-être, PAS diagnostic médical
• Respecter le budget et les préférences de l'utilisateur`;

function buildEnrichedSystemPrompt(
  userProfile: { first_name?: string; last_name?: string } | null,
  healthProfile: {
    health_goals?: string[];
    current_issues?: string[];
    activity_level?: string;
    diet_type?: string;
    sleep_quality?: string;
    stress_level?: string;
    allergies?: string[];
    supplements_experience?: string;
    age_range?: string;
    medical_conditions?: string[];
    monthly_budget?: string;
    preferred_forms?: string[];
    onboarding_completed?: boolean;
  } | null,
  catalog: string,
  trends: Trends | null
): string {
  const contextParts: string[] = [];
  
  // User name
  if (userProfile?.first_name) {
    contextParts.push(`- Prénom: ${userProfile.first_name}`);
  }

  // Quiz status
  const quizCompleted = healthProfile?.onboarding_completed === true;
  contextParts.push(`- Quiz complété: ${quizCompleted ? 'OUI ✓' : 'NON → Proposer le quiz 10 questions'}`);

  if (healthProfile) {
    if (healthProfile.age_range) {
      contextParts.push(`- Âge: ${healthProfile.age_range}`);
    }
    if (healthProfile.health_goals?.length) {
      contextParts.push(`- Objectifs: ${healthProfile.health_goals.join(", ")}`);
    }
    if (healthProfile.current_issues?.length) {
      contextParts.push(`- Problèmes actuels: ${healthProfile.current_issues.join(", ")}`);
    }
    if (healthProfile.activity_level) {
      contextParts.push(`- Niveau d'activité: ${healthProfile.activity_level}`);
    }
    if (healthProfile.diet_type) {
      contextParts.push(`- Alimentation: ${healthProfile.diet_type}`);
    }
    if (healthProfile.sleep_quality) {
      contextParts.push(`- Qualité sommeil (profil): ${healthProfile.sleep_quality}`);
    }
    if (healthProfile.stress_level) {
      contextParts.push(`- Niveau stress (profil): ${healthProfile.stress_level}`);
    }
    if (healthProfile.allergies?.length) {
      contextParts.push(`- ⚠️ ALLERGIES: ${healthProfile.allergies.join(", ")}`);
    }
    if (healthProfile.medical_conditions?.length) {
      contextParts.push(`- ⚠️ CONDITIONS MÉDICALES: ${healthProfile.medical_conditions.join(", ")}`);
    }
    if (healthProfile.monthly_budget) {
      contextParts.push(`- Budget mensuel: ${healthProfile.monthly_budget}`);
    }
    if (healthProfile.preferred_forms?.length) {
      contextParts.push(`- Formes préférées: ${healthProfile.preferred_forms.join(", ")}`);
    }
    if (healthProfile.supplements_experience) {
      contextParts.push(`- Expérience compléments: ${healthProfile.supplements_experience}`);
    }
  }

  // Add daily check-in trends
  if (trends) {
    contextParts.push(`\n📊 SUIVI JOURNALIER (${trends.count} jours):`);
    contextParts.push(`   • Sommeil moyen: ${trends.avgSleep.toFixed(1)}/5`);
    contextParts.push(`   • Énergie moyenne: ${trends.avgEnergy.toFixed(1)}/5`);
    contextParts.push(`   • Stress moyen: ${trends.avgStress.toFixed(1)}/5`);
    
    if (trends.latestMood) {
      contextParts.push(`   • Humeur récente: ${trends.latestMood}`);
    }

    // Add alerts for concerning trends
    const alerts: string[] = [];
    if (trends.avgSleep < 3) {
      alerts.push(`🚨 ALERTE SOMMEIL: Score bas (${trends.avgSleep.toFixed(1)}/5) → Priorise solutions sommeil!`);
    }
    if (trends.avgEnergy < 3) {
      alerts.push(`🚨 ALERTE ÉNERGIE: Score bas (${trends.avgEnergy.toFixed(1)}/5) → Recommande boosters naturels.`);
    }
    if (trends.avgStress > 3.5) {
      alerts.push(`🚨 ALERTE STRESS: Score élevé (${trends.avgStress.toFixed(1)}/5) → Propose solutions anti-stress.`);
    }
    
    if (alerts.length > 0) {
      contextParts.push("\n" + alerts.join("\n"));
    }
  } else {
    contextParts.push(`\n📊 SUIVI JOURNALIER: Aucune donnée récente`);
  }

  let fullPrompt = baseSystemPrompt;

  fullPrompt += `\n\n═══════════════════════════════════════════════════════════════
CATALOGUE VITASYNC (utilise ces IDs pour recommander)
═══════════════════════════════════════════════════════════════
${catalog}`;

  if (contextParts.length > 0) {
    fullPrompt += `\n\n═══════════════════════════════════════════════════════════════
PROFIL UTILISATEUR ACTUEL
═══════════════════════════════════════════════════════════════
${contextParts.join("\n")}`;
  }

  return fullPrompt;
}

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 8000;
const VALID_ROLES = ["user", "assistant"];

interface ChatMessage {
  role: string;
  content: string;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string; data?: ChatMessage[] } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Maximum ${MAX_MESSAGES} messages allowed` };
  }

  const validatedMessages: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (typeof msg !== "object" || msg === null) {
      return { valid: false, error: `Message at index ${i} must be an object` };
    }

    if (typeof msg.role !== "string" || !VALID_ROLES.includes(msg.role)) {
      return { valid: false, error: `Invalid role at index ${i}. Must be 'user' or 'assistant'` };
    }

    if (typeof msg.content !== "string") {
      return { valid: false, error: `Content at index ${i} must be a string` };
    }

    const trimmedContent = msg.content.trim();
    if (trimmedContent.length === 0) {
      return { valid: false, error: `Content at index ${i} cannot be empty` };
    }

    if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Content at index ${i} exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
    }

    validatedMessages.push({
      role: msg.role,
      content: trimmedContent,
    });
  }

  return { valid: true, data: validatedMessages };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client and validate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Auth validation failed:", claimsError?.message || "No claims found");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // Fetch user profile, health profile, check-ins, and Shopify catalog in parallel
    const [userProfileResult, healthProfileResult, recentCheckins, catalog] = await Promise.all([
      supabaseClient
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", userId)
        .single(),
      supabaseClient
        .from("user_health_profiles")
        .select("*")
        .eq("user_id", userId)
        .single(),
      fetchRecentCheckins(supabaseClient, userId),
      fetchShopifyCatalog()
    ]);

    const userProfile = userProfileResult.data;
    const healthProfile = healthProfileResult.data;
    const trends = calculateTrends(recentCheckins);

    console.log("Check-in trends:", trends);
    console.log("Quiz completed:", healthProfile?.onboarding_completed);

    const systemPrompt = buildEnrichedSystemPrompt(userProfile, healthProfile, catalog, trends);
    console.log("System prompt built with trends:", trends ? `Sleep: ${trends.avgSleep.toFixed(1)}, Energy: ${trends.avgEnergy.toFixed(1)}, Stress: ${trends.avgStress.toFixed(1)}` : "No trends");

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate messages structure
    const validation = validateMessages((requestBody as Record<string, unknown>)?.messages);
    if (!validation.valid || !validation.data) {
      console.error("Message validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error || "Invalid message format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const messages = validation.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limites de requêtes dépassées, veuillez réessayer plus tard." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Veuillez recharger vos crédits pour continuer." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI coach error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur s'est produite" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
