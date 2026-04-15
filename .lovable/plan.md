

# Audit et correction des traductions manquantes

## Problèmes identifiés

### 1. MarqueeBanner — textes en dur (non traduits)
- `src/pages/Index.tsx` passe des chaînes en anglais directement : `"Smart supplements, real results"` et `"Your health needs VitaSync"`
- Le composant `MarqueeBanner` ne fait aucun appel à `useTranslation()`

### 2. Dashboard — FAQ et Quick Guides en dur (français uniquement)
- `src/pages/Dashboard.tsx` lignes 566-584 : `FAQ_DATA` (10 items) et `QUICK_GUIDES` (4 items) sont codés en dur en français, sans passer par le système i18n

### 3. Pages légales — aucune traduction (7 pages)
- `Terms.tsx`, `Privacy.tsx`, `Cookies.tsx`, `CGV.tsx`, `Disclaimer.tsx`, `LegalNotice.tsx`, `Shipping.tsx` — tout est en français brut, sans `useTranslation()`
- **Note** : ces pages sont très longues et complexes juridiquement. Je recommande de **ne pas les traduire via i18n** pour l'instant (contenu légal sensible), mais c'est à confirmer.

## Plan d'action

### Étape 1 — MarqueeBanner i18n
- Ajouter les clés `marquee.line1` et `marquee.line2` dans les 6 langues dans `src/lib/i18n.ts`
- Modifier `src/pages/Index.tsx` pour passer `t("marquee.line1")` et `t("marquee.line2")` au lieu des chaînes en dur

### Étape 2 — Dashboard FAQ & Quick Guides i18n
- Ajouter ~28 clés (`help.faq.1.cat`, `.q`, `.a`, etc. + `help.guide.1.title`, `.desc`) dans les 6 langues
- Modifier `FAQ_DATA` et `QUICK_GUIDES` dans `Dashboard.tsx` pour utiliser `t()`

### Étape 3 — Pages légales (recommandation)
- Les pages légales resteront en français pour l'instant (contenu juridique sensible nécessitant une validation humaine par langue). On pourra les internationaliser dans un second temps si nécessaire.

## Détails techniques
- Fichier principal modifié : `src/lib/i18n.ts` (ajout d'environ 180 nouvelles clés, 30 par langue × 6 langues)
- Composants modifiés : `Index.tsx`, `Dashboard.tsx`
- Pas de changement de structure ni de nouveau fichier

