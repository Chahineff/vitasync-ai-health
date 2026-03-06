

# Plan: Coach IA Product Actions + Bug Fixes

## Overview
Four areas of work: (1) Enhanced product cards in Coach IA with cart/subscription options, (2) Smarter supplement tracking from Coach IA with proper time/dosage, (3) Fix broken AI features (supplement insights + shop recommendations), (4) Fix model name display.

---

## 1. Enhanced Product Recommendation Cards in Coach IA

**Current state**: `ProductRecommendationCard` has two basic buttons: "Panier" (one-time add) and "Suivi" (add to tracking). No subscription option, no price choice.

**Changes to `src/components/dashboard/ProductRecommendationCard.tsx`**:
- Replace the simple "Panier" button with a **dropdown/toggle** offering two options:
  - **Abonnement mensuel** (default, highlighted) — adds to cart with the selling plan if available, shows subscription price (−15%)
  - **Achat unique** — current behavior
- Show both prices on the card (subscription price + one-time price crossed out or vice versa)
- The "Suivi" button opens a **mini-modal/popover** instead of auto-adding, allowing the user to configure:
  - **Time of day**: Morning / Noon / Afternoon / Evening (or custom time)
  - **Meal timing**: Before meal / During meal / After meal
  - **Dosage**: Text field (e.g., "5g", "1 capsule", "2 gummies")
- On confirm, adds to supplement_tracking with the chosen parameters

**Changes to `src/hooks/useSupplementTracking.tsx`**:
- The `addSupplement` interface already supports `time_of_day` and `dosage` — no schema change needed
- Extend `time_of_day` values to support: `morning`, `noon`, `afternoon`, `evening`, `custom:HH:MM`

**Changes to `supabase/functions/ai-coach/index.ts`** (system prompt):
- Add instructions for the Coach to specify **recommended duration** (e.g., "3 mois", "permanent", "cure de 6 semaines") when recommending products
- Add instruction for Coach to specify precise dosage and timing in its text response (already partially there)
- Coach should mention whether a product is better as a subscription or one-time purchase

**Changes to `src/lib/shopify.ts`**:
- Need to fetch selling plans for variants to enable subscription cart creation from the product card
- May need to query selling plans when resolving products in the recommendation card

---

## 2. Fix Supplement Insights AI ("Analyse IA") — Not Working + Wrong Model Name

**File: `src/components/dashboard/SupplementAIInsights.tsx`**:
- Line 121: Change `"Propulsé par Gemini 3 Pro"` → `"Propulsé par Gemini 2.5 Flash Lite"` (matching the actual model `google/gemini-2.5-flash-lite` used in the edge function)

**File: `supabase/functions/supplement-insights/index.ts`**:
- The function boots and gets AI responses (logs confirm), but the frontend shows "Impossible de générer l'analyse". The issue is likely that `supabase.functions.invoke` passes the auth token automatically, but the function uses `SUPABASE_SERVICE_ROLE_KEY` to create its client. The function validates auth via `supabase.auth.getUser(token)` which should work.
- **Root cause investigation**: The function filters `supplement_logs` by tracking IDs, but uses the service role client — the RLS policies on `supplement_logs` are RESTRICTIVE (not permissive), which means they block access even for service role if `force_row_level_security` is enabled. Need to check if the function properly handles the case where user has no supplements (returns empty insights vs error).
- **Fix**: Add better error handling — if user has 0 active supplements, return a friendly message instead of calling the AI. Also ensure the error toast in the frontend distinguishes between "no data" and actual errors.

---

## 3. Fix Shop AI Recommendations — Not Working

**File: `supabase/functions/ai-shop-recommendations/index.ts`**:
- Same auth pattern as supplement-insights. The logs show boot/shutdown but no request processing, suggesting the function may be timing out or the request isn't reaching it.
- **Root cause**: The function fetches the Shopify catalog AND calls the AI gateway — if the Shopify fetch is slow or the AI call fails, it could time out silently.
- **Fix**: Add more granular logging, add timeout handling, and ensure the CORS headers include the preview domain. Also verify the `supabase.functions.invoke` call in `AIRecommendationsWidget.tsx` properly passes auth.

**File: `src/components/dashboard/shop/AIRecommendationsWidget.tsx`**:
- Verify the `supabase.functions.invoke('ai-shop-recommendations')` call properly passes the authorization header (it should automatically via the client).

---

## 4. AI Coach: Smarter Supplement Addition

**Changes to `supabase/functions/ai-coach/index.ts`** (system prompt additions):
- When the Coach recommends adding to tracking, it should specify:
  - Exact time: "matin", "midi", "après-midi", "soir" or a specific time like "20h30"
  - Dosage: "5g", "1 capsule", "2 gélules"
  - Meal context: "avant le repas", "pendant le repas", "après le repas"
  - Duration: "3 mois", "permanent", "cure de 6 semaines"

The product card then uses these AI-specified values as defaults in the tracking popover.

---

## Implementation Order

| # | Task | Priority |
|---|---|---|
| 1 | Fix model name in SupplementAIInsights | Quick fix |
| 2 | Debug & fix supplement-insights edge function | High |
| 3 | Debug & fix ai-shop-recommendations edge function | High |
| 4 | Add subscription/one-time toggle to ProductRecommendationCard | High |
| 5 | Add supplement tracking popover with time/dosage/meal config | High |
| 6 | Update AI Coach system prompt for duration/dosage guidance | Medium |

**Files to modify**:
- `src/components/dashboard/SupplementAIInsights.tsx` — model name fix
- `src/components/dashboard/ProductRecommendationCard.tsx` — major refactor for cart options + tracking popover
- `supabase/functions/supplement-insights/index.ts` — error handling improvements
- `supabase/functions/ai-shop-recommendations/index.ts` — logging + error handling
- `supabase/functions/ai-coach/index.ts` — system prompt updates for dosage/timing/duration
- `src/hooks/useSupplementTracking.tsx` — support `afternoon` time_of_day and meal timing metadata
- Possibly `src/lib/shopify.ts` — selling plan resolution for subscription add-to-cart

