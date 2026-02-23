

## Plan : Afficher tous les produits individuellement (supprimer le regroupement)

### Diagnostic

L'API Shopify retourne correctement les **100 produits** (verifie via des appels API directs et les logs reseau). Les produits "manquants" sont en realite **caches par la logique de regroupement** du hook `useProductGroups.ts`. Ce hook fusionne les variantes de saveurs en une seule carte :

- Hydration Powder : 4 saveurs fusionnees en 1 carte (3 cachees)
- Focus Powder : 3 saveurs fusionnees en 1 carte (2 cachees)
- Energy Powder : 3 saveurs fusionnees en 1 carte (2 cachees)
- Whey Protein Isolate : 2 saveurs fusionnees en 1 carte (1 cachee)
- Plant Protein : 2 saveurs fusionnees en 1 carte (1 cachee)
- Et d'autres avec des patterns similaires

**Total : ~12 produits caches**, ce qui correspond a l'estimation de 10-15 produits manquants.

### Solution

Modifier le hook `useProductGroups.ts` pour **desactiver le regroupement** et afficher chaque produit individuellement avec sa propre carte.

### Fichier modifie

| Fichier | Changement |
|---------|-----------|
| `src/hooks/useProductGroups.ts` | Chaque produit devient son propre groupe (pas de fusion). Le `baseTitle` reste le titre complet du produit, `flavors` est vide, et chaque carte affiche un seul produit |

### Detail technique

Dans `useProductGroups.ts`, la fonction `useProductGroups` sera simplifiee :
- Au lieu de fusionner les produits par titre de base, chaque produit cree son propre groupe
- Le `baseTitle` utilise le titre complet du produit (ex: "Hydration Powder (Lychee)" au lieu de "Hydration Powder")
- Le tableau `flavors` sera vide pour chaque groupe
- Le composant `ProductGroupCard` continuera de fonctionner normalement (il gere deja le cas sans saveurs multiples)

### Resultat attendu

- Les **100 produits** s'affichent chacun avec leur propre carte dans la boutique
- Plus aucun produit n'est cache par le regroupement
- La pagination affichera 5 pages de 20 produits chacune
- Les filtres par categorie, prix et recherche continueront de fonctionner normalement

