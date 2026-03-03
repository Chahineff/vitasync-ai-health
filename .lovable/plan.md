

## Plan: Improve Dashboard Home - Remove Progression Sante, Add Stack & Analyses Previews

### Problem
- The "Progression Sante" widget shows fake hardcoded data and is unreliable
- When navigating away from home and back, `hasInteractedWithCoach` resets to `false` (it's local state), causing the shop preview to reappear instead of the progress chart -- inconsistent behavior
- Missing previews for "Mon Stack" and "Mes Analyses"

### Changes

#### 1. Remove ProgressChart from Dashboard Home
**File: `src/pages/Dashboard.tsx` (DashboardHome component, ~lines 526-531)**
- Remove the `ProgressChart` from the grid
- Make `SupplementTrackerEnhanced` full-width instead of in a 2-col grid
- Remove `hasInteractedWithCoach` state and its prop passing (no longer needed)
- Remove the `ProgressChart` import

#### 2. Add Shop Preview Widget to Dashboard Home
**File: `src/pages/Dashboard.tsx` (DashboardHome component)**
- Below the supplement tracker, add the existing `AwaitingAnalysis` component (which already renders a shop preview grid with CTA) -- but always visible, not conditional

#### 3. Create MyStack Preview Widget
**New file: `src/components/dashboard/MyStackPreviewWidget.tsx`**
- Same `glass-card-premium rounded-3xl` design as other dashboard widgets
- Uses `useSupplementTracking()` to show active supplements count and a compact list (name + time-of-day badge)
- Shows a "Voir mon stack" CTA button that navigates to the mystack section
- If no supplements, shows empty state with "Commencez a construire votre stack"
- Header with Package icon, title "Mon Stack", subtitle with count

#### 4. Create Blood Test Analyses Preview Widget
**New file: `src/components/dashboard/AnalysesPreviewWidget.tsx`**
- Same glass-card design
- Fetches from `blood_test_analyses` table for the current user (latest 3)
- Shows each analysis as a compact row: file name, status badge (pending/completed), date
- "Voir mes analyses" CTA button navigating to analyses section
- If no analyses, shows empty state with "Importez votre premiere analyse"
- Header with TestTube icon

#### 5. Integrate New Widgets in DashboardHome
**File: `src/pages/Dashboard.tsx` (DashboardHome component)**

New layout after the coach widget:
```
Row 1: SupplementTrackerEnhanced (full width)
Row 2: [MyStackPreviewWidget] [AnalysesPreviewWidget]  (2-col grid)
Row 3: Shop Preview (full width)
```

Each wrapped in a `motion.div` with staggered delay animations matching existing pattern.

### Files Summary

| File | Action |
|---|---|
| `src/components/dashboard/MyStackPreviewWidget.tsx` | Create |
| `src/components/dashboard/AnalysesPreviewWidget.tsx` | Create |
| `src/pages/Dashboard.tsx` | Edit DashboardHome layout, remove ProgressChart |

