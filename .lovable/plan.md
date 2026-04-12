

# Plan : Améliorations Boutique, Catégories, Scroll & Pages Produit

## Problèmes identifiés

1. **Scroll bloqué** : La boutique utilise `h-full` + `flex flex-col` avec un conteneur interne `overflow-y-auto`, mais le wrapper parent dans Dashboard a aussi `className="h-full"`. Le hero et les filtres restent "scotchés" en haut car ils sont hors du div scrollable. Il faut supprimer la structure `h-full flex flex-col` et laisser le scroll naturel du `dashboard-scroll-container`.

2. **Section "Tendances du moment"** : À supprimer.

3. **Catégories sans icônes** : Les pills de catégorie n'ont aucune icône visuelle.

4. **Abonnement — selling plan "Daily LV" au lieu du vrai label** : Le composant affiche `getDeliveryFrequency(plan)` qui lit `plan.options[0].value` brut (ex: "Daily LV Treatment"). Il faut parser/nettoyer ce label pour afficher la fréquence réelle.

5. **Quantité/posologie non affichées** : Pas d'espace dans la PDP pour afficher la quantité dans la boîte ni la posologie quotidienne recommandée.

---

## 1. Correction du scroll dans la boutique

**Fichier** : `src/components/dashboard/ShopSection.tsx`
- Retirer `h-full flex flex-col` du conteneur racine et `flex-1 overflow-y-auto` du conteneur de grille
- Tout doit scroller naturellement dans le `dashboard-scroll-container` parent
- Le hero, les catégories, les filtres et la grille s'enchaînent dans un seul flux vertical

## 2. Suppression de "Tendances du moment"

**Fichier** : `src/components/dashboard/ShopSection.tsx`
- Supprimer le bloc `trendingGroups` (lignes 248-278) et le `useMemo` associé

## 3. Icônes sur les catégories

**Fichier** : `src/components/dashboard/ShopSection.tsx`
- Associer une icône Phosphor à chaque catégorie :
  - All → `GridFour`, Sport → `Barbell`, Wellness → `Leaf`, Digestive → `Stomach` (ou `Drop`), Vitamins → `Pill`, Brain → `Brain`, Weight → `Scales`, Mushrooms → `Plant`, Bones → `Bone`, Other → `DotsThree`
- Rendre la catégorie active plus visuellement distincte (fond + icône en couleur primaire, légère animation)

## 4. Correction du label d'abonnement (selling plan)

**Fichier** : `src/lib/shopify.ts` (fonction `getDeliveryFrequency`)
- Parser le champ `plan.options` pour extraire la fréquence réelle (ex: "30 Day(s)" → "Tous les mois", "90 Day(s)" → "Tous les 3 mois")
- Nettoyer les labels comme "Daily LV", "Daily LV Treatment" en les remplaçant par la fréquence calculée
- Fallback sur le plan name si pas de parsing possible

## 5. Affichage quantité / posologie sur la PDP

**Fichier** : `src/components/dashboard/pdp/ProductPurchaseBox.tsx`
- Ajouter un bloc sous le sélecteur d'abonnement affichant :
  - Quantité dans la boîte (depuis les enriched data ou le variant title)
  - Posologie recommandée par jour (depuis enriched data `suggested_use`)
  - Durée estimée d'une boîte (quantité / posologie)
- Laisser un espace pour ces données même si elles ne sont pas encore fournies (afficher un placeholder discret)

## 6. Améliorations design PDP

**Fichier** : `src/components/dashboard/pdp/ProductPurchaseBox.tsx` & `ProductDetailMaster.tsx`
- Ajouter un bandeau "Livraison estimée" plus visible avec icône camion
- Améliorer le bloc "Pourquoi s'abonner" avec des icônes et un design en grille 2x2
- Rendre les boutons d'accordéon plus visuels (icône thématique par section)
- S'assurer que tous les boutons (wishlist, ajouter au panier, etc.) fonctionnent correctement en dark mode

## 7. Traductions

**Fichier** : `src/lib/i18n.ts`
- Ajouter les clés pour : quantité par boîte, posologie/jour, durée estimée, fréquence d'abonnement nettoyée — dans les 6 langues

---

## Résumé des fichiers modifiés

| Fichier | Action |
|---|---|
| `ShopSection.tsx` | Fix scroll, suppr. trending, icônes catégories |
| `shopify.ts` | Fix parsing `getDeliveryFrequency` |
| `ProductPurchaseBox.tsx` | Quantité/posologie, design amélioré |
| `ProductDetailMaster.tsx` | Icônes accordéon, améliorations visuelles |
| `i18n.ts` | Nouvelles clés de traduction |

