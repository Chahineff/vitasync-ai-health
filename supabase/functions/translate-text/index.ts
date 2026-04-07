// Translate Text Edge Function - VitaSync
// Translates product enriched data fields to the user's locale
// Uses Lovable AI with caching

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/vitasyncai\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^http:\/\/localhost:(5173|8080)$/,
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin))
    ? origin
    : "https://vitasyncai.lovable.app";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const LOCALE_NAMES: Record<string, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  ar: "Arabic",
  zh: "Simplified Chinese",
  pt: "Brazilian Portuguese",
};

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { texts, targetLocale, sourceLocale } = await req.json();

    if (!texts || typeof texts !== "object" || !targetLocale) {
      return new Response(
        JSON.stringify({ error: "Missing texts object or targetLocale" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If target is same as source, return as-is
    const src = sourceLocale || "en";
    if (targetLocale === src) {
      return new Response(
        JSON.stringify({ translations: texts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetLang = LOCALE_NAMES[targetLocale] || targetLocale;
    const sourceLang = LOCALE_NAMES[src] || src;

    // Build the prompt with all texts to translate
    const entries = Object.entries(texts).filter(([_, v]) => v && typeof v === "string" && (v as string).trim().length > 0);
    
    if (entries.length === 0) {
      return new Response(
        JSON.stringify({ translations: {} }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const textBlock = entries.map(([key, val]) => `[${key}]: ${val}`).join("\n");

    const prompt = `Translate the following texts from ${sourceLang} to ${targetLang}. 
These are health supplement product descriptions for a wellness app called VitaSync.
Keep scientific terms, brand names, and ingredient names accurate.
Return ONLY a valid JSON object mapping each key to its translated value. No markdown, no explanation.

Texts to translate:
${textBlock}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You are a professional translator for health/wellness content. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ translations: texts }), // fallback to originals
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (may have markdown fences)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse translation response:", content.substring(0, 200));
      return new Response(
        JSON.stringify({ translations: texts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const translated = JSON.parse(jsonMatch[0]);

    // Merge: use translated values where available, fallback to originals
    const result: Record<string, string> = {};
    for (const [key, val] of entries) {
      result[key] = translated[key] || (val as string);
    }

    return new Response(
      JSON.stringify({ translations: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: "Translation failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
