

# Plan : Améliorations design VitaSync

## 1. Navbar — Indicateur de section active
**Fichier** : `src/components/layout/Navbar.tsx`
- Ajouter un state `activeSection` mis à jour via `IntersectionObserver` sur les sections `#how-it-works`, `#features`, `#pricing`, `#faq`
- Appliquer un underline animé (pseudo-élément `after` avec transition `scaleX`) + `text-foreground` sur le lien actif
- Uniquement actif sur la page `/` (vérifier via `location.pathname`)

## 2. Effet Shine sur les cartes Features et Pricing
**Fichiers** : `src/index.css`
- Ajouter une classe utilitaire `.shine-hover` avec un pseudo-élément `::before` contenant un gradient linéaire blanc/transparent qui translate de gauche à droite au hover
- Appliquer cette classe sur les cartes dans `FeaturesSection.tsx` (le conteneur `.rounded-3xl` de chaque `FeatureBlock`) et `PricingSection.tsx` (les `AdaptiveCard`)

## 3. Cartes produit boutique — Effet flottant
**Fichier** : `src/components/dashboard/shop/ProductGroupCard.tsx`
- Remplacer le fond plat `bg-[hsl(210_40%_98%)]` de l'image par un dégradé radial subtil (`radial-gradient(circle at 50% 40%, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)`)
- Ajouter une ombre douce sous l'image (`shadow-[0_8px_30px_rgba(0,0,0,0.08)]`)

## 4. Mode sombre — Harmoniser les backgrounds hardcodés
**Fichiers** : `FeaturesSection.tsx`, `PricingSection.tsx`, `HowItWorksSection.tsx`, `FAQSection.tsx`
- Remplacer toutes les occurrences de `hsl(220 20% 8% / 0.92)` par `hsl(var(--card) / 0.92)` pour utiliser la variable CSS du thème
- Cela concerne ~8 occurrences dans 4 fichiers (+ `TestimonialsSection` mais non utilisé)

## 5. Typographie et espacement
**Fichiers** : `FeaturesSection.tsx`, `HowItWorksSection.tsx`, `PricingSection.tsx`, `FAQSection.tsx`
- Remplacer `font-light` par `font-extrabold` sur les titres principaux de section (`h2`)
- Changer `leading-relaxed` en `leading-loose` sur les paragraphes descriptifs
- Uniformiser les paddings de section : vérifier que toutes utilisent la classe `section-padding` déjà définie dans le CSS

## Résumé des fichiers modifiés
| Fichier | Changements |
|---------|------------|
| `Navbar.tsx` | IntersectionObserver + active link indicator |
| `index.css` | Classe `.shine-hover` |
| `FeaturesSection.tsx` | Shine hover, dark mode var, typo |
| `PricingSection.tsx` | Shine hover, dark mode var, typo |
| `HowItWorksSection.tsx` | Dark mode var, typo |
| `FAQSection.tsx` | Dark mode var |
| `ProductGroupCard.tsx` | Radial gradient + shadow sur image |

