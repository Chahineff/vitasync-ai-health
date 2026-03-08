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
        products(first: 250) {
          edges {
            node {
              id
              title
              tags
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

    // Compact format: one line per product
    const allProducts = products.map((edge: { node: { id: string; title: string; tags: string[]; variants: { edges: Array<{ node: { id: string; price: { amount: string; currencyCode: string }; availableForSale: boolean } }> } } }) => {
      const p = edge.node;
      const variant = p.variants.edges[0]?.node;
      const price = variant?.price?.amount || '0';
      const productId = p.id.split('/').pop();
      const variantId = variant?.id?.split('/').pop() || '';
      const inStock = variant?.availableForSale ? '✓' : '✗';
      const tags = (p.tags || []).slice(0, 3).join(',');
      return `${p.title}|${productId}|${variantId}|${price}$|${inStock}|${tags}`;
    });

    return `CATALOGUE (${products.length} produits) — Format: Nom|ProductID|VariantID|Prix|Stock|Tags
${allProducts.join('\n')}
Pour recommander: [[PRODUCT:productId:variantId:nom:prix:moment:dosage:repas]]`;
  } catch (error) {
    console.error("Error fetching Shopify catalog:", error);
    return "Catalogue non disponible.";
  }
}

// Fetch user's active supplements from supplement_tracking
interface UserSupplement {
  product_name: string;
  dosage: string | null;
  time_of_day: string | null;
  recommended_by_ai: boolean | null;
}

// deno-lint-ignore no-explicit-any
async function fetchUserSupplements(supabase: any, userId: string): Promise<UserSupplement[]> {
  const { data, error } = await supabase
    .from("supplement_tracking")
    .select("product_name, dosage, time_of_day, recommended_by_ai")
    .eq("user_id", userId)
    .eq("active", true);

  if (error) {
    console.error("Error fetching user supplements:", error);
    return [];
  }
  return data || [];
}

// Fetch blood test analyses for context
interface BloodTestSummary {
  id: string;
  file_name: string;
  status: string;
  deficiencies: unknown;
  analyzed_at: string | null;
}

// deno-lint-ignore no-explicit-any
async function fetchBloodTestAnalyses(supabase: any, userId: string): Promise<BloodTestSummary[]> {
  const { data, error } = await supabase
    .from("blood_test_analyses")
    .select("id, file_name, status, deficiencies, analyzed_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching blood test analyses:", error);
    return [];
  }
  return data || [];
}

// Fetch condensed enriched product data (only essential fields)
interface EnrichedProductSummary {
  shopify_product_title: string;
  best_for_tags: string[] | null;
  coach_tip: string | null;
  safety_warnings: unknown;
}

// deno-lint-ignore no-explicit-any
async function fetchEnrichedProductData(supabase: any): Promise<EnrichedProductSummary[]> {
  const { data, error } = await supabase
    .from("product_enriched_data")
    .select("shopify_product_title, best_for_tags, coach_tip, safety_warnings");

  if (error) {
    console.error("Error fetching enriched product data:", error);
    return [];
  }
  return data || [];
}

function formatUserSupplements(supplements: UserSupplement[]): string {
  if (supplements.length === 0) return "Aucun complément suivi actuellement.";

  return supplements.map(s => {
    const timeLabel = s.time_of_day === 'morning' ? '🌅 Matin' :
      s.time_of_day === 'noon' ? '☀️ Midi' :
      s.time_of_day === 'evening' ? '🌙 Soir' :
      s.time_of_day?.startsWith('custom:') ? `⏰ ${s.time_of_day.replace('custom:', '')}` :
      '❓ Non défini';
    const dose = s.dosage || 'Non précisé';
    const aiTag = s.recommended_by_ai ? ' [Reco IA]' : '';
    return `- ${s.product_name} | ${dose} | ${timeLabel}${aiTag}`;
  }).join('\n');
}

