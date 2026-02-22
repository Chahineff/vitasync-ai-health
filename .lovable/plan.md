
# Harmoniser toutes les sections de la homepage

## Objectif
Appliquer le meme style adaptatif clair/sombre (utilise dans HowItWorks, Features, Testimonials) aux sections **Pricing**, **FAQ** et **Footer**, pour une coherence visuelle complete sur toute la page.

## Sections a modifier

### 1. PricingSection (`src/components/sections/PricingSection.tsx`)
- Remplacer le fond generique `section-padding` par `bg-muted/20 dark:bg-[hsl(222_25%_4%)]` (comme les autres sections)
- Remplacer les `GlassCard` des plans par des cartes adaptatives avec :
  - Light : `bg-white/70 backdrop-blur-xl border` avec ombre douce
  - Dark : fond `hsl(220 20% 8% / 0.92)`, bordure accent, `boxShadow` glow
  - Ligne accent en haut de chaque carte
- Meme traitement pour la table de comparaison et la note en bas
- Badge du label "Pricing" en `text-primary` avec `tracking-[0.3em]`

### 2. FAQSection (`src/components/sections/FAQSection.tsx`)
- Remplacer le fond `bg-gradient-subtle` par `bg-background dark:bg-[hsl(222_25%_5%)]`
- Remplacer les `glass-card` des items FAQ par le meme pattern de carte adaptative :
  - Light : `bg-white/70 backdrop-blur-xl border` avec bordure subtile
  - Dark : fond `hsl(220 20% 8% / 0.92)`, bordure accent, glow subtil
  - Ligne accent cyan en haut de chaque item
- Badge en haut en `tracking-[0.3em]` pour coherence

### 3. Footer (`src/components/layout/Footer.tsx`)
- Adapter le fond : `bg-muted/20 dark:bg-[hsl(222_25%_4%)]` au lieu de `bg-muted/30`
- Adapter la bordure superieure avec le pattern accent

## Details techniques

- Les accents utilises seront cyan (`rgba(0, 240, 255, ...)`) pour la coherence avec les sections deja harmonisees
- Suppression de la dependance `GlassCard` dans PricingSection au profit de cartes custom adaptatives
- Utilisation de tokens semantiques (`text-foreground`, `text-muted-foreground`, `border-border`) partout
- Les styles inline pour dark mode resteront via `className="hidden dark:block"` + style inline, comme dans les autres sections

## Fichiers modifies
1. `src/components/sections/PricingSection.tsx`
2. `src/components/sections/FAQSection.tsx`
3. `src/components/layout/Footer.tsx`
