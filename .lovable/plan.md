

## Plan : Abonnements Shopify (Subi) + Correction des images Supplement Facts

### Partie 1 : Integration des abonnements (Selling Plans) dans la boutique

#### 1.1 Requeter les `sellingPlanGroups` depuis l'API Storefront

**Fichier : `src/lib/shopify.ts`**

- Ajouter `sellingPlanGroups` dans les queries GraphQL `PRODUCTS_QUERY` et `PRODUCT_BY_HANDLE_QUERY`
- Mettre a jour les interfaces `ShopifyProduct` et `ProductDetail` pour inclure les donnees de selling plans (nom du plan, pourcentage de reduction, frequence de livraison, `sellingPlanId`)
- Structure des donnees attendue :
```text
sellingPlanGroups(first: 5) {
  edges {
    node {
      name
      sellingPlans(first: 10) {
        edges {
          node {
            id
            name
            description
            recurringDeliveries
            priceAdjustments {
              adjustmentValue {
                ... on SellingPlanPercentagePriceAdjustment { adjustmentPercentage }
                ... on SellingPlanFixedAmountPriceAdjustment { adjustmentAmount { amount currencyCode } }
              }
            }
          }
        }
      }
    }
  }
}
```

Si le scope `unauthenticated_read_selling_plans` n'est pas disponible (erreur API), un fallback gracieux sera implemente : les donnees d'abonnement ne s'affichent tout simplement pas et le comportement actuel est conserve.

#### 1.2 Afficher le prix abonnement sur les cartes produits (Shop)

**Fichier : `src/components/dashboard/shop/ProductGroupCard.tsx`**

- Sous le prix actuel (achat unique), afficher une ligne supplementaire si le produit a un selling plan :
```text
29.90 USD         <- prix actuel (one-time)
25.42 USD/mois    <- prix abonnement (barre avec -15%)
     ^-- badge "Save 15%"
```
- Le pourcentage de reduction est lu dynamiquement depuis les donnees Shopify (pas en dur a 15%)
- La frequence de livraison est affichee ("Every 1 month", "Every 2 months", etc.)

#### 1.3 Ajouter un toggle One-time / Subscribe dans la Buy Box (PDP)

**Fichier : `src/components/dashboard/pdp/ProductPurchaseBox.tsx`**

- Remplacer la section "Subscribe & Save" statique (actuellement "Coming Soon") par un vrai widget interactif :
  - Toggle switch ou radio : "One-time purchase" vs "Subscribe & Save"
  - Quand subscribe est selectionne :
    - Afficher le prix reduit avec le pourcentage
    - Afficher la frequence de livraison du selling plan
    - Le bouton "Add to pack" cree un panier avec le `sellingPlanId`
  - Quand one-time est selectionne : comportement actuel inchange
- Le bouton "Buy once" secondaire reste pour l'achat unique

#### 1.4 Creer un panier avec selling plan

**Fichier : `src/stores/cartStore.ts`**

- Ajouter un champ optionnel `sellingPlanId` dans `CartItem`
- Quand `sellingPlanId` est present, utiliser `CART_CREATE_WITH_SELLING_PLAN_MUTATION` (deja existant dans `shopify.ts`) au lieu de `CART_CREATE_MUTATION`
- Pour `cartLinesAdd`, ajouter le `sellingPlanId` dans la mutation

### Partie 2 : Correction de l'image Supplement Facts

#### 2.1 Meilleure detection de l'image du label

**Fichier : `src/components/dashboard/pdp/IngredientsLabel.tsx`**

Le probleme actuel : la detection se base sur `altText` et l'URL contenant "supplement", "label" ou "facts". Or, la plupart des images n'ont pas d'alt text et les URLs contiennent "generated-label-image" sans ces mots-cles.

Nouvelle logique de detection (par ordre de priorite) :
1. Image dont l'`altText` contient "supplement", "label", "facts", "nutrition" (garde l'existant)
2. Image dont l'URL contient "supplement-facts", "label", "nutrition"
3. **Heuristique de position** : la derniere ou avant-derniere image est souvent le label (convention Shopify). Si le produit a >= 3 images, utiliser l'avant-derniere image comme fallback (les images generees suivent un pattern ou l'image "supplement facts" est typiquement en position 4-5 sur 6-7 images)
4. **Heuristique de format** : chercher une image avec un ratio hauteur > largeur (format portrait typique d'un label) parmi les dernieres images

On ajoutera aussi une detection basee sur le nom de fichier contenant "generated-label-image" suivi d'un index specifique (typiquement index 3 ou 4 qui correspond au label).

#### 2.2 Utiliser plus d'images dans la galerie PDP

**Fichier : `src/lib/shopify.ts`**

- Dans `PRODUCT_BY_HANDLE_QUERY`, augmenter `images(first: 10)` a `images(first: 20)` pour s'assurer qu'aucune image n'est manquee (certains produits ont beaucoup d'images)

### Partie 3 : Details techniques

**Fichiers modifies :**

| Fichier | Changement |
|---------|-----------|
| `src/lib/shopify.ts` | Ajouter `sellingPlanGroups` aux queries + interfaces ; augmenter le nombre d'images |
| `src/components/dashboard/shop/ProductGroupCard.tsx` | Afficher prix abonnement + badge reduction |
| `src/components/dashboard/pdp/ProductPurchaseBox.tsx` | Remplacer "Coming Soon" par un vrai toggle subscribe |
| `src/stores/cartStore.ts` | Support `sellingPlanId` dans les items du panier |
| `src/components/dashboard/pdp/IngredientsLabel.tsx` | Ameliorer la detection d'image supplement facts |

**Gestion d'erreur API :**
Si la requete `sellingPlanGroups` echoue (scope manquant), le composant affiche simplement le prix one-time sans option abonnement -- pas de crash, pas d'erreur visible.

**Pas de modification de la base de donnees** -- tout est lu depuis l'API Shopify Storefront en temps reel.

