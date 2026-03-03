

# Plan: Enhanced Dashboard Tutorial with All Sections + Welcome Animation

## Summary

The tutorial currently has 5 steps (Home, Coach, Supplements, Shop, Settings) but the dashboard has 7 sidebar items (Home, Coach, Supplements, Shop, Mon Stack, Mes Analyses, Settings). We need to add "Mon Stack" and "Mes Analyses" tutorial demos, update the Home demo to match the current dashboard layout, fix the Shop demo to show real Shopify product images, improve the Skip/Next/Back button visibility, and add a typing + gradient glow animation to the welcome screen.

## Changes

### 1. Update Tutorial Steps in `DashboardTutorial.tsx`
- Add 2 new steps between Shop and Settings:
  - **Mon Stack** (icon: `Package`) — "Connecte ton compte boutique pour suivre tes commandes, abonnements et livraisons."
  - **Mes Analyses** (icon: `TestTube`) — "Importe tes analyses sanguines en PDF et laisse l'IA les décrypter pour toi."
- Update `STEPS` array (7 steps total) and `DEMO_MAP`
- Make the Skip button more prominent: larger padding, stronger border, semi-opaque background, bolder text
- Make the Next/Back buttons larger with more contrast (bigger padding, stronger shadow on Next)

### 2. Create `TutorialMyStackDemo.tsx`
A realistic replica of the "Mon Stack" section showing:
- A "Next Delivery" hero card with a fake delivery date and progress bar
- A "Current Stack" list with 4-5 supplement items (Créatine, Whey, Magnésium, Oméga-3) with mock Shopify product images (fetched from Shopify like TutorialShopDemo)
- An "AI Recommendation" card suggesting a new supplement
- Coaching tier selector showing "Plan Gratuit" with upgrade options marked "Bientôt"

### 3. Create `TutorialAnalysesDemo.tsx`
A realistic replica of the "Mes Analyses" section showing:
- Header "Mes Analyses Sanguines"
- Upload zone (drag & drop area with dashed border)
- 2-3 fake analysis entries with statuses (Analysé ✓, En attente ⏳)
- One expanded analysis preview showing: file name, date, AI summary with abnormal values highlighted, suggested supplements
- A "Réanalyser" button with model selector dropdown

### 4. Update `TutorialHomeDemo.tsx`
Match the current dashboard home layout:
- Keep the greeting header and DailyCheckinWidget replica
- Keep the QuickCoachWidget replica
- Replace "Progression Santé" donut chart with the current layout:
  - Row 1: `SupplementTrackerEnhanced` preview + `Boutique` preview (AwaitingAnalysis)
  - Row 2: `MyStackPreviewWidget` preview + `AnalysesPreviewWidget` preview
- Use static mock data (no Supabase calls)

### 5. Fix `TutorialShopDemo.tsx` Product Images
- The `matchImage` function does fuzzy matching but product names may not align. Improve by also matching on product type/tag keywords
- Add fallback: if Shopify fetch fails or no match, show a styled placeholder with gradient background and pill emoji (already done, but ensure the fetch actually works)

### 6. Enhanced Welcome Phase Animation in `Dashboard.tsx`
Replace the simple "Bienvenue dans votre dashboard" text with:
- A **typewriter effect**: text appears letter by letter (~40ms per character)
- A **gradient text** that shifts from turquoise to green with a slow continuous `background-position` animation (CSS `animate-gradient-shift`)
- A subtle **glow effect** behind the text using a blurred pseudo-element
- Add the gradient keyframes to `tailwind.config.ts` if not already present

### 7. Update `tutorial/index.ts`
Export the 2 new demo components.

## Files to Create
- `src/components/dashboard/tutorial/TutorialMyStackDemo.tsx`
- `src/components/dashboard/tutorial/TutorialAnalysesDemo.tsx`

## Files to Modify
- `src/components/dashboard/DashboardTutorial.tsx` — Add 2 new steps, improve button visibility
- `src/components/dashboard/tutorial/TutorialHomeDemo.tsx` — Match current dashboard layout
- `src/components/dashboard/tutorial/TutorialShopDemo.tsx` — Improve image matching
- `src/components/dashboard/tutorial/index.ts` — Export new components
- `src/pages/Dashboard.tsx` — Enhanced welcome phase animation with typewriter + gradient glow
- `tailwind.config.ts` — Add `animate-gradient-shift` keyframes (if needed)

