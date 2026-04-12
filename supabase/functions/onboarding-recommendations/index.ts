import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_STORE_DOMAIN = "vitasync2.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// ═══ DELIVERY FREQUENCY MAP ═══
// Calculated from: container_count / daily_dosage → months supply
// <=45 days = 1 month, 46-75 days = 2 months, >75 days = 3 months
const DELIVERY_MONTHS: Record<string, number> = {
  "digestive-enzyme-pro-blend": 1, "creatine-monohydrate": 2, "respiratory-lung-health-drops": 1,
  "colostrum-powder": 1, "hydration-powder-lychee": 1, "sleep-support": 1, "ayurvedic-complex": 2,
  "hydration-powder-peach-mango": 1, "hydration-powder-lemonade": 1, "hydration-powder-passion-fruit": 1,
  "advanced-100-whey-protein-isolate-vanilla": 1, "apple-cider-vinegar-capsules": 1,
  "advanced-100-whey-protein-isolate-chocolate": 1, "energy-powder-strawberry-shortcake": 1,
  "omega-3-epa-180mg-dha-120mg": 3, "energy-powder-fruit-punch": 1, "energy-powder-yuzu-flavor": 1,
  "hair-skin-and-nails-strips": 1, "ashwagandha": 1, "beetroot": 1, "moringa-pure": 1,
  "turmeric-gummies": 1, "bee-pearl": 1, "chaga-mushroom": 1, "lions-mane-mushroom": 1,
  "grass-fed-hydrolyzed-collagen-peptides": 1, "ultra-cleanse-smoothie-greens": 1,
  "grass-fed-collagen-peptides-powder-chocolate": 1, "grass-fed-collagen-creamer-vanilla": 1,
  "keto-5": 1, "resveratrol-50-600mg": 1, "bcaa-post-workout-powder-honeydew-watermelon": 1,
  "bcaa-shock-powder-fruit-punch": 1, "nitric-shock-pre-workout-powder-fruit-punch": 1,
  "fat-burner-with-mct": 1, "mushroom-extract-complex": 1, "brain-focus-formula": 1,
  "alpha-energy": 1, "bone-heart-support": 1, "coq10-ubiquinone": 1, "vitamin-d3-2-000-iu": 3,
  "platinum-turmeric": 1, "probiotic-40-billion-with-prebiotics": 1, "hair-skin-and-nails-essentials": 1,
  "ginkgo-biloba-ginseng": 1, "l-glutamine-powder": 2, "birch-chaga-truffles": 1,
  "complete-multivitamin": 1, "diet-drops-ultra-1-oz": 1, "max-detox-acai-detox": 1,
  "female-enhancement": 1, "horny-goat-weed-blend": 1, "maca-plus": 1, "mens-vitality": 1,
  "magnesium-glycinate": 1, "mushroom-complex-10-x": 1, "sea-moss": 1, "fermented-mushroom-blend": 1,
  "normal-blood-sugar-support": 1, "cognitive-support": 1, "greens-superfood": 1, "joint-support": 1,
  "keto-bhb": 1, "liver-support": 1, "probiotic-20-billion": 1, "prostate-support": 1,
  "reds-superfood": 1, "sleep-formula": 1, "vision-support": 1, "energy-strips": 1,
  "sleep-strips": 1, "bee-bread-powder": 1, "gut-health": 1, "cognitive-relax-strips": 1,
  "beetroot-powder": 1, "appetite-balance-weight-support-strips": 1, "nad": 1,
  "methylene-blue-drops": 1, "dental-oral-health-chewables": 1, "focus-powder-sour-gummi-worm": 1,
  "focus-powder-sour-candy": 1, "focus-powder-sour-grape": 1, "probiotic-metabolism-strips": 1,
  "womens-vitality-formula": 1, "mushroom-focus-strips": 1, "beauty-collagen-strips": 1,
  "plant-protein-chocolate": 1, "plant-protein-vanilla": 1, "fruits-and-veggies": 1,
  "libido-support-strips": 1, "normal-blood-sugar-drops": 1, "bone-support-strips": 1,
  "iron-strips": 1, "digestive-gut-health-strips": 1, "nitric-oxide": 1, "colostrum-capsules": 2,
  "colon-gentle-cleanse": 1, "hair-skin-nails-gummies": 1, "5-htp": 1, "berberine": 1,
  "hangover-strips": 1, "colostrum": 1,
};

