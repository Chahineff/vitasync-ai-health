import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
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

    // Fetch user health profile
    const { data: healthProfile } = await supabase
      .from("user_health_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Fetch recent check-ins (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("user_id", user.id)
      .gte("checkin_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("checkin_date", { ascending: false });

    // Prepare user context for AI
    const userContext = {
      healthGoals: healthProfile?.health_goals || [],
      currentIssues: healthProfile?.current_issues || [],
      activityLevel: healthProfile?.activity_level || "moderate",
      dietType: healthProfile?.diet_type || "omnivore",
      allergies: healthProfile?.allergies || [],
      sleepQuality: healthProfile?.sleep_quality || "average",
      stressLevel: healthProfile?.stress_level || "medium",
      sportTypes: healthProfile?.sport_types || [],
      recentTrends: {
        avgSleep: checkins?.length ? checkins.reduce((sum, c) => sum + (c.sleep_quality || 5), 0) / checkins.length : 5,
        avgEnergy: checkins?.length ? checkins.reduce((sum, c) => sum + (c.energy_level || 5), 0) / checkins.length : 5,
        avgStress: checkins?.length ? checkins.reduce((sum, c) => sum + (c.stress_level || 5), 0) / checkins.length : 5,
      }
    };

    // Product catalog with handles (simplified - in production, fetch from Shopify)
    const productCatalog = [
      { handle: "whey-protein-chocolate", category: "sport", keywords: ["sport", "muscle", "protein", "recovery"] },
      { handle: "whey-protein-vanilla", category: "sport", keywords: ["sport", "muscle", "protein", "recovery"] },
      { handle: "omega-3-fish-oil", category: "wellness", keywords: ["heart", "brain", "inflammation", "focus"] },
      { handle: "magnesium-bisglycinate", category: "wellness", keywords: ["sleep", "stress", "relaxation", "muscles"] },
      { handle: "vitamin-d3-k2", category: "vitamins", keywords: ["immunity", "bones", "energy", "mood"] },
      { handle: "ashwagandha-extract", category: "wellness", keywords: ["stress", "anxiety", "energy", "adaptogen"] },
      { handle: "creatine-monohydrate", category: "sport", keywords: ["sport", "strength", "power", "muscle"] },
      { handle: "probiotics-50-billion", category: "digestive", keywords: ["digestion", "gut", "immunity", "bloating"] },
      { handle: "multivitamin-complete", category: "vitamins", keywords: ["general", "energy", "immunity", "wellbeing"] },
      { handle: "zinc-picolinate", category: "vitamins", keywords: ["immunity", "skin", "hormones", "recovery"] },
      { handle: "lions-mane-mushroom", category: "brain", keywords: ["focus", "memory", "brain", "cognition"] },
      { handle: "melatonin-3mg", category: "wellness", keywords: ["sleep", "jet-lag", "circadian", "rest"] },
      { handle: "bcaa-powder", category: "sport", keywords: ["sport", "recovery", "endurance", "muscle"] },
      { handle: "collagen-peptides", category: "wellness", keywords: ["skin", "joints", "hair", "nails"] },
      { handle: "l-theanine", category: "brain", keywords: ["calm", "focus", "stress", "relaxation"] },
    ];

    // Build AI prompt
    const systemPrompt = `Tu es VitaSync AI, un expert en nutrition et compléments alimentaires. 
Ton rôle est de recommander 3 produits du catalogue qui correspondent le mieux au profil de l'utilisateur.

Profil utilisateur:
- Objectifs santé: ${userContext.healthGoals.join(", ") || "Non spécifié"}
- Problèmes actuels: ${userContext.currentIssues.join(", ") || "Aucun"}
- Niveau d'activité: ${userContext.activityLevel}
- Type de régime: ${userContext.dietType}
- Allergies: ${userContext.allergies.join(", ") || "Aucune"}
- Qualité de sommeil: ${userContext.sleepQuality}
- Niveau de stress: ${userContext.stressLevel}
- Sports pratiqués: ${userContext.sportTypes.join(", ") || "Aucun"}
- Tendances récentes (7 jours):
  - Sommeil moyen: ${userContext.recentTrends.avgSleep.toFixed(1)}/10
  - Énergie moyenne: ${userContext.recentTrends.avgEnergy.toFixed(1)}/10
  - Stress moyen: ${userContext.recentTrends.avgStress.toFixed(1)}/10

Catalogue disponible:
${productCatalog.map(p => `- ${p.handle} (${p.category}): ${p.keywords.join(", ")}`).join("\n")}

IMPORTANT: Réponds UNIQUEMENT avec un JSON valide contenant exactement 3 handles de produits, sans explication.
Format: {"recommendations": ["handle1", "handle2", "handle3"]}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      // Fallback: return recommendations based on simple logic
      const fallbackRecommendations = selectFallbackProducts(userContext, productCatalog);
      return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Recommande-moi 3 produits adaptés à mon profil." }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI error:", await aiResponse.text());
      const fallbackRecommendations = selectFallbackProducts(userContext, productCatalog);
      return new Response(JSON.stringify({ recommendations: fallbackRecommendations }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from AI response
    let recommendations: string[] = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      recommendations = selectFallbackProducts(userContext, productCatalog);
    }

    // Validate recommendations exist in catalog
    const validRecommendations = recommendations.filter(handle => 
      productCatalog.some(p => p.handle === handle)
    ).slice(0, 3);

    // If not enough valid recommendations, fill with fallback
    if (validRecommendations.length < 3) {
      const fallback = selectFallbackProducts(userContext, productCatalog);
      for (const handle of fallback) {
        if (validRecommendations.length >= 3) break;
        if (!validRecommendations.includes(handle)) {
          validRecommendations.push(handle);
        }
      }
    }

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

function selectFallbackProducts(
  userContext: any,
  catalog: { handle: string; category: string; keywords: string[] }[]
): string[] {
  const scores: { handle: string; score: number }[] = [];

  for (const product of catalog) {
    let score = 0;

    // Score based on health goals
    for (const goal of userContext.healthGoals) {
      const goalLower = goal.toLowerCase();
      if (product.keywords.some(k => goalLower.includes(k) || k.includes(goalLower))) {
        score += 10;
      }
    }

    // Score based on activity level
    if (userContext.activityLevel === "high" && product.category === "sport") {
      score += 5;
    }

    // Score based on sleep quality
    if (userContext.sleepQuality === "poor" && product.keywords.includes("sleep")) {
      score += 8;
    }

    // Score based on stress level
    if (userContext.stressLevel === "high" && product.keywords.some(k => ["stress", "relaxation", "calm"].includes(k))) {
      score += 8;
    }

    // Score based on recent trends
    if (userContext.recentTrends.avgSleep < 5 && product.keywords.includes("sleep")) {
      score += 5;
    }
    if (userContext.recentTrends.avgEnergy < 5 && product.keywords.includes("energy")) {
      score += 5;
    }
    if (userContext.recentTrends.avgStress > 6 && product.keywords.includes("stress")) {
      score += 5;
    }

    scores.push({ handle: product.handle, score });
  }

  // Sort by score and return top 3
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.handle);
}
