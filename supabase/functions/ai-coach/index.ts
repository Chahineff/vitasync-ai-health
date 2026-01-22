import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.90.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Shopify config
const SHOPIFY_STORE_DOMAIN = "vitasync2.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

async function fetchShopifyCatalog(): Promise<string> {
  const storefrontToken = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
  
  if (!storefrontToken) {
    console.warn("SHOPIFY_STOREFRONT_ACCESS_TOKEN not configured");
    return "Catalogue non disponible.";
  }

  try {
    const query = `
      query {
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              productType
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(SHOPIFY_STOREFRONT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontToken
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      console.error("Shopify API error:", response.status);
      return "Catalogue non disponible.";
    }

    const data = await response.json();
    const products = data?.data?.products?.edges || [];

    if (products.length === 0) {
      return "Aucun produit dans le catalogue.";
    }

    // Format catalog for the prompt
    const catalogLines = products.map((edge: { node: { id: string; title: string; description: string; productType: string; variants: { edges: Array<{ node: { id: string; price: { amount: string; currencyCode: string } } }> } } }) => {
      const p = edge.node;
      const variant = p.variants.edges[0]?.node;
      const price = variant?.price ? `${variant.price.amount}${variant.price.currencyCode === 'EUR' ? '€' : variant.price.currencyCode}` : 'Prix non disponible';
      const shortDesc = p.description?.slice(0, 100) || 'Complément alimentaire';
      const productId = p.id.split('/').pop(); // Extract numeric ID from gid://shopify/Product/123
      const variantId = variant?.id || '';
      return `- ${p.title} (ID: ${productId}, VariantID: ${variantId}, ${price}) - ${shortDesc}`;
    });

    return catalogLines.join('\n');
  } catch (error) {
    console.error("Error fetching Shopify catalog:", error);
    return "Catalogue non disponible.";
  }
}

const baseSystemPrompt = `Tu es le Coach IA VitaSync. Tu donnes des conseils COURTS et DIRECTS.

RÈGLES STRICTES DE FORMAT:
1. Maximum 2-3 phrases par réponse (sauf si l'utilisateur demande explicitement des détails)
2. Utilise des listes à puces très courtes (1-3 items max)
3. Va DROIT AU BUT, pas de formules de politesse longues
4. Réponds en français

QUAND TU RECOMMANDES UN PRODUIT:
- Utilise OBLIGATOIREMENT le format: [[PRODUCT:productId:variantId:nom:prix]]
- Exemple: "Essaie [[PRODUCT:15002251886960:gid://shopify/ProductVariant/123:5-HTP:19.99€]] pour le sommeil."
- Tu peux recommander 1 à 3 produits max par réponse

IMPORTANT:
- Rappelle de consulter un professionnel pour les cas sérieux
- Personnalise en fonction du profil utilisateur`;

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
  } | null,
  catalog: string
): string {
  const contextParts: string[] = [];
  
  if (userProfile?.first_name) {
    contextParts.push(`- Prénom: ${userProfile.first_name}`);
  }
  if (healthProfile) {
    if (healthProfile.age_range) {
      contextParts.push(`- Âge: ${healthProfile.age_range}`);
    }
    if (healthProfile.health_goals?.length) {
      contextParts.push(`- Objectifs: ${healthProfile.health_goals.join(", ")}`);
    }
    if (healthProfile.current_issues?.length) {
      contextParts.push(`- Problèmes: ${healthProfile.current_issues.join(", ")}`);
    }
    if (healthProfile.activity_level) {
      contextParts.push(`- Activité: ${healthProfile.activity_level}`);
    }
    if (healthProfile.diet_type) {
      contextParts.push(`- Alimentation: ${healthProfile.diet_type}`);
    }
    if (healthProfile.sleep_quality) {
      contextParts.push(`- Sommeil: ${healthProfile.sleep_quality}`);
    }
    if (healthProfile.stress_level) {
      contextParts.push(`- Stress: ${healthProfile.stress_level}`);
    }
    if (healthProfile.allergies?.length) {
      contextParts.push(`- Allergies: ${healthProfile.allergies.join(", ")}`);
    }
    if (healthProfile.medical_conditions?.length) {
      contextParts.push(`- Conditions: ${healthProfile.medical_conditions.join(", ")}`);
    }
  }

  let fullPrompt = baseSystemPrompt;

  fullPrompt += `\n\nCATALOGUE VITASYNC (utilise ces IDs pour recommander):\n${catalog}`;

  if (contextParts.length > 0) {
    fullPrompt += `\n\nPROFIL UTILISATEUR:\n${contextParts.join("\n")}`;
  }

  return fullPrompt;
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
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Messages must be an array" };
  }

  if (messages.length === 0) {
    return { valid: false, error: "Messages array cannot be empty" };
  }

  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Maximum ${MAX_MESSAGES} messages allowed` };
  }

  const validatedMessages: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (typeof msg !== "object" || msg === null) {
      return { valid: false, error: `Message at index ${i} must be an object` };
    }

    if (typeof msg.role !== "string" || !VALID_ROLES.includes(msg.role)) {
      return { valid: false, error: `Invalid role at index ${i}. Must be 'user' or 'assistant'` };
    }

    if (typeof msg.content !== "string") {
      return { valid: false, error: `Content at index ${i} must be a string` };
    }

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

    // Fetch user profile, health profile, and Shopify catalog in parallel
    const [userProfileResult, healthProfileResult, catalog] = await Promise.all([
      supabaseClient
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", userId)
        .single(),
      supabaseClient
        .from("user_health_profiles")
        .select("*")
        .eq("user_id", userId)
        .single(),
      fetchShopifyCatalog()
    ]);

    const userProfile = userProfileResult.data;
    const healthProfile = healthProfileResult.data;

    const systemPrompt = buildEnrichedSystemPrompt(userProfile, healthProfile, catalog);
    console.log("System prompt built with catalog:", catalog.slice(0, 200) + "...");

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
