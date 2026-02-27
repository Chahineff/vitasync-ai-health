import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CUSTOMER_API_VERSION = "2025-01";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SHOP_ID = Deno.env.get("SHOPIFY_SHOP_ID");
    const CLIENT_ID = Deno.env.get("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!SHOP_ID || !CLIENT_ID) {
      return new Response(
        JSON.stringify({ error: "Missing configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service role client for token operations (bypasses RLS)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub;

    // Get stored customer token
    const { data: tokenRow, error: fetchErr } = await supabaseAdmin
      .from("shopify_customer_tokens")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchErr || !tokenRow) {
      return new Response(
        JSON.stringify({ error: "No Shopify account linked", code: "NOT_LINKED" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired, refresh if needed
    let accessToken = tokenRow.access_token;
    const expiresAt = new Date(tokenRow.expires_at);
    const now = new Date();
    const bufferMs = 60 * 1000; // 1 minute buffer

    if (now.getTime() + bufferMs >= expiresAt.getTime()) {
      console.log("Token expired, refreshing...");
      const tokenEndpoint = `https://shopify.com/authentication/${SHOP_ID}/oauth/token`;

      const refreshRes = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: CLIENT_ID,
          refresh_token: tokenRow.refresh_token,
        }),
      });

      if (!refreshRes.ok) {
        const errText = await refreshRes.text();
        console.error("Token refresh failed:", errText);
        // Clean up invalid tokens
        await supabaseAdmin.from("shopify_customer_tokens").delete().eq("user_id", userId);
        return new Response(
          JSON.stringify({ error: "Session expired, please re-authenticate", code: "TOKEN_EXPIRED" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refreshData = await refreshRes.json();
      accessToken = refreshData.access_token;
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

      await supabaseAdmin
        .from("shopify_customer_tokens")
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token || tokenRow.refresh_token,
          expires_at: newExpiresAt,
        })
        .eq("user_id", userId);
    }

    // Execute Customer Account API GraphQL query
    const { query, variables } = await req.json();
    const apiUrl = `https://shopify.com/${SHOP_ID}/account/customer/api/${CUSTOMER_API_VERSION}/graphql`;

    const graphqlRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await graphqlRes.json();

    return new Response(JSON.stringify(data), {
      status: graphqlRes.ok ? 200 : graphqlRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("shopify-customer-api error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
