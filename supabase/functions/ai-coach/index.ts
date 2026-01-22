import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const baseSystemPrompt = `Tu es le Coach IA VitaSync, un assistant santé et bien-être expert et bienveillant. Tu aides les utilisateurs avec :

- Conseils nutritionnels personnalisés
- Recommandations d'exercices adaptés
- Gestion du stress et du sommeil
- Compléments alimentaires et vitamines
- Objectifs de santé et suivi

Règles importantes :
1. Sois toujours bienveillant et encourageant
2. Donne des conseils pratiques et actionnables
3. N'hésite pas à poser des questions pour mieux comprendre les besoins
4. Rappelle toujours de consulter un professionnel de santé pour les cas sérieux
5. Utilise des listes et une mise en forme claire pour tes réponses
6. Réponds en français
7. Personnalise tes réponses en fonction du profil de santé de l'utilisateur quand il est disponible

Tu es là pour accompagner les utilisateurs dans leur parcours de bien-être quotidien.`;

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
  } | null
): string {
  if (!healthProfile) {
    return baseSystemPrompt;
  }

  const contextParts = [];
  
  if (userProfile?.first_name) {
    contextParts.push(`- Prénom: ${userProfile.first_name}`);
  }
  if (healthProfile.age_range) {
    contextParts.push(`- Tranche d'âge: ${healthProfile.age_range}`);
  }
  if (healthProfile.health_goals?.length) {
    contextParts.push(`- Objectifs santé: ${healthProfile.health_goals.join(", ")}`);
  }
  if (healthProfile.current_issues?.length) {
    contextParts.push(`- Problèmes actuels: ${healthProfile.current_issues.join(", ")}`);
  }
  if (healthProfile.activity_level) {
    contextParts.push(`- Niveau d'activité: ${healthProfile.activity_level}`);
  }
  if (healthProfile.diet_type) {
    contextParts.push(`- Type d'alimentation: ${healthProfile.diet_type}`);
  }
  if (healthProfile.sleep_quality) {
    contextParts.push(`- Qualité de sommeil: ${healthProfile.sleep_quality}`);
  }
  if (healthProfile.stress_level) {
    contextParts.push(`- Niveau de stress: ${healthProfile.stress_level}`);
  }
  if (healthProfile.allergies?.length) {
    contextParts.push(`- Allergies: ${healthProfile.allergies.join(", ")}`);
  }
  if (healthProfile.medical_conditions?.length) {
    contextParts.push(`- Conditions médicales: ${healthProfile.medical_conditions.join(", ")}`);
  }
  if (healthProfile.supplements_experience) {
    contextParts.push(`- Expérience avec les compléments: ${healthProfile.supplements_experience}`);
  }

  if (contextParts.length === 0) {
    return baseSystemPrompt;
  }

  return `${baseSystemPrompt}

CONTEXTE UTILISATEUR (utilise ces informations pour personnaliser tes réponses):
${contextParts.join("\n")}

Important: Adapte tes recommandations en tenant compte de ce profil. Par exemple, si l'utilisateur a des allergies, évite de recommander des produits qui pourraient les contenir.`;
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
  // Check if messages is an array
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  // Check array length
  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Maximum ${MAX_MESSAGES} messages allowed` };
  }

  const validatedMessages: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    // Check if message is an object
    if (typeof msg !== "object" || msg === null) {
      return { valid: false, error: `Message at index ${i} must be an object` };
    }

    // Check role field
    if (typeof msg.role !== "string" || !VALID_ROLES.includes(msg.role)) {
      return { valid: false, error: `Invalid role at index ${i}. Must be 'user' or 'assistant'` };
    }

    // Check content field
    if (typeof msg.content !== "string") {
      return { valid: false, error: `Content at index ${i} must be a string` };
    }

    // Check content length
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

serve(async (req) => {
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
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Auth validation failed:", claimsError?.message || "No claims found");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // Fetch user profile and health profile for personalization
    const { data: userProfile } = await supabaseClient
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", userId)
      .single();

    const { data: healthProfile } = await supabaseClient
      .from("user_health_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const systemPrompt = buildEnrichedSystemPrompt(userProfile, healthProfile);
    console.log("Using personalized system prompt:", !!healthProfile);

    // Parse and validate request body
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

    // Validate messages structure
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
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
    console.error("AI coach error:", e);
    return new Response(
      JSON.stringify({ error: "Une erreur s'est produite" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
