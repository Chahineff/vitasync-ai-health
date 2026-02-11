
# Deux ameliorations PDP : Reviews Judge.me + "Show more" Sources

---

## 1. Integrer les reviews Judge.me (vraies donnees)

Judge.me stocke les donnees de reviews dans les **metafields Shopify standard** accessibles via le Storefront API :
- `reviews.rating` : note moyenne (ex: "4.3") avec scale_min/scale_max
- `reviews.rating_count` : nombre total d'avis (ex: "125")

### Changements techniques

**`src/lib/shopify.ts`** -- Ajouter les metafields Judge.me a la requete GraphQL `PRODUCT_BY_HANDLE_QUERY` :

```text
reviewRating: metafield(namespace: "reviews", key: "rating") {
  value
  type
}
reviewCount: metafield(namespace: "reviews", key: "rating_count") {
  value
  type
}
```

Et mettre a jour l'interface `ProductDetail` pour inclure ces deux champs.

**`src/components/dashboard/pdp/ProductReviews.tsx`** -- Remplacer les placeholders statiques par les vraies donnees :
- Afficher la note moyenne (etoiles remplies dynamiquement)
- Afficher le nombre total de reviews
- Calculer les barres de distribution (Judge.me ne fournit pas la distribution par etoile via metafields, on affichera uniquement la moyenne + le total)
- Si aucune review : garder le placeholder actuel "No reviews yet"

**`src/components/dashboard/pdp/ProductDetailMaster.tsx`** -- Passer les nouvelles props `reviewRating` et `reviewCount` au composant `ProductReviews`.

**Note importante** : Judge.me ne fournit PAS les textes individuels des reviews via les metafields Shopify. Seuls la note moyenne et le nombre d'avis sont disponibles. Pour afficher les textes, il faudrait utiliser l'API Judge.me directement (necessite une cle API). Pour l'instant, on affichera la note + le compteur, et les cartes de reviews resteront en placeholder avec un lien "Read reviews on Judge.me".

---

## 2. Bouton "Show more" pour les sources scientifiques

Actuellement, toutes les sources sont affichees d'un coup dans `ScienceSection.tsx`. Certains produits ont beaucoup de sources.

### Changement technique

**`src/components/dashboard/pdp/ScienceSection.tsx`** :
- Afficher les 3 premieres sources par defaut
- Ajouter un bouton "Show more sources" qui revele le reste
- Animation douce a l'expansion (transition CSS)
- Si 3 sources ou moins : pas de bouton

---

## Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/lib/shopify.ts` | Ajout metafields `reviewRating` + `reviewCount` dans la requete GraphQL + interface `ProductDetail` |
| `src/components/dashboard/pdp/ProductReviews.tsx` | Affichage dynamique note moyenne + nombre d'avis Judge.me |
| `src/components/dashboard/pdp/ProductDetailMaster.tsx` | Passer les props reviews au composant |
| `src/components/dashboard/pdp/ScienceSection.tsx` | Afficher 3 sources par defaut + bouton "Show more" |