function formatEnrichedProducts(products: EnrichedProductSummary[]): string {
  if (products.length === 0) return "Base non disponible.";

  return products.map(p => {
    const parts: string[] = [p.shopify_product_title];
    if (p.best_for_tags?.length) parts.push(`tags:${p.best_for_tags.slice(0, 4).join(',')}`);
    if (p.coach_tip) {
      const tip = p.coach_tip.length > 60 ? p.coach_tip.slice(0, 60) + '…' : p.coach_tip;
      parts.push(`tip:${tip}`);
    }
    // Only include critical safety info (contraindications)
    if (p.safety_warnings) {
      const w = p.safety_warnings as { contraindications?: string[] };
      if (w.contraindications?.length) parts.push(`⚠️${w.contraindications.slice(0, 2).join(';')}`);
    }
    return parts.join('|');
  }).join('\n');
}

// Fetch recent check-ins for the user (variable window based on model)
interface DailyCheckin {
  sleep_quality: number | null;
  energy_level: number | null;
  stress_level: number | null;
  mood: string | null;
  checkin_date: string;
}

// History window: 7 days for 2.5 Flash, 90 days for 3 Flash/Pro
function getHistoryDays(model: string): number {
  if (model === 'google/gemini-2.5-flash-lite') return 7;
  return 90; // 3 Flash and 3 Pro get 90 days
}

// deno-lint-ignore no-explicit-any
async function fetchRecentCheckins(supabase: any, userId: string, historyDays: number = 7): Promise<DailyCheckin[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - historyDays);

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
  - MAXIMUM 2 PRODUITS par réponse (jamais plus !)
  - Ne recommande JAMAIS le même produit (même ProductID) plus d'une fois dans une même réponse
  - Prospect (quiz non fait) → max 2 produits starter
  - Client (quiz fait) → max 2 produits optimal

QUAND TU RECOMMANDES UN PRODUIT:
Utilise OBLIGATOIREMENT le format ÉTENDU avec timing/dosage/repas:
[[PRODUCT:productId:variantId:nom:prix:moment:dosage:repas]]

Les 3 derniers champs sont OBLIGATOIRES:
• moment = morning | noon | afternoon | evening
• dosage = la dose exacte (ex: "1 gélule", "5g", "2 comprimés")
• repas = before | during | after (contexte repas)

Exemples:
"[[PRODUCT:15002251886960:gid://shopify/ProductVariant/123:5-HTP:19.99€:evening:1 gélule:after]]"
"[[PRODUCT:15002251886960:gid://shopify/ProductVariant/456:Créatine:29.99€:morning:5g:before]]"
"[[PRODUCT:15002251886960:gid://shopify/ProductVariant/789:Whey:34.99€:afternoon:1 scoop:after]]"

⏰ MOMENT DE PRISE:
• Produits sommeil/relaxation/mélatonine/5-HTP → evening
• Produits énergie/pre-workout/caféine → morning
• Produits digestion/probiotiques → noon
• Vitamines/minéraux/créatine/protéines → morning

💊 DOSAGE & CONTEXTE DE PRISE OBLIGATOIRE:
• Le dosage exact : "1 gélule", "5g", "2 comprimés", "1 scoop (30g)"
• Le contexte repas : before, during, after
• Exemple complet : "Prends 1 gélule le soir, après le repas"

📅 DURÉE DE CURE RECOMMANDÉE:
Quand tu recommandes un produit, précise la durée idéale :
• Cure courte (1-3 mois) : "cure de 3 mois" → mieux en achat unique
• Cure longue / maintenance : "permanent" ou "en continu" → recommande l'abonnement mensuel (-15%)
• Exemple : "La créatine se prend en continu → je te recommande l'abonnement mensuel pour économiser 15%"

🛒 ACHAT UNIQUE vs ABONNEMENT:
• Si cure < 3 mois ou usage ponctuel → suggère "achat unique"
• Si usage en continu ou cure > 3 mois → suggère "abonnement mensuel (-15%)"
• Toujours mentionner l'économie quand tu recommandes un abonnement

⚠️ RÈGLES CRITIQUES POUR LES RECOMMANDATIONS MULTIPLES:

