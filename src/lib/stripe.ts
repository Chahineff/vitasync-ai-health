/**
 * Stripe / Lovable Payments helpers (frontend).
 *
 * The Lovable payments integration uses two environments:
 *   - "sandbox" (test): used in preview & development
 *   - "live": used after the user claims their Stripe account
 *
 * We default to "sandbox" for now since the project is in test mode.
 */

export type StripeEnv = "sandbox" | "live";

export function getStripeEnvironment(): StripeEnv {
  // Flip to "live" once the user has claimed their Stripe account & we publish.
  return "sandbox";
}

/** Human-readable price IDs (lookup_keys) created via batch_create_product. */
export const PRICE_IDS = {
  goAiMonthly: "go_ai_monthly",
  premiumAiMonthly: "premium_ai_monthly",
} as const;

export type PriceId = (typeof PRICE_IDS)[keyof typeof PRICE_IDS];