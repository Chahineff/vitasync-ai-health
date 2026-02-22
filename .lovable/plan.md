

## Plan : Spline plus subtil au scroll + fonds de sections harmonises

### Objectif
1. Reduire progressivement l'opacite du fond Spline 3D a mesure que l'utilisateur descend dans la page (bien visible en haut, quasi invisible en bas).
2. Uniformiser les fonds de toutes les sections pour qu'elles se ressemblent visuellement (supprimer les differences entre `bg-background` et `bg-muted/20`).

---

### Changements prevus

#### 1. `src/components/sections/SplineBackground.tsx`
- Ajouter une `motion.div` autour du `spline-viewer` dont l'**opacite diminue avec le scroll** (de 1 en haut a ~0.15 en bas) via `useTransform(scrollYProgress, [0, 1], [1, 0.15])`.
- Augmenter legerement l'overlay de lisibilite : passer de `bg-background/80` a `bg-background/85` (light) et `bg-background/75` (dark) pour un meilleur equilibre.

#### 2. Harmonisation des fonds de sections
Toutes les sections utiliseront le **meme fond transparent** pour laisser le Spline background filtrer uniformement :

| Section | Fond actuel | Nouveau fond |
|---------|------------|-------------|
| HeroSection | `relative` (transparent) | Inchange (transparent) |
| ProductPreviewSection | `bg-muted/20 dark:bg-[hsl(222_25%_4%)]` | `bg-transparent` |
| HowItWorksSection | `bg-muted/20 dark:bg-[hsl(222_25%_4%)]` | `bg-transparent` |
| FeaturesSection | `bg-background dark:bg-[hsl(222_25%_5%)]` | `bg-transparent` |
| PricingSection | `bg-muted/20 dark:bg-[hsl(222_25%_4%)]` | `bg-transparent` |
| FAQSection | `bg-background dark:bg-[hsl(222_25%_5%)]` | `bg-transparent` |
| TestimonialsSection | `bg-muted/20 dark:bg-[hsl(222_25%_4%)]` | `bg-transparent` |
| Footer | `bg-muted/20 dark:bg-[hsl(222_25%_4%)]` | `bg-transparent` |

Puisque le `SplineBackground` fournit deja un overlay `bg-background/85` qui garantit la lisibilite, les sections n'ont plus besoin de definir leur propre fond opaque.

#### 3. `src/pages/Index.tsx`
- Supprimer les `section-divider` entre les sections (ils deviennent inutiles puisque toutes les sections partagent le meme fond transparent).

#### 4. `src/index.css`
- Aucun changement majeur necessaire ; les classes `.section-parallax` et `.section-divider` restent disponibles si besoin futur.

---

### Details techniques

```text
Scroll position:   0%  ------>  50%  ------>  100%
Spline opacity:    1.0          0.5           0.15
Overlay:           bg/85        bg/85         bg/85
Section bg:        transparent  transparent   transparent
```

Le resultat : un fond Spline bien visible en hero qui s'estompe naturellement vers le bas, avec des sections visuellement identiques en termes de fond.

### Fichiers modifies
- `src/components/sections/SplineBackground.tsx` (opacite progressive)
- `src/components/sections/ProductPreviewSection.tsx` (bg transparent)
- `src/components/sections/HowItWorksSection.tsx` (bg transparent)
- `src/components/sections/FeaturesSection.tsx` (bg transparent)
- `src/components/sections/PricingSection.tsx` (bg transparent)
- `src/components/sections/FAQSection.tsx` (bg transparent)
- `src/components/sections/TestimonialsSection.tsx` (bg transparent)
- `src/components/layout/Footer.tsx` (bg transparent)
- `src/pages/Index.tsx` (suppression des dividers)