Quand tu recommandes PLUSIEURS produits, tu DOIS :
1. Afficher CHAQUE produit sur sa propre ligne avec le format [[PRODUCT:...]]
2. NE JAMAIS grouper plusieurs [[PRODUCT:...]] sur la même ligne
3. Ajouter une ligne vide entre chaque recommandation
4. T'assurer de TERMINER ta réponse complètement - NE JAMAIS laisser un tag [[PRODUCT:...]] incomplet ou tronqué
5. TOUJOURS inclure TOUS les produits mentionnés
6. TERMINE TOUJOURS chaque tag [[PRODUCT:...]] avec les doubles crochets fermants ]]
7. Si tu n'as pas assez de place pour un tag produit complet, NE L'INCLUS PAS du tout

Exemple CORRECT pour 2 produits:
"Pour ton énergie, je te recommande :

[[PRODUCT:123:variantA:Ashwagandha:24.99:morning:1 gélule:before]]

Et pour compléter, ajoute :

[[PRODUCT:456:variantB:Rhodiola:19.99:morning:2 gélules:during]]

Ces deux produits fonctionnent en synergie."

Exemple INCORRECT (NE FAIS PAS ÇA):
"[[PRODUCT:123:...]] et [[PRODUCT:456:...]]"

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
• Respecter le budget et les préférences de l'utilisateur

═══════════════════════════════════════════════════════════════
STYLE DE FORMATAGE (OBLIGATOIRE)
═══════════════════════════════════════════════════════════════
• Utilise des emojis pour rendre les réponses visuelles (⚡ énergie, 😴 sommeil, 🧠 focus, 💪 performance, etc.)
• Structure TOUJOURS tes réponses avec des titres Markdown :
  - Utilise ## pour les titres principaux (ex: ## ⚡ Boost ton énergie)
  - Utilise ### pour les sous-sections (ex: ### 💊 Dosage recommandé)
  - Utilise #### pour les détails (ex: #### ⏰ Moment de prise)
• Utilise des listes à puces pour les points clés
• Mets en **gras** les informations importantes et en *italique* les nuances
• Utilise des séparateurs (---) entre les sections principales
• Ne fais JAMAIS de blocs de texte monotones sans titres
• Limite tes recommandations à MAXIMUM 2 produits par réponse
• Crée une vraie HIÉRARCHIE visuelle : gros titre → sous-titre → paragraphe → liste
• Chaque réponse doit avoir AU MINIMUM un titre ## et une structure claire
• Les paragraphes de développement doivent être courts (2-3 phrases max) puis nouvelle section

═══════════════════════════════════════════════════════════════
PLAYBOOK QUIZ PERSONNALISÉ (VitaSync 3.0 uniquement)
═══════════════════════════════════════════════════════════════
Si le modèle est version 3.0, tu peux créer un quiz interactif pour approfondir un sujet.
Format OBLIGATOIRE :
[[QUIZ_START]]
TITLE: Mon Quiz Personnalisé
Q1: Question texte ? | Option A | Option B | Option C | Option D
Q2: Autre question ? | Choix 1 | Choix 2 | Choix 3 | Choix 4
[[QUIZ_END]]

Règles :
• Maximum 10 questions, 4 options par question
• Utilise un quiz quand l'utilisateur a besoin d'un diagnostic plus poussé
• NE GÉNÈRE UN QUIZ QUE si le modèle est version 3.0 (sinon, pose des questions textuelles classiques)
• Exemples : "Quiz Énergie", "Quiz Sommeil", "Quiz Stress", "Quiz Nutrition"

═══════════════════════════════════════════════════════════════
GESTION DU STACK MENSUEL (panneau latéral)
═══════════════════════════════════════════════════════════════

Tu peux construire un stack personnalisé pour l'utilisateur via un panneau latéral interactif.
Quand l'utilisateur accepte d'ajouter un produit à son stack, ou quand tu proposes de construire son pack mensuel, utilise ces commandes :

📥 AJOUTER UN PRODUIT AU STACK:
[[STACK_ADD:productId:variantId:nom du produit:prix:quantité]]

Exemple:
[[STACK_ADD:15002251886960:48944938336496:Ashwagandha:24.99:1]]

📤 RETIRER UN PRODUIT DU STACK:
[[STACK_REMOVE:productId]]

