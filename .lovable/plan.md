
# Plan : Multilingue Complet pour les Pages Publiques

## Probleme Identifie

Le systeme i18n est implemente et fonctionne dans la **Navbar** (qui utilise `useTranslation()` et `t()`), mais toutes les autres parties des pages publiques ont leur texte **code en dur en francais** :

| Composant | Probleme |
|-----------|----------|
| `HeroSection.tsx` | Texte francais : "Nouveau : Analyse vocale IA disponible", "Votre Sante,", etc. |
| `FeaturesSection.tsx` | Tout en francais : titres, descriptions, details des features |
| `PricingSection.tsx` | Plans, prix, features en francais |
| `HowItWorksSection.tsx` | Etapes en francais : "Onboarding personnalise", etc. |
| `ProductPreviewSection.tsx` | "Votre Dashboard Personnel" en francais |
| `FAQSection.tsx` (landing) | Questions/reponses en francais |
| `Footer.tsx` | Liens, descriptions en francais |
| `About.tsx` | Page entiere en francais |
| `Blog.tsx` | Articles, titres en francais |
| `Contact.tsx` | Formulaire, labels en francais |

## Solution

### Etape 1 : Ajouter les traductions manquantes dans i18n.ts

Ajouter environ 200 nouvelles cles de traduction pour couvrir :
- HeroSection (badge, titre, sous-titre, CTAs)
- FeaturesSection (4 features avec titres, descriptions, 4 details chacune)
- PricingSection (plans, features, comparaison)
- HowItWorksSection (4 etapes)
- ProductPreviewSection (titre, description, CTA)
- Footer (categories, liens, textes)
- About (mission, histoire, valeurs, equipe, CTA)
- Blog (hero, articles metadata, newsletter)
- Contact (hero, formulaire, coordonnees, horaires)

### Etape 2 : Modifier les composants pour utiliser t()

Chaque composant recevra le hook `useTranslation()` et remplacera le texte statique par des appels `t("cle.traduction")`.

## Fichiers a Modifier

| Fichier | Changements |
|---------|-------------|
| `src/lib/i18n.ts` | +200 cles de traduction (FR/EN/ES) |
| `src/components/sections/HeroSection.tsx` | Utiliser t() pour badge, titre, sous-titre, CTAs |
| `src/components/sections/FeaturesSection.tsx` | Utiliser t() pour les 4 features |
| `src/components/sections/PricingSection.tsx` | Utiliser t() pour plans et comparaison |
| `src/components/sections/HowItWorksSection.tsx` | Utiliser t() pour les 4 etapes |
| `src/components/sections/ProductPreviewSection.tsx` | Utiliser t() pour titre, description |
| `src/components/layout/Footer.tsx` | Utiliser t() pour liens et textes |
| `src/pages/About.tsx` | Utiliser t() pour toute la page |
| `src/pages/Blog.tsx` | Utiliser t() pour hero et metadata |
| `src/pages/Contact.tsx` | Utiliser t() pour formulaire et infos |

## Structure des Traductions

```text
// Nouvelles categories a ajouter :

hero.* (5 cles)
features.* (20+ cles pour les 4 features)
pricing.* (20+ cles pour plans et comparaison)
howItWorks.* (12 cles pour les 4 etapes)
productPreview.* (3 cles)
footer.* (15 cles)
about.* (30+ cles)
blog.* (15 cles)
contact.* (20 cles)
```

## Exemple de Transformation

**Avant (HeroSection.tsx) :**
```typescript
<span>Nouveau : Analyse vocale IA disponible</span>
<h1>Votre Sante, Propulsee par l'IA</h1>
```

**Apres :**
```typescript
const { t } = useTranslation();
// ...
<span>{t("hero.badge")}</span>
<h1>{t("hero.title")} {t("hero.titleHighlight")}</h1>
```

## Avantages

1. **Coherence** : Tout le site change de langue instantanement
2. **Maintenabilite** : Toutes les traductions centralisees dans i18n.ts
3. **Extensibilite** : Facile d'ajouter de nouvelles langues plus tard
4. **UX** : L'utilisateur voit tout le site dans sa langue choisie