async function fetchShopifyCatalog(): Promise<{ catalog: string; handles: string[]; products: any[] }> {
  const storefrontToken = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  if (!storefrontToken) return { catalog: "Catalogue non disponible.", handles: [], products: [] };

  try {
    const query = `query {
      products(first: 100) {
        edges {
          node {
            id title description handle productType tags vendor
            variants(first: 1) { edges { node { id price { amount currencyCode } availableForSale } } }
            images(first: 1) { edges { node { url altText } } }
          }
        }
      }
    }`;

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": storefrontToken },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) return { catalog: "Catalogue non disponible.", handles: [], products: [] };

    const data = await response.json();
    const products = data?.data?.products?.edges || [];
    if (!products.length) return { catalog: "Aucun produit.", handles: [], products: [] };

    const handles: string[] = [];
    const lines = products.map((edge: any) => {
      const p = edge.node;
      const v = p.variants.edges[0]?.node;
      handles.push(p.handle);
      const deliveryMonths = DELIVERY_MONTHS[p.handle] || 1;
      return `- handle:"${p.handle}" | ${p.title} | ${p.productType || "N/A"} | ${v?.price?.amount || "0"}$ | ${v?.availableForSale ? "En stock" : "Rupture"} | Subscription: every ${deliveryMonths} month(s)\n  Tags: ${(p.tags || []).join(", ")}`;
    });

    return {
      catalog: `CATALOGUE (${products.length}):\n${lines.join("\n")}`,
      handles,
      products: products.map((edge: any) => {
        const p = edge.node;
        const v = p.variants.edges[0]?.node;
        const img = p.images.edges[0]?.node;
        return {
          handle: p.handle,
          title: p.title,
          price: v?.price?.amount || "0",
          currency: v?.price?.currencyCode || "USD",
          imageUrl: img?.url || "",
          productType: p.productType || "",
          variantId: v?.id || "",
          deliveryMonths: DELIVERY_MONTHS[p.handle] || 1,
        };
      }),
    };
  } catch (error) {
    console.error("Shopify error:", error);
    return { catalog: "Catalogue non disponible.", handles: [], products: [] };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { answers } = await req.json();
    if (!answers) {
      return new Response(JSON.stringify({ error: "Missing answers" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shopifyData = await fetchShopifyCatalog();

    const goals = (answers.health_goals || []).join(", ") || "Non spécifié";
    const issues = (answers.current_issues || []).join(", ") || "Aucun";
    const activity = answers.activity_level || "modéré";
    const diet = answers.diet_type || "omnivore";
    const allergies = (answers.allergies || []).join(", ") || "Aucune";
    const sleepQuality = answers.sleep_quality || "moyenne";
    const stressLevel = answers.stress_level || "moyen";
    const sports = (answers.selected_sports || []).map((s: any) => typeof s === "string" ? s : s.label).join(", ") || "Aucun";
    const energyLevel = answers.energy_level ?? 50;
    const sleepHours = answers.sleep_hours || "7-8h";

    const systemPrompt = `Tu es VitaSync AI, coach santé & nutrition premium.
Ton rôle: analyser le profil d'onboarding et recommander 3-4 produits du catalogue EN ABONNEMENT MENSUEL.

═══ PROFIL ONBOARDING ═══
- Objectifs: ${goals}
- Problèmes actuels: ${issues}
- Activité: ${activity}
- Sports: ${sports}
- Régime: ${diet}
- Allergies: ⚠️ ${allergies}
- Sommeil: ${sleepQuality} (${sleepHours})
- Stress: ${stressLevel}
- Énergie: ${energyLevel}%

═══ ${shopifyData.catalog} ═══

INSTRUCTIONS:
1. Analyse le profil d'onboarding
2. Choisis 3 à 4 produits RÉELS du catalogue les plus pertinents
3. Pour chaque produit, donne une raison courte (max 15 mots)
4. CROSS-CHECK ALLERGIES avant chaque recommandation
5. IMPORTANT: Chaque recommandation est un ABONNEMENT. La fréquence de livraison dépend du nombre de doses dans le contenant. Le catalogue indique "Subscription: every X month(s)" pour chaque produit.
6. Réponds UNIQUEMENT en JSON valide

Format: {"recommendations": [{"handle": "product-handle", "reason": "Raison courte"}]}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      const fallback = shopifyData.products.slice(0, 3).map(p => ({
        handle: p.handle, reason: "Recommandé pour votre profil",
        product: p, deliveryMonths: p.deliveryMonths,
      }));
      return new Response(JSON.stringify({ recommendations: fallback, products: shopifyData.products }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Recommande-moi les produits adaptés à mon profil d'onboarding, en abonnement." },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI error:", aiResponse.status);
      if (aiResponse.status === 429 || aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: aiResponse.status === 429 ? "Rate limit" : "Payment required" }), {
          status: aiResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const fallback = shopifyData.products.slice(0, 3).map(p => ({
        handle: p.handle, reason: "Recommandé pour votre profil",
        product: p, deliveryMonths: p.deliveryMonths,
      }));
      return new Response(JSON.stringify({ recommendations: fallback, products: shopifyData.products }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let recommendations: { handle: string; reason: string }[] = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      }
    } catch { /* fallback below */ }

    // Validate handles & enrich with product data + delivery frequency
    const validRecos = recommendations
      .filter(r => shopifyData.handles.includes(r.handle))
      .slice(0, 4)
      .map(r => {
        const product = shopifyData.products.find((p: any) => p.handle === r.handle);
        return {
          ...r,
          product,
          deliveryMonths: product?.deliveryMonths || DELIVERY_MONTHS[r.handle] || 1,
        };
      });

    return new Response(JSON.stringify({ recommendations: validRecos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