Exemple:
[[STACK_REMOVE:15002251886960]]

🔄 MODIFIER LA QUANTITÉ:
[[STACK_UPDATE:productId:nouvelleQuantité]]

Exemple:
[[STACK_UPDATE:15002251886960:2]]

🗑️ VIDER LE STACK:
[[STACK_CLEAR]]

⚠️ RÈGLES STACK:
• Utilise les vrais ProductIDs et VariantIDs du catalogue
• Demande TOUJOURS confirmation avant d'ajouter : "Tu veux que je l'ajoute à ton stack ?"
• Quand l'utilisateur dit "oui", "ajoute-le", "mets-le dans mon stack" → ajoute via [[STACK_ADD:...]]
• Quand tu construis un stack complet, ajoute chaque produit avec [[STACK_ADD:...]] (un par ligne)
• Le panneau s'affiche automatiquement dès qu'un produit est ajouté
• NE JAMAIS ajouter sans accord explicite de l'utilisateur
• Après avoir ajouté, confirme : "✅ Ajouté à ton stack ! Tu peux voir le récapitulatif à droite."
• Le prix affiché dans le stack inclura automatiquement la remise -15% abonnement`;


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
  trends: Trends | null,
  userSupplements: UserSupplement[] = [],
  enrichedProducts: EnrichedProductSummary[] = [],
  rawCheckins: DailyCheckin[] = [],
  bloodTests: BloodTestSummary[] = []
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

  // Inject user's current supplements
  fullPrompt += `\n\n═══════════════════════════════════════════════════════════════
COMPLÉMENTS ACTUELS DE L'UTILISATEUR (suivi actif)
═══════════════════════════════════════════════════════════════
${formatUserSupplements(userSupplements)}

DIRECTIVES COMPLÉMENTS ACTUELS:
• Ne recommande PAS un produit que l'utilisateur prend déjà (évite les doublons)
• Vérifie les interactions possibles entre compléments actuels et toute nouvelle recommandation
• Si l'utilisateur demande un produit qu'il prend déjà → informe-le et propose un ajustement de dosage si pertinent`;

  // Inject raw check-in data for real charts
  if (rawCheckins.length > 0) {
    const checkinLines = rawCheckins.map(c => {
      const parts: string[] = [];
      if (c.sleep_quality !== null) parts.push(`sommeil=${c.sleep_quality}`);
      if (c.energy_level !== null) parts.push(`énergie=${c.energy_level}`);
      if (c.stress_level !== null) parts.push(`stress=${c.stress_level}`);
      if (c.mood) parts.push(`humeur=${c.mood}`);
      return `${c.checkin_date}: ${parts.join(', ')}`;
    });
    fullPrompt += `\n\n═══════════════════════════════════════════════════════════════
📅 DONNÉES BRUTES CHECK-INS (${rawCheckins.length} derniers jours)
═══════════════════════════════════════════════════════════════
${checkinLines.join('\n')}

