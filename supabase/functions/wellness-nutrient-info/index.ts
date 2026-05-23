import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

interface Nutrient { name: string; value: string; unit: string }

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json();
    const entryId: string | undefined = body?.entryId;
    const nutrients: Nutrient[] = Array.isArray(body?.nutrients) ? body.nutrients : [];

    // Basic validation
    if (!nutrients.length || nutrients.length > 20) {
      return new Response(JSON.stringify({ error: "Provide between 1 and 20 nutrients" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const clean = nutrients
      .map(n => ({
        name: String(n.name || "").slice(0, 80).trim(),
        value: String(n.value || "").slice(0, 30).trim(),
        unit: String(n.unit || "").slice(0, 20).trim(),
      }))
      .filter(n => n.name);
    if (!clean.length) {
      return new Response(JSON.stringify({ error: "At least one nutrient name required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nutrientList = clean.map(n => `- ${n.name}${n.value ? ` (user noted: ${n.value} ${n.unit})` : ""}`).join("\n");

    const systemPrompt = `You are VitaSync, a general wellness educator. You do NOT provide medical advice, diagnosis, or clinical interpretation. You never label values as "normal", "abnormal", "high", "low", "deficient", or "critical". You never reference clinical ranges. Frame everything as general educational wellness information.

Output in clean Markdown, in English, 250-400 words, with sections:
## About these nutrients
## Lifestyle & dietary factors people commonly explore
## Supplements people with similar wellness goals often explore

Always end with this exact disclaimer line:
_This is general wellness education only, not a medical interpretation. Always consult your doctor for medical decisions._`;

    const userPrompt = `The user has shared some nutrient values from their wellness report:
${nutrientList}

Please share general educational wellness information about these nutrients — what they support in the body, common lifestyle factors people consider, and supplements people with similar wellness goals often explore. Do NOT interpret these as medical results, do NOT flag values as abnormal, do NOT provide clinical reference ranges.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      const status = aiResponse.status === 429 ? 429 : 500;
      return new Response(JSON.stringify({ error: status === 429 ? "Rate limit exceeded" : "AI request failed" }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content: string = aiData.choices?.[0]?.message?.content || "";

    // Persist as a wellness journal entry (reuse blood_test_analyses table, no medical fields)
    const fileName = clean.map(n => n.name).join(", ").slice(0, 200) || "Wellness entry";

    let savedId = entryId;
    if (entryId) {
      const { error: updateError } = await supabaseUser
        .from("blood_test_analyses")
        .update({
          analysis_text: content,
          status: "completed",
          analyzed_at: new Date().toISOString(),
          abnormal_values: [],
          deficiencies: [],
          suggested_supplements: [],
        })
        .eq("id", entryId)
        .eq("user_id", userId);
      if (updateError) console.error("Update error:", updateError);
    } else {
      const { data: inserted, error: insertError } = await supabaseUser
        .from("blood_test_analyses")
        .insert({
          user_id: userId,
          file_url: "manual",
          file_name: fileName,
          analysis_text: content,
          status: "completed",
          analyzed_at: new Date().toISOString(),
          abnormal_values: [],
          deficiencies: [],
          suggested_supplements: [],
        })
        .select("id")
        .single();
      if (insertError) console.error("Insert error:", insertError);
      savedId = inserted?.id;
    }

    return new Response(JSON.stringify({ success: true, id: savedId, content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});