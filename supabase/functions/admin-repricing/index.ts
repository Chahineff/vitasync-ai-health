import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOPIFY_STORE_DOMAIN = Deno.env.get("VITE_SHOPIFY_STORE_DOMAIN")!;
const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ACCESS_TOKEN")!;
const ADMIN_API_VERSION = "2025-01";

function shopifyAdminUrl(path: string): string {
  return `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/${path}`;
}

async function shopifyAdminRequest(path: string, options: RequestInit = {}) {
  const url = shopifyAdminUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Admin API error [${res.status}]: ${text}`);
  }
  return res.json();
}

// Fetch ALL products with pagination
async function fetchAllProducts(): Promise<any[]> {
  const all: any[] = [];
  let url: string | null = shopifyAdminUrl("products.json?limit=250&fields=id,title,handle,variants");

  while (url) {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify Admin API error [${res.status}]: ${text}`);
    }
    const data = await res.json();
    all.push(...(data.products || []));

    // Parse Link header for pagination
    const linkHeader = res.headers.get("Link");
    url = null;
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
      if (nextMatch) url = nextMatch[1];
    }
  }
  return all;
}

// Update a single variant price
async function updateVariantPrice(variantId: number, newPrice: string) {
  return shopifyAdminRequest(`variants/${variantId}.json`, {
    method: "PUT",
    body: JSON.stringify({
      variant: { id: variantId, price: newPrice },
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { action, variantId, newPrice } = await req.json();

    if (action === "fetch-products") {
      const products = await fetchAllProducts();
      // Flatten to variant-level for easy matching
      const variants = products.flatMap((p: any) =>
        (p.variants || []).map((v: any) => ({
          productId: p.id,
          productTitle: p.title,
          productHandle: p.handle,
          variantId: v.id,
          variantTitle: v.title,
          sku: v.sku,
          currentPrice: v.price,
        }))
      );
      return new Response(JSON.stringify({ variants }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update-price") {
      if (!variantId || !newPrice) {
        return new Response(JSON.stringify({ error: "Missing variantId or newPrice" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await updateVariantPrice(variantId, newPrice);
      return new Response(JSON.stringify({ success: true, variant: result.variant }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin repricing error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
