## Plan : Refonte design de la page À propos

Objectif : transformer `/about` en une page éditoriale immersive, alignée sur l'identité VitaSync (dark glassmorphism, Electric Blue / Teal-Mint, Space Grotesk + Inter), avec plus de narration visuelle et de profondeur.

### 1. Hero repensé
- Composition asymétrique : titre éditorial à gauche (Space Grotesk, mix avec Playfair Display sur le mot accentué façon hero homepage), visuel orbital à droite (réutiliser `OrbitingCircles` avec icônes Brain / Heart / ShieldCheck).
- Ajout d'un badge animé `AnimatedText` pour le tagline.
- Background : dégradé radial Electric Blue → Teal sur Spline existant + grain subtil.
- Stat "ticker" en bas du hero : 4 chiffres clés avec animation count-up (réutiliser les `facts`).

### 2. Section "Notre histoire" — format storytelling
- Layout en timeline verticale (3-4 jalons) au lieu du bloc texte + carte facts.
- Chaque jalon = `GlassCard` compact avec année / titre / phrase courte, connectés par une ligne dégradée animée au scroll (ScrollReveal + motion path).
- Citation mise en exergue (pull quote) entre deux jalons, typographie large Playfair.

### 3. Section "Chiffres clés" dédiée
- Sortir les `facts` du hero pour en faire une bande pleine largeur avec 4 `GlowCard` (variant cyan), chiffres en gradient text, micro-icônes Phosphor.
- Animation d'apparition séquentielle (stagger 0.1s).

### 4. Section "Nos valeurs" enrichie
- Passer de 4 cartes égales à un layout bento (1 carte large + 3 standards) pour hiérarchiser.
- Ajout d'un visuel/illustration discret par carte (icône orbitale ou shape gradient).
- Hover : `ShineBorder` sur la carte active.

### 5. Nouvelle section "Comment l'IA nous guide"
- Bloc dédié expliquant le rôle de l'IA (Gemini) avec 3 mini-features alignées (analyse, recommandation, suivi).
- Format `feature-steps` léger ou cartes horizontales scrollables sur mobile.

### 6. Section "Engagements & sécurité"
- Bandeau dark plein écran avec checklist (HIPAA-ready, FDA disclaimer, données chiffrées, append-only logs).
- Icônes ShieldCheck en orbite + texte sobre, pour rassurer.

### 7. CTA final repensé
- Remplacer la `GlassCard` simple par un bloc full-width avec dégradé Electric Blue → Teal, double CTA (Commencer gratuitement / Voir les plans), micro-texte légal.
- Ajout d'un `MagicText` ou `TextHoverEffect` sur le titre.

### 8. Cohérence transversale
- Breadcrumbs en haut (Accueil / À propos) façon `/blog/:slug`.
- Transitions de section avec `ScrollReveal` uniformes (blur + fade-up).
- Mobile : désactiver Spline lourd (déjà règle projet), simplifier l'orbital hero en mesh gradient CSS.
- Respect strict des tokens `index.css` (aucune couleur en dur).

### Détails techniques
- Fichiers impactés : `src/pages/About.tsx` (refonte structure), nouveaux sous-composants dans `src/components/sections/about/` (ex. `AboutHero.tsx`, `StoryTimeline.tsx`, `FactsBand.tsx`, `ValuesBento.tsx`, `AICommitments.tsx`, `AboutCTA.tsx`).
- Réutilisation : `GlassCard`, `GlowCard`, `OrbitingCircles`, `ScrollReveal`, `AnimatedText`, `ShineBorder`, `MagicText`.
- i18n : ajouter clés manquantes dans `src/lib/i18n.ts` pour la timeline, l'IA, les engagements, le nouveau CTA (6 langues).
- Pas de logique métier modifiée — uniquement présentation.
- QA mobile (≤768px) : vérifier que la timeline reste lisible et que le hero ne casse pas.

Confirmer pour que je passe à l'implémentation.