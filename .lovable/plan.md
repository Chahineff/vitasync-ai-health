

## Plan : Internationalisation complète de la Boutique et des Pages Produits (PDP)

### Contexte

De nombreux composants de la boutique (shop) et des fiches produits (PDP) contiennent encore des chaînes de texte codées en dur en français ou en anglais, non reliées au système de traduction `useTranslation`. Le fichier `i18n.ts` contient déjà beaucoup de clés shop/pdp, mais plusieurs composants ne les utilisent pas.

### Composants à modifier et chaînes concernées

**1. `ProductCard.tsx`** — Pas de `useTranslation`, tout est en dur :
- "Produit ajouté au panier", "Erreur lors de l'ajout au panier"
- "Recommandé", "Ajouté", "Ajouter", "Rupture de stock"

**2. `ProductGroupCard.tsx`** — Le `StarRating` a "0 avis" en dur (ligne 27)

**3. `ProductPurchaseBox.tsx`** — Nombreuses chaînes en dur :
- "avis", "Dans votre routine", "Pas encore dans votre routine"
- "Abonnement", "Livraison gratuite, ajustable a tout moment avec l'IA"
- "Achat unique", "Quantite", "Ajoute !", "Demarrer ma routine", "Ajouter au panier"
- "Livraison estimee :", "Demander a VitaSync"
- Format date-fns locale (actuellement `fr` uniquement)

**4. `MobileStickyCart.tsx`** — Pas de `useTranslation` :
- "Ajoute a votre routine", "Echec de l'ajout"
- "/mois", "S'abonner", "Ajouter"

**5. `CoachInsightCard.tsx`** — Pas de `useTranslation` :
- "VitaSync Insight", "Tres compatible / Compatible / Peu compatible avec votre profil"
- "Goal", "Training", "Budget"
- "Demander au Coach", "Edit my context"
- Question pré-remplie en français

**6. `ProductReviews.tsx`** — Pas de `useTranslation` :
- "Customer Reviews", "avis", "No reviews yet"
- "Lire les avis sur Judge.me", "Ask VitaSync"
- "Frequently Asked Questions"

**7. `WhatItDoes.tsx`** — Pas de `useTranslation` :
- "What It Does"

**8. `ResultsTimeline.tsx`** — Tout en dur (pas de `useTranslation`) :
- "À quoi s'attendre"
- Toutes les étapes de timeline (Semaine 1-2, Absorption, etc.)

**9. `ScienceSection.tsx`** — Pas de `useTranslation` :
- "The Science", "TL;DR", "What studies suggest:", "Sources & références:"
- "Voir moins", "Voir plus de sources"
- Disclaimer en bas

**10. `ProductComparator.tsx`** — Pas de `useTranslation` :
- "Comparer", "Ce produit", "Alternative", "Prix", "Marque"
- Features en dur : "Vegan", "Sans Gluten", "Bio", "Made in France"

**11. `BuildYourStack.tsx`** — Pas de `useTranslation` :
- "Recommande pour vous", "Pairs well with"
- Toast messages en anglais
- Reason tags en anglais

**12. `HowToTake.tsx`** — Partiellement traduit, mais :
- Tabs : "Daily", "Training day", "Rest day"
- Labels DosageCard : "Dosage", "Timing", "With Food", "Notes"
- "Preferred timing", "Add to my schedule"
- Notes en anglais en dur dans les TabsContent

**13. `IngredientsLabel.tsx`** — Partiellement :
- "Copied", "Copy serving info"

**14. `ProductDetailMaster.tsx`** — `reassuranceItems` en dur (ligne 50-55) :
- "Qualite Pharmaceutique", "Vegan", "Sans Gluten", "Fabrique en France"

**15. `QuickBenefitsStrip.tsx`** — Labels en anglais en dur :
- "Goal", "Format", "Key Ingredient", "When"
- Valeurs dérivées en anglais

### Plan d'implémentation

**Étape 1 — Ajouter ~80 nouvelles clés dans `src/lib/i18n.ts`** pour les 6 langues (FR, EN, ES, AR, ZH, PT), couvrant toutes les chaînes listées ci-dessus. Exemples de clés :
- `pdp.customerReviews`, `pdp.noReviewsYet`, `pdp.readReviews`
- `pdp.whatItDoes`, `pdp.theScience`, `pdp.whatToExpect`
- `pdp.subscription`, `pdp.oneTimePurchase`, `pdp.quantity`
- `pdp.freeShippingSubscription`, `pdp.askVitaSync`
- `pdp.compare`, `pdp.thisProduct`, `pdp.alternative`
- `pdp.inYourRoutine`, `pdp.notInYourRoutine`
- `pdp.pairsWellWith`, `pdp.recommendedForYou`
- `pdp.daily`, `pdp.trainingDay`, `pdp.restDay`
- `pdp.preferredTiming`, `pdp.addToSchedule`
- etc.

**Étape 2 — Refactoriser les 15 composants** en ajoutant `useTranslation` là où absent et en remplaçant toutes les chaînes en dur par `t('key')`.

**Étape 3 — Adapter le format date-fns** dans `ProductPurchaseBox.tsx` pour utiliser la locale correspondant à la langue sélectionnée (import dynamique de `fr`, `es`, `ar`, `zhCN`, `pt`, `enUS`).

### Détails techniques

- Le fichier `i18n.ts` sera modifié pour chaque bloc de langue (6 blocs)
- Chaque composant PDP/shop sera modifié pour importer `useTranslation` et appeler `t()`
- Les `reassuranceItems` et `features` de ProductComparator deviendront des fonctions qui prennent `t` en paramètre
- Les timelines de `ResultsTimeline.tsx` utiliseront des clés i18n
- Le format date-fns dans `ProductPurchaseBox` sera adapté via un mapping `locale → date-fns locale`

