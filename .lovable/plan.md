

# Plan: Security Audit Remediation

Based on the audit document, here are the findings categorized by what we **can fix now** vs. what requires **external action**.

---

## Findings We CAN Fix (Code Changes)

### 1. V1 — CORS Too Permissive (CRITICAL)
All 9 edge functions use `Access-Control-Allow-Origin: *`. Replace with VitaSync domains only.

**Files**: All edge functions (`ai-coach`, `ai-shop-recommendations`, `analyze-blood-test`, `elevenlabs-scribe-token`, `parse-product-pdfs`, `shopify-customer-api`, `shopify-customer-auth`, `shopify-storefront-proxy`, `supplement-insights`)

**Change**: Dynamic CORS check against allowed origins:
```typescript
const ALLOWED_ORIGINS = [
  "https://vitasyncai.lovable.app",
  "https://id-preview--7f75c63b-4202-49a9-a875-e20700f8a0c8.lovable.app"
];
// + localhost for dev
```

### 2. V2 — Service Role Key in analyze-blood-test (CRITICAL)
Currently creates a single `supabase` client with `serviceKey` and uses it for both auth AND data operations. The service role bypasses RLS.

**Fix**: Create two clients — one with anon key + user token for user-scoped queries, one with service role only for storage downloads (which require elevated access). Add explicit `user_id` checks on all queries.

### 3. V5 — Weak Password (6 chars → 8+ with complexity) (MEDIUM)
`Auth.tsx` Zod schema requires only 6 chars.

**Fix**: Update to 8 chars minimum + require uppercase, lowercase, digit, and special character. Add real-time password strength indicator.

### 4. V6 — No Content Security Policy (MEDIUM)
`index.html` has no CSP meta tags.

**Fix**: Add CSP meta tag allowing only VitaSync domains, Supabase, Shopify, Spline, and the AI gateway.

### 5. V8 — No Cookie Banner (LOW)
**Fix**: Create a `CookieBanner` component that appears on first visit, stores consent in localStorage, and links to `/cookies`.

### 6. V9 — No Data Export/Deletion (LOW)
No way for users to export or delete their data (GDPR Art. 15/17).

**Fix**: Add "Export My Data" and "Delete My Account" buttons to the Profile/Settings section. Create an edge function `user-data-export` that gathers all user data as JSON, and a `delete-account` function that cascades deletion.

---

## Findings We CANNOT Fix (External/Organizational)

| ID | Issue | Why |
|---|---|---|
| V3 | HDS Certification | Infrastructure-level decision — requires migrating to OVHcloud/Scalingo. Not a code change. |
| V4 | Rate Limiting | Lovable Cloud edge functions don't support persistent state (Redis/counters). We can add basic in-memory throttling per request but true rate limiting needs external infrastructure. We'll add a lightweight per-user daily counter in the database as a workaround. |
| V7 | AIPD (Privacy Impact Assessment) | Legal/compliance document — not a code task. |

---

## Implementation Summary

| # | Task | Files |
|---|---|---|
| 1 | Restrict CORS in all 9 edge functions | 9 edge function `index.ts` files |
| 2 | Split clients in analyze-blood-test | `supabase/functions/analyze-blood-test/index.ts` |
| 3 | Stronger password validation + UI indicator | `src/pages/Auth.tsx` |
| 4 | Add CSP meta tag | `index.html` |
| 5 | Cookie consent banner | New `src/components/ui/CookieBanner.tsx` + `src/App.tsx` |
| 6 | Data export + account deletion | New edge functions + Profile section UI updates |
| 7 | Basic rate limiting (DB counter) | New migration + edge function middleware pattern |

