

# Améliorations des Pages Produits (PDP)

## Analyse de l'existant
La PDP actuelle est déjà riche : galerie sticky, purchase box avec abonnement, accordion (What It Does, How To Take, Ingredients, Science), Coach Insight, cross-sell carousel, FAQ, et barre mobile sticky. Voici les axes d'amélioration identifiés.

---

## A. UX & Conversion

### A1. Galerie améliorée — Swipe mobile + indicateur de position
Actuellement les thumbnails sur mobile sont peu visibles. Ajouter un **swipe horizontal natif** (framer-motion drag) sur l'image principale + **dots indicateurs** en bas de l'image (comme Instagram). Sur desktop, hover sur les thumbnails change l'image sans clic.

**Fichier** : `ProductGallery.tsx`

### A2. Social Proof — Note étoiles dans le header produit
Afficher la note moyenne (ex: ★★★★★ 4.8 · 120 avis) juste sous le titre dans la `ProductPurchaseBox`, visible sans scroller. Cliquable → scroll vers la section Reviews.

**Fichier** : `ProductPurchaseBox.tsx` (ajouter props `reviewRating` + `reviewCount` depuis le parent)

### A3. Sticky "Add to Cart" amélioré sur mobile
La barre mobile actuelle n'affiche qu'un prix et un bouton générique. L'améliorer : afficher le **nom du produit tronqué**, le mode d'achat actif (abonnement/unique), et synchroniser le prix avec la purchase box (subscription price si applicable).

**Fichier** : `MobileStickyCart.tsx` + `ProductDetailMaster.tsx` (passer plus de props)

### A4. Bouton "Wishlist" fonctionnel
Le cœur dans le header est actuellement décoratif. Le connecter à une table `user_wishlists` en DB avec toggle animé (scale + couleur rouge au fill). Feedback toast "Ajouté aux favoris".

**Fichiers** : `ProductDetailMaster.tsx`, nouvelle migration DB `user_wishlists(user_id, product_handle)`

---

## B. Contenu & Information

### B1. Bandeau "Livraison estimée"
Sous le CTA, afficher un mini-texte dynamique : "📦 Livraison estimée : Mar. 11 – Jeu. 13 mars" (date actuelle + 3-5 jours ouvrés). Renforce l'urgence d'achat.

**Fichier** : `ProductPurchaseBox.tsx`

### B2. Section "Avant / Après" ou Timeline de résultats
Nouvelle section sous "What It Does" : timeline visuelle montrant les résultats attendus par semaine (ex: "Semaine 1 : Absorption", "Semaine 4 : Résultats visibles", "Mois 3 : Bénéfices optimaux"). Données issues de `enrichedData` ou fallback générique par catégorie.

**Fichier** : Nouveau composant `pdp/ResultsTimeline.tsx`, intégré dans l'accordion de `ProductDetailMaster.tsx`

### B3. Comparateur "Ce produit vs alternatives"
Tableau compact comparant le produit actuel avec 1-2 alternatives du catalogue (dosage, prix/dose, certifications). Aide à la décision sans quitter la page.

**Fichier** : Nouveau composant `pdp/ProductComparator.tsx`

---

## C. Engagement & Personnalisation

### C1. Coach Insight personnalisé amélioré
Actuellement la carte affiche un texte statique. Enrichir avec un **score de compatibilité** (0-100%) calculé côté client à partir du profil santé (goals match, activity level, existing stack conflicts). Afficher "92% compatible avec votre profil" avec un mini-anneau radial.

**Fichier** : `CoachInsightCard.tsx`

### C2. "Déjà dans votre stack" indicator
Si le produit (ou un produit similaire) est déjà dans le `supplement_tracking` de l'utilisateur, afficher un badge vert "✓ Dans votre routine" sous le titre. Si non, afficher "Pas encore dans votre routine — Ajouter ?".

**Fichier** : `ProductPurchaseBox.tsx` + query vers `supplement_tracking`

### C3. Section "Les clients avec votre profil achètent aussi"
Cross-sell personnalisé basé sur les `health_goals` du profil utilisateur au lieu du simple "Pairs well with" générique actuel. Filtre les produits du catalogue par pertinence vs objectifs santé.

**Fichier** : `BuildYourStack.tsx` (enrichir la logique de filtrage)

---

## D. Performance & Polish

### D1. Skeleton loading amélioré
Le skeleton actuel est basique. Ajouter des **shimmer animations** et un skeleton qui mime la vraie structure (galerie + purchase box côte à côte, accordions, etc.).

**Fichier** : `ProductDetailMaster.tsx` (fonction `ProductDetailSkeleton`)

### D2. Breadcrumb de navigation
Ajouter un fil d'Ariane contextuel : "Boutique > Vitamines > Vitamine D3" en haut de page, basé sur le `productType`. Améliore la navigation et le contexte.

**Fichier** : `ProductDetailMaster.tsx` (nouveau bloc sous le header sticky)

---

## Ordre d'implémentation suggéré

1. **A1** — Swipe galerie mobile + dots (impact UX immédiat)
2. **A2** — Social proof étoiles dans le header
3. **A3** — Mobile sticky bar améliorée
4. **B1** — Bandeau livraison estimée
5. **C1** — Score de compatibilité Coach
6. **C2** — Indicateur "dans votre stack"
7. **B2** — Timeline résultats
8. **D2** — Breadcrumb
9. **D1** — Skeleton amélioré
10. **A4** — Wishlist (nécessite migration DB)
11. **C3** — Cross-sell personnalisé
12. **B3** — Comparateur produits

## Fichiers impactés
| Fichier | Action |
|---|---|
| `src/components/dashboard/pdp/ProductGallery.tsx` | Modifier (swipe + dots) |
| `src/components/dashboard/pdp/ProductPurchaseBox.tsx` | Modifier (étoiles, livraison, stack indicator) |
| `src/components/dashboard/pdp/MobileStickyCart.tsx` | Modifier (nom + mode + prix sync) |
| `src/components/dashboard/pdp/CoachInsightCard.tsx` | Modifier (score compatibilité) |
| `src/components/dashboard/pdp/BuildYourStack.tsx` | Modifier (cross-sell personnalisé) |
| `src/components/dashboard/pdp/ResultsTimeline.tsx` | Nouveau |
| `src/components/dashboard/pdp/ProductComparator.tsx` | Nouveau |
| `src/components/dashboard/pdp/ProductDetailMaster.tsx` | Modifier (breadcrumb, skeleton, intégration) |
| Migration DB `user_wishlists` | Nouveau (pour wishlist) |

