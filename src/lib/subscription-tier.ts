export type Tier = 'free' | 'go' | 'premium';

export const TIER_HISTORY_DAYS: Record<Tier, number> = {
  free: 5,
  go: 14,
  premium: 90,
};

export const TIER_PRICE_ID: Record<Exclude<Tier, 'free'>, string> = {
  go: 'go_ai_monthly',
  premium: 'premium_ai_monthly',
};

/** Whether the tier has access to VitaSync Insight (PDP compatibility analysis). */
export function canUseVitaSyncInsight(tier: Tier): boolean {
  return tier === 'go' || tier === 'premium';
}

/** ISO cutoff date for chat history visibility based on tier. */
export function getHistoryCutoffISO(tier: Tier): string {
  const days = TIER_HISTORY_DAYS[tier];
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}