
# Redesign PDP generique -- Applique a TOUS les produits

Le design detaille fourni pour la Creatine Monohydrate sert de reference UI. L'implementation est **100% dynamique** : chaque composant s'adapte automatiquement a n'importe quel produit grace aux donnees enrichies (`product_enriched_data`) et aux donnees Shopify. Aucun contenu n'est code en dur pour la Creatine.

---

## Fichiers a modifier (14) + 1 nouveau

| # | Fichier | Changements principaux |
|---|---|---|
| 1 | `ProductDetailMaster.tsx` | Container 1200px, grille 2 colonnes egales, suppression des `border-t`, insertion CoachInsightCard, espacements 24px/16px |
| 2 | `ProductGallery.tsx` | Badges overlay dynamiques (tags produit), fond blanc + border `#E2E8F0`, masquer slots vides (ne montrer que les vraies images) |
| 3 | `ProductPurchaseBox.tsx` | H1 34-40px SemiBold, Trust Strip 3 items, prix 22-28px, CTA "Add to pack" Teal `#2DD4BF`, CTA secondaire "Buy once" outline, lien "Ask VitaSync", Subscribe toggle visuel, sticky `top-24` |
| 4 | **`CoachInsightCard.tsx`** (nouveau) | Lisere gradient Teal-Blue, `enrichedData.coach_tip` ou summary, chips contextuelles (Goal/Training/Budget depuis profil utilisateur), CTA "Ask VitaSync" |
| 5 | `WhatItDoes.tsx` | 3 cartes max, titres 16-18px SemiBold, descriptions `#475569`, suppression "Best for" tags (deplaces dans QuickBenefitsStrip) |
| 6 | `HowToTake.tsx` | Tabs "Daily" / "Training day" / "Rest day", timeline chips AM/Post-workout/PM selectionnables (fond `#0B1220` quand actif), CTA "Add to my schedule" outline Teal |
| 7 | `IngredientsLabel.tsx` | 4 tabs (Supplement Facts / Ingredients / Allergens / Storage), tableau facts fond `#F8FAFC` border `#E2E8F0`, bouton "Copy serving info" |
| 8 | `QualitySourcing.tsx` | 4 cartes (Manufacturing, Testing/COA, Contaminants, Traceability), bouton "View COA" (grise + "Coming soon" si indisponible) |
| 9 | `SafetyCautions.tsx` | Card warning simplifiee fond `#FFF7ED` border `#F59E0B`, 3 bullets max, disclaimer "Not medical advice", suppression accordeons |
| 10 | `BuildYourStack.tsx` | Header "Pairs well with", carrousel horizontal scroll, cards compactes avec reason tag, CTA outline "Add", toast "Bundle updated" |
| 11 | `ProductReviews.tsx` | Bouton "Ask VitaSync" ajoute, FAQ enrichies en accordeon (4 questions depuis `enrichedFaq`), structure reviews inchangee |
| 12 | `MobileStickyCart.tsx` | Hauteur 64px + `pb-safe` iOS, CTA Teal "Add to pack", `whileTap scale 0.98`, toast "Added to your monthly stack" |
| 13 | `QuickBenefitsStrip.tsx` | Labels EN : "Goal", "Format", "Key Ingredient", "When" |
| 14 | `PDPFooter.tsx` | Simplifie : 2 liens ("Science & Safety", "Privacy") + micro-disclaimer |
| 15 | `index.ts` | Export CoachInsightCard |

---

## Comment ca marche pour TOUS les produits

Chaque section utilise des donnees dynamiques :

- **CoachInsightCard** : affiche `enrichedData.coach_tip` (disponible pour les 92 produits enrichis), ou le `summary` en fallback
- **Trust Strip** : genere dynamiquement depuis les certifications et tags du produit (ex: "Lab-tested" si COA existe, "Vegan" si tag present)
- **Badges gallery** : extraits des `product.tags` Shopify (Unflavored, Micronized, Vegan, Gluten-Free, etc.)
- **Tabs HowToTake** : le contenu de chaque tab est derive de `enrichedSuggestedUse` (dosage, timing, with_food) -- les tabs "Training day" / "Rest day" affichent des variantes de timing adaptees
- **4 tabs Ingredients** : Supplement Facts depuis l'image, Ingredients depuis `enrichedIngredients`, Allergens depuis `enrichedSafety.allergens`, Storage depuis `enrichedQuality`
- **Quality cards** : textes dynamiques depuis `enrichedQuality.manufacturing`, `enrichedQuality.testing`, `enrichedQuality.certifications`
- **Safety** : bullets depuis `enrichedSafety.contraindications` + `enrichedSafety.interactions` (max 3)
- **Cross-sell** : produits filtres depuis le catalogue complet, avec reason tags derives du `productType`

---

## Palette de couleurs (appliquee via classes Tailwind arbitraires)

| Token | Hex | Usage |
|---|---|---|
| Ink | `#0B1220` | Titres, chips actives |
| Slate | `#475569` | Sous-titres, descriptions |
| Border | `#E2E8F0` | Bordures de cartes |
| BG | `#F8FAFC` | Fond sections, tableaux |
| Teal | `#2DD4BF` | CTA principal uniquement |
| Blue | `#38BDF8` | Liens "Ask VitaSync" |
| Warning BG | `#FFF7ED` | Section safety |
| Warning Border | `#F59E0B` | Bordure safety |
| Chip BG | `#F1F5F9` | Badges overlay |

---

## Ordre d'implementation

1. Creer `CoachInsightCard.tsx` + exporter dans `index.ts`
2. Modifier `ProductDetailMaster.tsx` (layout, grille, espacement, insertion CoachInsightCard)
3. Modifier `ProductPurchaseBox.tsx` (Buy Box complet)
4. Modifier `ProductGallery.tsx` (badges, masquer slots vides)
5. Modifier les sections de contenu : `WhatItDoes`, `HowToTake`, `IngredientsLabel`, `QuickBenefitsStrip`
6. Modifier les sections trust/safety : `QualitySourcing`, `SafetyCautions`
7. Modifier les sections conversion : `BuildYourStack`, `ProductReviews`
8. Modifier `MobileStickyCart.tsx` et `PDPFooter.tsx`
