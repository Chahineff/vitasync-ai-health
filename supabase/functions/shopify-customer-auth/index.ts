import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function getOAuthEndpoints(shopId: string) {
  const base = `https://shopify.com/authentication/${shopId}`;
  return {
    authorization_endpoint: `${base}/oauth/authorize`,
    token_endpoint: `${base}/oauth/token`,
    end_session_endpoint: `${base}/logout`,
    jwks_uri: `${base}/.well-known/jwks.json`,
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
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
        JSON.stringify({ error: "Missing SHOPIFY_SHOP_ID or SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, code, code_verifier, redirect_uri, state, nonce } = await req.json();

    // ── Action: get-auth-url ──
    if (action === "get-auth-url") {
      const config = getOAuthEndpoints(SHOP_ID);
      const authEndpoint = config.authorization_endpoint;

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        scope: "openid email customer-account-api:full",
        response_type: "code",
        redirect_uri: redirect_uri,
        state: state,
        nonce: nonce,
        code_challenge: code, // frontend sends code_challenge here
        code_challenge_method: "S256",
      });

      return new Response(
        JSON.stringify({ url: `${authEndpoint}?${params.toString()}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Authenticate user for token operations ──
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

    // ── Action: exchange-token ──
    if (action === "exchange-token") {
      if (!code || !code_verifier || !redirect_uri) {
        return new Response(
          JSON.stringify({ error: "Missing code, code_verifier, or redirect_uri" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const config = getOAuthEndpoints(SHOP_ID);
      const tokenEndpoint = config.token_endpoint;

      const tokenRes = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          redirect_uri: redirect_uri,
          code: code,
          code_verifier: code_verifier,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Token exchange failed:", errText);
        return new Response(
          JSON.stringify({ error: "Token exchange failed", details: errText }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenRes.json();
      console.log("Token exchange success — token prefix:", tokenData.access_token?.substring(0, 6), "length:", tokenData.access_token?.length, "has_refresh:", !!tokenData.refresh_token);
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      // Extract Shopify customer ID from id_token if present
      let shopifyCustomerId: string | null = null;
      if (tokenData.id_token) {
        try {
          const payload = JSON.parse(atob(tokenData.id_token.split(".")[1]));
          shopifyCustomerId = payload.sub || null;
        } catch { /* ignore */ }
      }

      // Upsert token in database
      const { error: dbError } = await supabaseAdmin
        .from("shopify_customer_tokens")
        .upsert({
          user_id: userId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          id_token: tokenData.id_token || null,
          expires_at: expiresAt,
          shopify_customer_id: shopifyCustomerId,
          scopes: tokenData.scope || "openid email customer-account-api:full",
        }, { onConflict: "user_id" });

      if (dbError) {
        console.error("DB upsert error:", dbError);
        return new Response(
          JSON.stringify({ error: "Failed to store tokens" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, shopify_customer_id: shopifyCustomerId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Action: refresh ──
    if (action === "refresh") {
      const { data: tokenRow, error: fetchErr } = await supabaseAdmin
        .from("shopify_customer_tokens")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchErr || !tokenRow) {
        return new Response(
          JSON.stringify({ error: "No Shopify account linked" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const config = getOAuthEndpoints(SHOP_ID);
      const tokenEndpoint = config.token_endpoint;

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
        // If refresh fails, delete the token row (user needs to re-auth)
        await supabaseAdmin.from("shopify_customer_tokens").delete().eq("user_id", userId);
        return new Response(
          JSON.stringify({ error: "Token refresh failed, please re-authenticate" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refreshData = await refreshRes.json();
      const expiresAt = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

      await supabaseAdmin
        .from("shopify_customer_tokens")
        .update({
          access_token: refreshData.access_token,
          refresh_token: refreshData.refresh_token || tokenRow.refresh_token,
          expires_at: expiresAt,
        })
        .eq("user_id", userId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Action: status ──
    if (action === "status") {
      const { data: tokenRow } = await supabaseAdmin
        .from("shopify_customer_tokens")
        .select("shopify_customer_id, expires_at, scopes")
        .eq("user_id", userId)
        .single();

      return new Response(
        JSON.stringify({
          connected: !!tokenRow,
          shopify_customer_id: tokenRow?.shopify_customer_id || null,
          expires_at: tokenRow?.expires_at || null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Action: disconnect ──
    if (action === "disconnect") {
      await supabaseAdmin.from("shopify_customer_tokens").delete().eq("user_id", userId);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("shopify-customer-auth error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
