import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getStripeEnvironment } from "@/lib/stripe";

export interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  product_id: string;
  price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  environment: string;
  created_at: string;
  updated_at: string;
}

function computeIsActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  const end = sub.current_period_end ? new Date(sub.current_period_end).getTime() : null;
  const inFuture = end === null ? true : end > Date.now();
  if (["active", "trialing", "past_due"].includes(sub.status) && inFuture) return true;
  if (sub.status === "canceled" && end && end > Date.now()) return true;
  return false;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("environment", getStripeEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("useSubscription fetch error:", error);
      setSubscription(null);
    } else {
      setSubscription((data as unknown as SubscriptionRow) ?? null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subscription-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscription();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSubscription]);

  const isActive = computeIsActive(subscription);
  const tier: "free" | "go" | "premium" = !isActive
    ? "free"
    : subscription?.price_id === "premium_ai_monthly"
    ? "premium"
    : subscription?.price_id === "go_ai_monthly"
    ? "go"
    : "free";

  return { subscription, isActive, tier, loading, refresh: fetchSubscription };
}

/**
 * Starts a Stripe Checkout session and redirects the user to Stripe.
 * Caller must be authenticated.
 */
export async function startCheckout(priceId: string, returnUrl?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: {
      priceId,
      environment: getStripeEnvironment(),
      returnUrl,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("No checkout URL returned");
  window.location.href = data.url as string;
}

/** Opens the Stripe Customer Portal in a new tab. */
export async function openCustomerPortal(returnUrl?: string) {
  const { data, error } = await supabase.functions.invoke("create-portal-session", {
    body: {
      environment: getStripeEnvironment(),
      returnUrl,
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("No portal URL returned");
  window.open(data.url as string, "_blank");
}