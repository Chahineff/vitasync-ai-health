

## Two Issues to Fix

### Issue 1: Shopify Connection Not Persisting

**Root Cause Analysis:**
The edge function logs show: `"Shopify API returned 401 after token validation: {"errors":[{"message":"Invalid token, missing prefix shcat_."}]}"`. This means:
- The OAuth flow completes and a token is stored in `shopify_customer_tokens`
- But when `shopify-customer-api` later tries to use that token to call Shopify's Customer Account API, the token is rejected
- The `shopify-customer-api` function also has a **local validation** (`accessToken.startsWith("shcat_")`) that would delete the token before even trying Shopify

The likely cause: The token exchange is returning an access token that doesn't have the `shcat_` prefix. This can happen if the Client ID was recently changed or the OAuth scopes aren't correct. Since the Client ID was just updated to `13693c2b-e54c-4c79-9d7c-1e7071211cb1`, the old tokens in the database are now invalid for the new Client ID.

**Additionally**, there's a **callback race condition**: The `ShopifyCallback` page renders `useShopifyCustomer`, which on mount checks the URL for `code` + `state` params. But the callback page also has its own `useEffect` with a fallback redirect. The hook redirects via `window.history.replaceState({}, '', '/dashboard')` which doesn't trigger a React Router navigation, so the user may land on the dashboard without the hook properly re-initializing.

**Plan:**
1. **Fix the callback redirect**: Replace `window.history.replaceState` with proper React Router navigation (pass `navigate` function or use a callback). The `ShopifyCallback` page should handle the redirect after success.
2. **Remove the overly strict `shcat_` prefix validation** in `shopify-customer-api`. Shopify's own API will reject invalid tokens anyway — we already handle 401 responses. This client-side prefix check is causing legitimate tokens to be deleted.
3. **Add debug logging** to the token exchange response in `shopify-customer-auth` to log the token prefix so we can diagnose if Shopify is returning a different format.
4. **Fix the callback flow** in `ShopifyCallback.tsx`: Instead of relying on the hook to detect URL params, explicitly call `handleCallback` and use `navigate('/dashboard', { replace: true })` on success.

### Issue 2: "Réanalyser" Button with AI Model Selection

**What to build:**
- Add a "Réanalyser" button next to analyzed blood tests
- When clicked, show a model selector dropdown (same models as the chat: VitaSync 2.5 Flash, VitaSync 3 Flash, VitaSync 3 Pro)
- Default model: VitaSync 3 Flash (google/gemini-3-flash-preview)
- Pass the selected model to the `analyze-blood-test` edge function
- Update the edge function to accept an optional `model` parameter

**Changes:**
1. **`src/components/dashboard/BloodTestSection.tsx`**: Add a "Réanalyser" button with a model selector dropdown next to the "Analysé" badge or in the analysis detail view. Reuse the `AI_MODELS` array from `ChatModelSelector.tsx`.
2. **`supabase/functions/analyze-blood-test/index.ts`**: Accept an optional `model` field in the request body. Default to `google/gemini-3-flash-preview`. Use it in the AI gateway call instead of the hardcoded `google/gemini-2.5-flash`.

### Technical Details

**Files to modify:**
- `src/hooks/useShopifyCustomer.tsx` — Fix callback handling, expose `handleCallback` or refactor flow
- `src/pages/ShopifyCallback.tsx` — Properly orchestrate callback + redirect
- `supabase/functions/shopify-customer-api/index.ts` — Remove `shcat_` prefix check, add logging
- `supabase/functions/shopify-customer-auth/index.ts` — Add token prefix logging on exchange
- `src/components/dashboard/BloodTestSection.tsx` — Add "Réanalyser" button with model picker
- `supabase/functions/analyze-blood-test/index.ts` — Accept `model` parameter

