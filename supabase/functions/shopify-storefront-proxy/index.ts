const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_STORE_DOMAIN = "vitasync2.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const STOREFRONT_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const MAX_QUERY_LENGTH = 8000;
const MAX_QUERY_DEPTH = 15;
const MAX_BRACE_COUNT = 50;
const FETCH_TIMEOUT_MS = 15000;

/** Calculate the maximum nesting depth of a GraphQL query */
function calculateQueryDepth(query: string): number {
  let maxDepth = 0;
  let currentDepth = 0;
  for (const char of query) {
    if (char === '{') {
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;
    } else if (char === '}') {
      currentDepth--;
    }
  }
  return maxDepth;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STOREFRONT_TOKEN = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    if (!STOREFRONT_TOKEN) {
      return new Response(
        JSON.stringify({ errors: [{ message: "SHOPIFY_STOREFRONT_ACCESS_TOKEN not configured" }] }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { query, variables } = await req.json();

    // Validate query is a string
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ errors: [{ message: "Invalid query" }] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Query length limit
    if (query.length > MAX_QUERY_LENGTH) {
      return new Response(
        JSON.stringify({ errors: [{ message: "Query too large" }] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Brace count check
    const openBraces = (query.match(/\{/g) || []).length;
    if (openBraces > MAX_BRACE_COUNT) {
      return new Response(
        JSON.stringify({ errors: [{ message: "Query too complex" }] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Depth analysis
    const depth = calculateQueryDepth(query);
    if (depth > MAX_QUERY_DEPTH) {
      return new Response(
        JSON.stringify({ errors: [{ message: "Query nesting too deep" }] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(STOREFRONT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.ok ? 200 : response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return new Response(
          JSON.stringify({ errors: [{ message: "Request timed out" }] }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error("Shopify proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ errors: [{ message }] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