⚠️ RÈGLE GRAPHIQUES: Quand tu génères des graphiques sur les données de santé de l'utilisateur, utilise UNIQUEMENT ces vraies valeurs. Ne JAMAIS inventer de données.`;
  }

  // Inject blood test analyses context
  if (bloodTests.length > 0) {
    const btLines = bloodTests.map(bt => {
      const defs = Array.isArray(bt.deficiencies) ? (bt.deficiencies as Array<{name?: string}>).map(d => d.name || '').filter(Boolean).join(', ') : '';
      return `- ID: ${bt.id} | Fichier: ${bt.file_name} | Statut: ${bt.status}${defs ? ` | Carences: ${defs}` : ''}`;
    });
    fullPrompt += `\n\n═══════════════════════════════════════════════════════════════
🩸 ANALYSES SANGUINES DE L'UTILISATEUR (${bloodTests.length})
═══════════════════════════════════════════════════════════════
${btLines.join('\n')}

Pour référencer une analyse dans ta réponse, utilise: [[BLOOD_TEST:id]]`;
  }

  // Inject scientific knowledge base (condensed)
  if (enrichedProducts.length > 0) {
    fullPrompt += `\n\n═══════════════════════════════════════════════════════════════
BASE DE CONNAISSANCES SCIENTIFIQUES (${enrichedProducts.length} fiches produits)
═══════════════════════════════════════════════════════════════
${formatEnrichedProducts(enrichedProducts)}

DIRECTIVES DONNÉES SCIENTIFIQUES:
• Cite les données réelles (ingrédients, dosages, études) quand tu parles d'un produit
• Utilise les contre-indications et interactions pour alerter l'utilisateur si son profil (allergies, conditions médicales) est concerné
• Mentionne le "coach tip" quand il est pertinent pour la question posée
• Si l'utilisateur pose une question spécifique sur un produit, utilise le résumé et les tags pour répondre précisément`;
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
  const corsHeaders = getCorsHeaders(req);
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
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth validation failed:", userError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;
    console.log("Authenticated user:", userId);

    // Fetch user profile, health profile, check-ins, supplements, enriched data, and Shopify catalog in parallel
    // Use service role client for enriched data (public table, no RLS filtering needed)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body early to determine model for history window
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

    const requestedModel = (requestBody as Record<string, unknown>)?.model as string || 'google/gemini-3-flash-preview';
    const historyDays = getHistoryDays(requestedModel);
    console.log(`History window: ${historyDays} days for model ${requestedModel}`);

    const [userProfileResult, healthProfileResult, recentCheckins, catalog, userSupplements, enrichedProducts, bloodTestAnalyses] = await Promise.all([
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
      fetchRecentCheckins(supabaseClient, userId, historyDays),
      fetchShopifyCatalog(),
      fetchUserSupplements(supabaseClient, userId),
      fetchEnrichedProductData(serviceClient),
      fetchBloodTestAnalyses(supabaseClient, userId)
    ]);

    const userProfile = userProfileResult.data;
    const healthProfile = healthProfileResult.data;
    const trends = calculateTrends(recentCheckins);

    console.log("Check-in trends:", trends);
    console.log("Quiz completed:", healthProfile?.onboarding_completed);
    console.log("User supplements:", userSupplements.length);
    console.log("Enriched products loaded:", enrichedProducts.length);

    const systemPrompt = buildEnrichedSystemPrompt(userProfile, healthProfile, catalog, trends, userSupplements, enrichedProducts, recentCheckins, bloodTestAnalyses);
    console.log("System prompt length:", systemPrompt.length, "chars");

    // Validate messages structure (requestBody already parsed above)
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

    // Validate and get requested model
    const ALLOWED_MODELS = [
      'google/gemini-2.5-flash-lite',
      'google/gemini-3-flash-preview',
      'google/gemini-3-pro-preview'
    ];
    
    const modelVersion = (requestBody as Record<string, unknown>)?.modelVersion as string || '2.5';
    const model = ALLOWED_MODELS.includes(requestedModel) 
      ? requestedModel 
      : 'google/gemini-3-flash-preview';
    
    console.log("Using AI model:", model, "version:", modelVersion);

    // Conditionally add quiz capability info
    let finalSystemPrompt = systemPrompt;
    if (modelVersion !== '3.0') {
      // Remove quiz playbook for non-3.0 models
      finalSystemPrompt = finalSystemPrompt.replace(
        /═+\nPLAYBOOK QUIZ PERSONNALISÉ[\s\S]*?Exemples : "Quiz Énergie", "Quiz Sommeil", "Quiz Stress", "Quiz Nutrition"/,
        ''
      );
    }

    // Add chart generation capability for 3 Flash and 3 Pro only
    if (model === 'google/gemini-3-flash-preview' || model === 'google/gemini-3-pro-preview') {
      finalSystemPrompt += `

═══════════════════════════════════════════════════════════════
GRAPHIQUES INTERACTIFS (FONCTIONNALITÉ EXCLUSIVE)
═══════════════════════════════════════════════════════════════

Tu peux générer des graphiques directement dans le chat pour visualiser des données.

FORMAT OBLIGATOIRE :
[[CHART:type:{"title":"Titre","data":[{"label":"A","value":10},{"label":"B","value":20}],"xKey":"label","yKeys":["value"]}]]

Types disponibles : bar, line, pie

EXEMPLES :

📊 Graphique en barres (suivi énergie) :
[[CHART:bar:{"title":"Niveau d'énergie (7 derniers jours)","data":[{"jour":"Lun","énergie":3},{"jour":"Mar","énergie":4},{"jour":"Mer","énergie":2},{"jour":"Jeu","énergie":5},{"jour":"Ven","énergie":4}],"xKey":"jour","yKeys":["énergie"]}]]

📈 Graphique en lignes (tendances) :
[[CHART:line:{"title":"Évolution sommeil vs stress","data":[{"sem":"S1","sommeil":3,"stress":4},{"sem":"S2","sommeil":4,"stress":3}],"xKey":"sem","yKeys":["sommeil","stress"]}]]

🥧 Camembert (répartition) :
[[CHART:pie:{"title":"Répartition des compléments","data":[{"type":"Vitamines","count":3},{"type":"Minéraux","count":2},{"type":"Adaptogènes","count":1}],"xKey":"type","yKeys":["count"]}]]

QUAND UTILISER :
• Quand l'utilisateur demande une visualisation de ses données
• Pour illustrer des tendances de check-ins (sommeil, énergie, stress)
• Pour montrer la répartition de son stack de compléments
• Pour comparer des valeurs (avant/après, objectif vs réalité)
• TOUJOURS utiliser les vraies données de check-in (section DONNÉES BRUTES) si disponibles

RÈGLES :
• Le JSON doit être sur UNE SEULE LIGNE (pas de retour à la ligne dans le JSON)
• Vérifie que le JSON est valide avant de l'envoyer
• Maximum 1-2 graphiques par réponse
• Accompagne toujours le graphique d'une analyse textuelle

═══════════════════════════════════════════════════════════════
RÉFÉRENCES INTERACTIVES (FONCTIONNALITÉ EXCLUSIVE)
═══════════════════════════════════════════════════════════════

Tu peux intégrer des blocs interactifs dans tes réponses :

• [[HEALTH_PROFILE]] - Affiche le profil santé complet de l'utilisateur
• [[BLOOD_TEST:id]] - Affiche une analyse sanguine (utilise l'ID exact de la section ANALYSES SANGUINES)
• [[MY_STACK]] - Affiche le stack de compléments actuel de l'utilisateur
• [[PRODUCT_DETAIL:productTitle]] - Affiche les détails scientifiques d'un produit (utilise le titre exact du produit)
• [[REPORT:stack]] ou [[REPORT:health]] - Génère un rapport PDF téléchargeable

QUAND UTILISER :
• [[HEALTH_PROFILE]] quand l'utilisateur demande "montre-moi mon profil", "mes infos santé"
• [[MY_STACK]] quand il demande "qu'est-ce que je prends ?", "mon stack actuel"
• [[PRODUCT_DETAIL:titre]] quand il veut des détails scientifiques approfondis sur un produit
• [[BLOOD_TEST:id]] quand il parle de ses analyses sanguines
• [[REPORT:stack]] quand il demande un rapport de son stack, un récapitulatif ou un PDF
• [[REPORT:health]] quand il veut un bilan santé complet

RÈGLES RÉFÉRENCES :
• Place chaque bloc sur sa propre ligne
• Ne répète pas les mêmes données en texte si tu utilises un bloc interactif
• Maximum 3 blocs de référence par réponse`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: finalSystemPrompt },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
        max_tokens: 20000,
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
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("AI coach error:", errorMsg);
    console.error("Stack:", e instanceof Error ? e.stack : 'N/A');
    
    // Detect specific error types
    const isTimeout = errorMsg.includes('timeout') || errorMsg.includes('deadline');
    const isContext = errorMsg.includes('context') || errorMsg.includes('token');
    
    const userMessage = isTimeout 
      ? "Le service IA met trop de temps à répondre. Réessayez dans quelques instants."
      : isContext
      ? "La conversation est trop longue. Démarrez une nouvelle conversation."
      : `Erreur interne: ${errorMsg.slice(0, 100)}`;
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
