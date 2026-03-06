const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, assistantMessage } = await req.json();

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "Missing userMessage" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      // Fallback: use first 40 chars of user message
      return new Response(JSON.stringify({ title: userMessage.slice(0, 40) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Tu génères un titre court (max 40 caractères) pour une conversation. Le titre doit résumer le sujet principal en français. Pas de guillemets, pas de ponctuation finale. Exemples: "Boost énergie matinale", "Stack sommeil optimal", "Créatine et musculation". Réponds UNIQUEMENT avec le titre, rien d'autre.`,
          },
          {
            role: "user",
            content: `Question: "${userMessage.slice(0, 200)}"\nRéponse: "${(assistantMessage || '').slice(0, 300)}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      await response.text();
      return new Response(JSON.stringify({ title: userMessage.slice(0, 40) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let title = data.choices?.[0]?.message?.content?.trim() || userMessage.slice(0, 40);
    
    // Clean up: remove quotes, limit length
    title = title.replace(/^["'«]|["'»]$/g, '').trim();
    if (title.length > 50) title = title.slice(0, 47) + '...';

    return new Response(JSON.stringify({ title }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Title generation error:", error);
    return new Response(JSON.stringify({ title: "Nouvelle conversation" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
