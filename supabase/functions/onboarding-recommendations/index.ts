import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_STORE_DOMAIN = "vitasync2.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

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
      return `- handle:"${p.handle}" | ${p.title} | ${p.productType || "N/A"} | ${v?.price?.amount || "0"}$ | ${v?.availableForSale ? "En stock" : "Rupture"}\n  Tags: ${(p.tags || []).join(", ")}`;
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
Ton rôle: analyser le profil d'onboarding et recommander 3-4 produits du catalogue.

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
5. Réponds UNIQUEMENT en JSON valide

Format: {"recommendations": [{"handle": "product-handle", "reason": "Raison courte"}]}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      const fallback = shopifyData.products.slice(0, 3).map(p => ({ handle: p.handle, reason: "Recommandé pour votre profil" }));
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
          { role: "user", content: "Recommande-moi les produits adaptés à mon profil d'onboarding." },
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
      const fallback = shopifyData.products.slice(0, 3).map(p => ({ handle: p.handle, reason: "Recommandé pour votre profil" }));
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

    // Validate handles & enrich with product data
    const validRecos = recommendations
      .filter(r => shopifyData.handles.includes(r.handle))
      .slice(0, 4)
      .map(r => {
        const product = shopifyData.products.find((p: any) => p.handle === r.handle);
        return { ...r, product };
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
