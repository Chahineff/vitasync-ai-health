

# Plan: 7 Legal Pages + Footer Link Fix

## Problem
- Footer legal links (`privacy`, `terms`, `legalNotice`, `cookies`) all point to `"#"` which just scrolls to top
- Missing pages for: CGV, CGU, Disclaimer Santé, Mentions Légales, Politique de Confidentialité, Politique Cookies, Politique Livraison & Retours
- PDFs could not be parsed — **I need you to paste the text content or re-upload as .txt/.docx files**

## Architecture

### 7 New Pages to Create

| # | PDF | Route | Page File |
|---|-----|-------|-----------|
| 1 | Politique de Confidentialité | `/privacy` | `src/pages/legal/Privacy.tsx` |
| 2 | Conditions d'Utilisation (CGU) | `/terms` | `src/pages/legal/Terms.tsx` |
| 3 | Mentions Légales | `/legal-notice` | `src/pages/legal/LegalNotice.tsx` |
| 4 | Politique Cookies | `/cookies` | `src/pages/legal/Cookies.tsx` |
| 5 | Conditions Générales de Vente (CGV) | `/cgv` | `src/pages/legal/CGV.tsx` |
| 6 | Disclaimer Santé/Médical | `/disclaimer` | `src/pages/legal/Disclaimer.tsx` |
| 7 | Politique Livraison & Retours | `/shipping` | `src/pages/legal/Shipping.tsx` |

### Shared Layout Component
Create `src/components/layout/LegalPageLayout.tsx` — a reusable wrapper with:
- Navbar at top
- Clean, sober typography (prose-style, readable)
- Title + last updated date
- Sections with headings and body text
- Footer at bottom
- VitaSync design language (same bg, fonts, spacing) but minimal — no flashy gradients

### Footer Updates (`Footer.tsx`)
- Update the 4 existing legal links from `"#"` to real routes
- Add 3 missing links: CGV, Disclaimer, Livraison & Retours
- Use `<Link to="...">` instead of `<a href="#">`

### Router Updates (`App.tsx`)
- Add 7 new `<Route>` entries

### i18n Updates (`i18n.ts`)
- Add footer link labels for the 3 new entries (CGV, Disclaimer, Livraison)

## Blocker
**I cannot read the PDF content.** Please either:
1. Paste the text from each PDF in chat, or
2. Re-upload as `.txt` or `.docx` files

Once I have the content, I'll populate each page with the exact text from your documents.

