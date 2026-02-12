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

    // Fetch all data in parallel
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [healthProfileRes, supplementsRes, logsRes, checkinsRes, conversationsRes] = await Promise.all([
      supabase.from("user_health_profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("supplement_tracking").select("*").eq("user_id", user.id).eq("active", true),
      supabase.from("supplement_logs").select("*")
        .gte("taken_at", thirtyDaysAgo.toISOString()),
      supabase.from("daily_checkins").select("*").eq("user_id", user.id)
        .gte("checkin_date", sevenDaysAgo.toISOString().split("T")[0])
        .order("checkin_date", { ascending: false }),
      supabase.from("conversations").select("id").eq("user_id", user.id)
        .order("updated_at", { ascending: false }).limit(1),
    ]);

    const healthProfile = healthProfileRes.data;
    const supplements = supplementsRes.data || [];
    const checkins = checkinsRes.data || [];

    // Filter logs for this user's supplements
    const supplementIds = supplements.map((s: { id: string }) => s.id);
    const allLogs = (logsRes.data || []).filter((l: { tracking_id: string }) => 
      supplementIds.includes(l.tracking_id)
    );

    // Fetch recent coach conversation
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
        conversationContext = messages.reverse().map((m: { role: string; content: string }) =>
          `${m.role === "user" ? "Utilisateur" : "Coach"}: ${m.content.slice(0, 150)}`
        ).join("\n");
      }
    }

    // Calculate regularity data
    const supplementDetails = supplements.map((s: { id: string; product_name: string; time_of_day: string | null; dosage: string | null }) => {
      const sLogs = allLogs.filter((l: { tracking_id: string }) => l.tracking_id === s.id);
      const daysActive = 30;
      const daysTaken = new Set(sLogs.map((l: { taken_at: string }) => 
        new Date(l.taken_at).toISOString().split("T")[0]
      )).size;
      return {
        name: s.product_name,
        time_of_day: s.time_of_day || "morning",
        dosage: s.dosage,
        days_taken: daysTaken,
        days_active: daysActive,
        regularity_pct: Math.round((daysTaken / daysActive) * 100),
      };
    });

    // Checkin averages
    const avgSleep = checkins.length ? checkins.reduce((s: number, c: { sleep_quality: number | null }) => s + (c.sleep_quality || 5), 0) / checkins.length : 5;
    const avgEnergy = checkins.length ? checkins.reduce((s: number, c: { energy_level: number | null }) => s + (c.energy_level || 5), 0) / checkins.length : 5;
    const avgStress = checkins.length ? checkins.reduce((s: number, c: { stress_level: number | null }) => s + (c.stress_level || 5), 0) / checkins.length : 5;

    const systemPrompt = `Tu es VitaSync AI, expert en nutrition et compléments alimentaires.
Analyse la régularité de prise et l'utilité des compléments de cet utilisateur.

═══ PROFIL UTILISATEUR ═══
- Objectifs: ${(healthProfile?.health_goals || []).join(", ") || "Non spécifié"}
- Problèmes actuels: ${(healthProfile?.current_issues || []).join(", ") || "Aucun"}
- Activité: ${healthProfile?.activity_level || "modéré"}
- Régime: ${healthProfile?.diet_type || "omnivore"}
- Allergies: ${(healthProfile?.allergies || []).join(", ") || "Aucune"}
- Sommeil: ${healthProfile?.sleep_quality || "moyenne"}
- Stress: ${healthProfile?.stress_level || "moyen"}
- Tendances (7j): Sommeil ${avgSleep.toFixed(1)}/10, Énergie ${avgEnergy.toFixed(1)}/10, Stress ${avgStress.toFixed(1)}/10

═══ COMPLÉMENTS SUIVIS ═══
${supplementDetails.map((s: { name: string; time_of_day: string; dosage: string | null; days_taken: number; regularity_pct: number }) => 
  `- ${s.name} (${s.time_of_day}) ${s.dosage ? '| Dosage: ' + s.dosage : ''} | Pris ${s.days_taken}/30 jours (${s.regularity_pct}%)`
).join("\n") || "Aucun complément suivi"}

${conversationContext ? `═══ HISTORIQUE COACH IA ═══\n${conversationContext}\n` : ""}

INSTRUCTIONS: Utilise le tool "provide_insights" pour retourner ton analyse structurée.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
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
          { role: "user", content: "Analyse mes compléments et ma régularité de prise." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_insights",
              description: "Retourne l'analyse structurée de la régularité et de l'utilité des compléments.",
              parameters: {
                type: "object",
                properties: {
                  regularity_score: {
                    type: "number",
                    description: "Score de régularité global de 0 à 100",
                  },
                  regularity_comment: {
                    type: "string",
                    description: "Commentaire court sur la régularité (max 2 phrases)",
                  },
                  supplement_reviews: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Nom du complément" },
                        utility: { type: "string", description: "Niveau d'utilité: Très utile, Utile, Modéré, À reconsidérer" },
                        comment: { type: "string", description: "Commentaire court personnalisé (max 1 phrase)" },
                      },
                      required: ["name", "utility", "comment"],
                      additionalProperties: false,
                    },
                  },
                  recommendations: {
                    type: "string",
                    description: "Recommandations générales (2-3 phrases max)",
                  },
                },
                required: ["regularity_score", "regularity_comment", "supplement_reviews", "recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_insights" } },
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData).slice(0, 500));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let insights = null;

    if (toolCall?.function?.arguments) {
      try {
        insights = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool call args:", e);
      }
    }

    // Fallback: try to parse from content
    if (!insights) {
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) insights = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    if (!insights) {
      return new Response(JSON.stringify({ error: "Failed to parse AI insights" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ insights }), {
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
