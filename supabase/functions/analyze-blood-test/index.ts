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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth - validate user with anon key + user token (respects RLS)
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

    // Service role client ONLY for storage downloads (requires elevated access)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { analysisId, model: requestedModel } = await req.json();
    if (!analysisId) {
      return new Response(JSON.stringify({ error: "analysisId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the analysis record (user-scoped via RLS)
    const { data: analysis, error: fetchError } = await supabaseUser
      .from("blood_test_analyses")
      .select("*")
      .eq("id", analysisId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !analysis) {
      return new Response(JSON.stringify({ error: "Analysis not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the PDF from storage as base64
    // file_url is stored as "blood-tests/userId/filename.pdf", strip bucket prefix
    const rawPath = analysis.file_url;
    const filePath = rawPath.startsWith('blood-tests/') ? rawPath.slice('blood-tests/'.length) : rawPath;
    console.log("Downloading from blood-tests bucket, path:", filePath);
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('blood-tests')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return new Response(JSON.stringify({ error: "Could not download file" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 8192;
    let binary = "";
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      for (let j = 0; j < chunk.length; j++) {
        binary += String.fromCharCode(chunk[j]);
      }
    }
    const base64Pdf = btoa(binary);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Tu es un expert en analyses sanguines et biologie médicale.
L'utilisateur t'envoie une analyse sanguine (résultats de laboratoire) en PDF. Tu dois :

1. EXTRAIRE les valeurs importantes du document (OCR si nécessaire)
2. IDENTIFIER les valeurs anormales (hors normes)  
3. DÉTECTER les déficiences potentielles
4. SUGGÉRER des compléments alimentaires adaptés

IMPORTANT:
- Tu n'es PAS médecin. Précise toujours que ces suggestions ne remplacent pas un avis médical.
- Sois précis sur les valeurs et les unités
- Classe les anomalies par gravité (léger / modéré / important)

Réponds en JSON strict avec cette structure:
{
  "analysis_text": "Résumé textuel complet de l'analyse (en français, Markdown)",
  "abnormal_values": [
    {"name": "Nom du biomarqueur", "value": "valeur mesurée", "unit": "unité", "reference": "plage de référence", "status": "bas|élevé|critique", "interpretation": "explication courte"}
  ],
  "deficiencies": [
    {"name": "Nom de la déficience", "severity": "léger|modéré|important", "description": "description"}
  ],
  "suggested_supplements": [
    {"name": "Nom du complément", "reason": "pourquoi ce complément", "dosage_suggestion": "dosage recommandé"}
  ]
}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: requestedModel || "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: [
              { type: "text", text: "Analyse ce document PDF d'analyse sanguine et retourne les résultats en JSON." },
              { type: "image_url", image_url: { url: `data:application/pdf;base64,${base64Pdf}` } }
            ]
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON response
    let parsedResult: {
      analysis_text?: string;
      abnormal_values?: unknown[];
      deficiencies?: unknown[];
      suggested_supplements?: unknown[];
    } = {};

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
      parsedResult = {
        analysis_text: content,
        abnormal_values: [],
        deficiencies: [],
        suggested_supplements: [],
      };
    }

    // Update the analysis record with results (user-scoped via RLS)
    const { error: updateError } = await supabaseUser
      .from("blood_test_analyses")
      .update({
        analysis_text: parsedResult.analysis_text || content,
        abnormal_values: parsedResult.abnormal_values || [],
        deficiencies: parsedResult.deficiencies || [],
        suggested_supplements: parsedResult.suggested_supplements || [],
        status: "completed",
        analyzed_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: parsedResult 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
