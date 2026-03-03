

## Plan: Rich Interactive References, Chart Zoom, Real Data Charts, Product Dedup, and PDF Report Generation

### Summary

Enhance the AI Coach to produce rich, clickable inline reference cards for health profiles, blood test analyses, supplement stacks, and product knowledge -- plus chart zoom, real check-in data in charts, product dedup, and client-side PDF report generation.

---

### 1. Pass Raw Check-in Data to AI (Real Charts)

**File: `supabase/functions/ai-coach/index.ts`**

- In `buildEnrichedSystemPrompt`, accept the `recentCheckins: DailyCheckin[]` array (already fetched).
- Add a new prompt section listing each day's raw values:
  ```
  📅 DONNÉES BRUTES CHECK-INS (90 derniers jours):
  2026-03-01: sommeil=4, énergie=3, stress=2, humeur=😊
  ...
  ```
- Instruct: "When generating charts, use ONLY these real daily values. Never invent data."
- Update the main `Deno.serve` handler to pass `recentCheckins` into `buildEnrichedSystemPrompt`.

### 2. Product Dedup (Max 1 per Response)

**File: `supabase/functions/ai-coach/index.ts`**

- Update the "RÈGLES CRITIQUES" section: change "MAXIMUM 2 PRODUITS" to "MAXIMUM 2 PRODUITS, et ne recommande JAMAIS le même produit (même ProductID) plus d'une fois dans une même réponse."

**File: `src/components/dashboard/ProductRecommendationCard.tsx`**

- In `parseProductRecommendations`, after building the `products` array, deduplicate by `productId` (keep first occurrence only).

### 3. Chart Zoom Modal

**File: `src/components/dashboard/chat/ChatChartBlock.tsx`**

- Add a `useState<boolean>` for expanded state.
- Add an expand button (ArrowsOutSimple icon) in the chart header.
- When clicked, render the chart inside a `Dialog` (from `@/components/ui/dialog`) at full width with height 450px.
- The modal reuses the same chart rendering logic but larger.

### 4. New Reference Block Types (Interactive Cards in Chat)

Create new inline block types that the AI can embed in responses, similar to `[[PRODUCT:...]]` and `[[CHART:...]]`:

| Block Tag | Purpose | Renders As |
|---|---|---|
| `[[HEALTH_PROFILE]]` | User's health profile summary | Collapsible card showing goals, allergies, conditions, activity level |
| `[[BLOOD_TEST:id]]` | A specific blood test analysis | Card with file name, status, key deficiencies, link to view PDF |
| `[[MY_STACK]]` | User's current supplement stack | Card listing all active supplements with dosage/timing |
| `[[PRODUCT_DETAIL:productId]]` | Deep product info from enriched data | Expandable card with benefits, ingredients, science, safety |
| `[[REPORT:type]]` | Generate a downloadable PDF report | Button that triggers client-side PDF generation |

**New file: `src/components/dashboard/chat/ChatReferenceBlocks.tsx`**

- `HealthProfileCard`: Fetches from `useHealthProfile()` hook, renders a compact card with key profile data (goals, allergies, conditions, activity, diet, budget).
- `BloodTestCard`: Accepts analysis ID, fetches from `blood_test_analyses` table, shows status/deficiencies/file name, and a "View PDF" button that opens the file.
- `MyStackCard`: Uses `useSupplementTracking()`, renders the active supplement list with time-of-day badges.
- `ProductDetailCard`: Accepts productId, uses `useEnrichedProductData()`, renders an expandable card with summary, key benefits, ingredients, safety warnings, and coach tip.
- `ReportButton`: Accepts report type (e.g., "stack", "health", "product"), generates a client-side PDF using browser `window.print()` or a lightweight approach (render a hidden div with structured HTML and trigger download via Blob/URL).

**File: `src/components/dashboard/chat/ChatMessageBubble.tsx`**

- Add parsing for the new block tags alongside existing PRODUCT/CHART parsing.
- New regex patterns to detect `[[HEALTH_PROFILE]]`, `[[BLOOD_TEST:id]]`, `[[MY_STACK]]`, `[[PRODUCT_DETAIL:id]]`, `[[REPORT:type]]`.
- Replace them with placeholders and render the corresponding components.

### 5. Update AI System Prompt with New Block Capabilities

**File: `supabase/functions/ai-coach/index.ts`**

Add a new section to the system prompt (for 3 Flash and 3 Pro models):

```
═══════════════════════════════════════════════════════════════
RÉFÉRENCES INTERACTIVES (FONCTIONNALITÉ EXCLUSIVE)
═══════════════════════════════════════════════════════════════

Tu peux intégrer des blocs interactifs dans tes réponses :

• [[HEALTH_PROFILE]] - Affiche le profil santé de l'utilisateur
• [[BLOOD_TEST:id]] - Affiche une analyse sanguine (utilise l'ID de l'analyse)
• [[MY_STACK]] - Affiche le stack de compléments actuel
• [[PRODUCT_DETAIL:productId]] - Affiche les détails scientifiques d'un produit
• [[REPORT:stack]] ou [[REPORT:health]] - Génère un rapport PDF téléchargeable

QUAND UTILISER :
• [[HEALTH_PROFILE]] quand l'utilisateur demande "montre-moi mon profil"
• [[MY_STACK]] quand il demande "qu'est-ce que je prends actuellement ?"
• [[PRODUCT_DETAIL:id]] quand il veut des détails scientifiques sur un produit
• [[BLOOD_TEST:id]] quand il parle de ses analyses
• [[REPORT:...]] quand il demande un rapport, un récapitulatif ou un PDF
```

Also pass blood test analysis metadata (id, file_name, status, deficiencies summary) into the prompt so the AI knows which analyses exist.

### 6. Fetch Blood Test Analyses for Context

**File: `supabase/functions/ai-coach/index.ts`**

- Add `fetchBloodTestAnalyses(supabase, userId)` function that queries `blood_test_analyses` for the user.
- Include in the parallel fetch in `Deno.serve`.
- Add to system prompt: list of analyses with their IDs and status.

---

### Files Summary

| File | Changes |
|---|---|
| `supabase/functions/ai-coach/index.ts` | Raw check-in data in prompt, blood test context, new reference blocks prompt, product dedup rule |
| `src/components/dashboard/chat/ChatChartBlock.tsx` | Add zoom/expand Dialog modal |
| `src/components/dashboard/chat/ChatReferenceBlocks.tsx` | **New** - HealthProfileCard, BloodTestCard, MyStackCard, ProductDetailCard, ReportButton |
| `src/components/dashboard/chat/ChatMessageBubble.tsx` | Parse new reference block tags, render new components |
| `src/components/dashboard/ProductRecommendationCard.tsx` | Deduplicate products by productId |

