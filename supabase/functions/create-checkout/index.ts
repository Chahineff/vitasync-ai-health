import { createClient } from "npm:@supabase/supabase-js@2";
import {
  corsHeaders,
  createStripeClient,
  resolveOrCreateCustomer,
  type StripeEnv,
} from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const priceId = body.priceId as string | undefined;
    const environment = (body.environment ?? "sandbox") as StripeEnv;
    const returnUrl = body.returnUrl as string | undefined;

    if (!priceId) {
      return new Response(JSON.stringify({ error: "priceId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (environment !== "sandbox" && environment !== "live") {
      return new Response(JSON.stringify({ error: "Invalid environment" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = createStripeClient(environment);

    // Resolve human-readable price ID (e.g. "go_ai_monthly") to Stripe price object via lookup_key
    const prices = await stripe.prices.list({ lookup_keys: [priceId], limit: 1, active: true });
    const stripePrice = prices.data[0];
    if (!stripePrice) {
      return new Response(JSON.stringify({ error: `Price not found: ${priceId}` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = await resolveOrCreateCustomer(stripe, {
      userId: user.id,
      email: user.email ?? undefined,
    });

    const origin = req.headers.get("origin") || "https://vitasyncai.lovable.app";
    const successUrl = returnUrl
      ? `${returnUrl}?status=success&session_id={CHECKOUT_SESSION_ID}`
      : `${origin}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/?subscription=cancelled`;

    const isRecurring = !!stripePrice.recurring;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: { userId: user.id, priceLookupKey: priceId },
      ...(isRecurring && {
        subscription_data: {
          metadata: { userId: user.id, priceLookupKey: priceId },
        },
      }),
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});