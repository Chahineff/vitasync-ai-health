import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_STORE_DOMAIN = "vitasync2.myshopify.com";
const SHOPIFY_API_VERSION = "2025-07";
const ADMIN_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

// Transform Admin API response to match Storefront API format
function transformProductNode(product: Record<string, unknown> | null) {
  if (!product) return;

  // Fix priceRange amount (Admin API returns cents, Storefront returns dollars)
  const priceRange = product.priceRange as Record<string, unknown> | undefined;
  const minVariantPrice = priceRange?.minVariantPrice as Record<string, unknown> | undefined;
  if (minVariantPrice?.amount) {
    const cents = parseFloat(minVariantPrice.amount as string);
    if (cents > 100) {
      // Likely in cents — convert to dollars
      minVariantPrice.amount = (cents / 100).toFixed(2);
    }
  }

  const currencyCode = (minVariantPrice?.currencyCode as string) || "USD";

  // Fix variant prices: Admin returns scalar string, Storefront returns MoneyV2
  const variants = product.variants as Record<string, unknown> | undefined;
  const variantEdges = variants?.edges as Array<{ node: Record<string, unknown> }> | undefined;
  if (variantEdges) {
    for (const variantEdge of variantEdges) {
      const variant = variantEdge.node;
      if (variant && typeof variant.price === "string") {
        variant.price = { amount: variant.price, currencyCode };
      }
    }
  }
}

function transformResponse(data: Record<string, unknown>): Record<string, unknown> {
  const d = data.data as Record<string, unknown> | undefined;
  if (!d) return data;

  // products list
  const products = d.products as Record<string, unknown> | undefined;
  const productEdges = products?.edges as Array<{ node: Record<string, unknown> }> | undefined;
  if (productEdges) {
    for (const edge of productEdges) transformProductNode(edge.node);
  }

  // productByHandle
  if (d.productByHandle) transformProductNode(d.productByHandle as Record<string, unknown>);

  // node (product by ID)
  if (d.node) transformProductNode(d.node as Record<string, unknown>);

  // cart responses — pass through as-is (cart mutations use Storefront-compatible fields)
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN");
    if (!SHOPIFY_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ errors: [{ message: "SHOPIFY_ACCESS_TOKEN not configured" }] }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { query, variables } = await req.json();

    // Rewrite query: variant price sub-selections are invalid in Admin API
    // Replace `price { amount currencyCode }` on variants with just `price`
    const adminQuery = query.replace(
      /price\s*\{\s*amount\s+currencyCode\s*\}/g,
      "price"
    );

    const response = await fetch(ADMIN_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query: adminQuery, variables }),
    });

    const data = await response.json();

    // Transform Admin response to match Storefront format
    const transformed = transformResponse(data);

    return new Response(JSON.stringify(transformed), {
      status: response.ok ? 200 : response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Shopify proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ errors: [{ message }] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
