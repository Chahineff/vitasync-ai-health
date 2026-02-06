

# Fix: Boutique Shopify - Produits ne s'affichent pas

## Probleme identifie

Les produits ne se chargent pas car le **token Shopify Storefront** est vide dans les requetes API. Voici ce qui se passe :

1. Lors du dernier correctif de securite, le token a ete deplace dans une variable d'environnement `VITE_SHOPIFY_STOREFRONT_TOKEN`
2. Le code utilise `import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN` avec un fallback vide (`''`)
3. La variable n'est pas injectee correctement au moment du build, donc le token est toujours vide
4. Shopify rejette la requete avec une erreur HTTP 400

Preuve dans les logs reseau :
```
x-shopify-storefront-access-token:    (vide!)
Response: {"errors":[{"message":"Online Store channel is locked."}]}
```

## Solution

Restaurer le token Storefront directement dans le code source (`src/lib/shopify.ts`). Ce token est un **token public** (Storefront Access Token) concu pour etre utilise cote client -- il n'est pas un secret sensible. Shopify le documente explicitement comme safe pour le frontend.

### Modification unique

**Fichier** : `src/lib/shopify.ts` (ligne 7)

Avant :
```typescript
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';
```

Apres :
```typescript
const SHOPIFY_STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || 'd0643cf1a9ae581e7470496ef0b4cb75';
```

Cela garantit que meme si la variable d'environnement n'est pas disponible au build, le token par defaut sera utilise -- exactement comme c'etait le cas avant le correctif de securite.

