import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Shopify config — use Admin API to avoid Storefront 401
const SHOPIFY_STORE_DOMAIN = "vitasync2.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_ADMIN_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

interface ShopifyProductNode {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  tags: string[];
  vendor: string;
  variants: {
    edges: Array<{
      node: {
        id: string;
        price: { amount: string; currencyCode: string };
        availableForSale: boolean;
      };
    }>;
  };
}

async function fetchShopifyCatalog(): Promise<{ catalog: string; handles: string[] }> {
  const adminToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
  if (!adminToken) {
    console.warn("SHOPIFY_ACCESS_TOKEN not configured");
    return { catalog: "Catalogue non disponible.", handles: [] };
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
              handle
              productType
              tags
              vendor
              variants(first: 1) {
                edges {
                  node {
                    id
                    price { amount currencyCode }
                    availableForSale
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(SHOPIFY_ADMIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error("Shopify API error:", response.status);
      return { catalog: "Catalogue non disponible.", handles: [] };
    }

    const data = await response.json();
    const products: Array<{ node: ShopifyProductNode }> = data?.data?.products?.edges || [];
    if (products.length === 0) {
      return { catalog: "Aucun produit.", handles: [] };
    }

    const handles: string[] = [];
    const lines = products.map((edge) => {
      const p = edge.node;
      const variant = p.variants.edges[0]?.node;
      const price = variant?.price?.amount || "0";
      const inStock = variant?.availableForSale ? "En stock" : "Rupture";
      handles.push(p.handle);
      return `- handle: "${p.handle}" | ${p.title} | ${p.productType || "N/A"} | ${price}$ | ${inStock}\n  Description: ${p.description.slice(0, 200)}\n  Tags: ${(p.tags || []).join(", ")}`;
    });

    return {
      catalog: `CATALOGUE (${products.length} produits):\n${lines.join("\n\n")}`,
      handles,
    };
  } catch (error) {
    console.error("Error fetching Shopify catalog:", error);
    return { catalog: "Catalogue non disponible.", handles: [] };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch in parallel: health profile, check-ins, conversations, Shopify catalog
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [healthProfileRes, checkinsRes, conversationsRes, shopifyData] = await Promise.all([
      supabase.from("user_health_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("daily_checkins").select("*").eq("user_id", user.id)
        .gte("checkin_date", sevenDaysAgo.toISOString().split("T")[0])
        .order("checkin_date", { ascending: false }),
      // Get last conversation's recent messages
      supabase.from("conversations").select("id").eq("user_id", user.id)
        .order("updated_at", { ascending: false }).limit(1),
      fetchShopifyCatalog(),
    ]);

    const healthProfile = healthProfileRes.data;
    const checkins = checkinsRes.data || [];

    // Fetch last 10 messages from latest conversation
    let conversationContext = "";
    const lastConv = conversationsRes.data?.[0];
    if (lastConv) {
      const { data: messages } = await supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", lastConv.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (messages && messages.length > 0) {
        conversationContext = messages.reverse().map((m) =>
          `${m.role === "user" ? "Utilisateur" : "Coach"}: ${m.content.slice(0, 150)}`
        ).join("\n");
      }
    }

    // Build user context
    const avgSleep = checkins.length ? checkins.reduce((s, c) => s + (c.sleep_quality || 5), 0) / checkins.length : 5;
    const avgEnergy = checkins.length ? checkins.reduce((s, c) => s + (c.energy_level || 5), 0) / checkins.length : 5;
    const avgStress = checkins.length ? checkins.reduce((s, c) => s + (c.stress_level || 5), 0) / checkins.length : 5;

    const systemPrompt = `Tu es VitaSync AI, expert en nutrition et compléments alimentaires.
Ton rôle: analyser le profil de l'utilisateur et recommander entre 2 et 4 produits du catalogue Shopify réel.

═══ PROFIL UTILISATEUR ═══
- Objectifs santé: ${(healthProfile?.health_goals || []).join(", ") || "Non spécifié"}
- Problèmes actuels: ${(healthProfile?.current_issues || []).join(", ") || "Aucun"}
- Niveau d'activité: ${healthProfile?.activity_level || "modéré"}
- Type de régime: ${healthProfile?.diet_type || "omnivore"}
- Allergies: ${(healthProfile?.allergies || []).join(", ") || "Aucune"}
- Qualité de sommeil: ${healthProfile?.sleep_quality || "moyenne"}
- Niveau de stress: ${healthProfile?.stress_level || "moyen"}
- Sports: ${(healthProfile?.sport_types || []).join(", ") || "Aucun"}
- Tendances (7j): Sommeil ${avgSleep.toFixed(1)}/10, Énergie ${avgEnergy.toFixed(1)}/10, Stress ${avgStress.toFixed(1)}/10

${conversationContext ? `═══ HISTORIQUE COACH IA (derniers échanges) ═══\n${conversationContext}\n` : ""}
═══ ${shopifyData.catalog} ═══

INSTRUCTIONS:
1. Analyse le profil, les tendances de santé et l'historique de conversation
2. Choisis entre 2 et 4 produits les PLUS pertinents (pas toujours le même nombre)
3. Privilégie les produits en stock
4. Réponds UNIQUEMENT avec un JSON valide, sans explication
5. Utilise les HANDLES réels du catalogue

Format: {"recommendations": ["handle1", "handle2"]}
ou: {"recommendations": ["handle1", "handle2", "handle3"]}
ou: {"recommendations": ["handle1", "handle2", "handle3", "handle4"]}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Fallback without AI
      const fallback = shopifyData.handles.slice(0, 3);
      return new Response(JSON.stringify({ recommendations: fallback }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Recommande-moi les produits les plus adaptés à mon profil." },
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI error:", aiResponse.status, await aiResponse.text());
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const fallback = shopifyData.handles.slice(0, 3);
      return new Response(JSON.stringify({ recommendations: fallback }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let recommendations: string[] = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
    }

    // Validate against real catalog handles
    const validRecommendations = recommendations
      .filter((handle) => shopifyData.handles.includes(handle))
      .slice(0, 4);

    console.log("AI Recommendations:", validRecommendations);

    return new Response(JSON.stringify({ recommendations: validRecommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
