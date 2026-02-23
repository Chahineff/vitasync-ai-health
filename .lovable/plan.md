

## Plan : Abonnements Shopify + Correction des labels + Nouveau design PDP

### 1. Stocker le nouveau token Storefront API

Utilisation de l'outil `add_secret` pour mettre a jour le secret `SHOPIFY_STOREFRONT_ACCESS_TOKEN` avec la nouvelle cle API Headless qui a acces aux selling plans. L'utilisateur pourra coller sa cle en toute securite sans l'exposer dans le chat.

---

### 2. Modifier le proxy pour utiliser l'API Storefront (au lieu de l'API Admin)

Le proxy actuel (`shopify-storefront-proxy`) utilise l'API Admin. Avec le nouveau token Storefront ayant tous les scopes, on bascule vers l'API **Storefront** directe. Cela elimine les problemes de transformation de prix (cents vs dollars) et donne acces natif aux `sellingPlanGroups`.

| Fichier | Changement |
|---------|-----------|
| `supabase/functions/shopify-storefront-proxy/index.ts` | Basculer vers `https://vitasync2.myshopify.com/api/2025-07/graphql.json` avec le header `X-Shopify-Storefront-Access-Token`. Supprimer toute la logique de transformation Admin. |

---

### 3. Ajouter les `sellingPlanGroups` aux requetes GraphQL

| Fichier | Changement |
|---------|-----------|
| `src/lib/shopify.ts` | Ajouter `sellingPlanGroups` dans `PRODUCTS_QUERY` et `PRODUCT_BY_HANDLE_QUERY`. Mettre a jour les interfaces `ShopifyProduct` et `ProductDetail` pour inclure les donnees de selling plans (nom, options de livraison, prix ajuste, frequence). |

Structure des donnees selling plan ajoutees :
```text
sellingPlanGroups(first: 3) {
  edges {
    node {
      name
      sellingPlans(first: 5) {
        edges {
          node {
            id
            name
            options { name value }
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

---

### 4. Corriger la detection de l'image Supplement Facts

| Fichier | Changement |
|---------|-----------|
| `src/components/dashboard/pdp/IngredientsLabel.tsx` | Ameliorer l'algorithme de detection : 1) Chercher d'abord par mots-cles dans alt-text/URL (supplement, facts, label, nutrition, ingredients). 2) Si aucun resultat, chercher les patterns de fichiers (`generated-label`, `back`, `rear`). 3) Fallback: utiliser l'**avant-derniere** image du set (convention catalogue ou les labels sont a la fin). 4) Augmenter le nombre d'images chargees de 10 a 20 dans la query `PRODUCT_BY_HANDLE_QUERY`. |

---

### 5. Redesigner la PDP Purchase Box avec "Buy once" / "Add to pack"

| Fichier | Changement |
|---------|-----------|
| `src/components/dashboard/pdp/ProductPurchaseBox.tsx` | Refonte complete de la zone d'achat |

Nouveau design :

```text
+---------------------------------------------+
|  [VitaSync]                                  |
|  Ashwagandha KSM-66                          |
|  [Adaptogen]                                 |
|                                              |
|  "Supports stress resilience and calm..."    |
|                                              |
|  [Lab-tested] [Clean formula] [Easy routine] |
|                                              |
|  --- Purchase Options ---------------------- |
|                                              |
|  ( ) Buy once              $24.99            |
|  (*) Subscribe & Save      $22.49  [-10%]    |
|      Deliver every: [30 days v]              |
|      "Free shipping - Cancel anytime"        |
|                                              |
|  [====== Add to pack ==================]     |
|                                              |
|  [Ask VitaSync about this]                   |
+---------------------------------------------+
```

Logique :
- **Mode "Buy once"** : Ajoute au panier normalement (sans selling plan)
- **Mode "Subscribe & Save"** : Ajoute au panier avec le `sellingPlanId` selectionne. Le bouton devient "Add to pack". Un selecteur de frequence (30j, 60j, 90j, etc.) apparait sous l'option
- Le prix affiche est dynamiquement calcule selon le `priceAdjustment` du selling plan (pourcentage ou montant fixe)
- Si aucun selling plan n'existe pour le produit, seul "Buy once" est affiche (pas de section Subscribe)

---

### 6. Afficher le prix d'abonnement sur les cartes produit dans la boutique

| Fichier | Changement |
|---------|-----------|
| `src/components/dashboard/shop/ProductGroupCard.tsx` | Sous le prix de base, afficher le prix avec abonnement et la frequence |

Design de la carte :

```text
+---------------------------+
|  [Image produit]          |
|                           |
|  Ashwagandha KSM-66      |
|  Adaptogen                |
|                           |
|  $24.99                   |
|  or $22.49/mo (Subscribe) |
|                           |
|  [Add to cart]            |
+---------------------------+
```

- Si le produit a des selling plans : afficher "or $XX.XX/mo" en vert sous le prix principal, avec la frequence la plus courte
- Si pas de selling plan : afficher uniquement le prix de base

---

### 7. Mettre a jour le cart store pour supporter les selling plans

| Fichier | Changement |
|---------|-----------|
| `src/stores/cartStore.ts` | Ajouter `sellingPlanId?: string` a l'interface `CartItem`. Modifier `addItem` pour passer le `sellingPlanId` dans la mutation `cartCreate`/`cartLinesAdd` quand present. |
| `src/lib/shopify.ts` | Modifier `createShopifyCart` et `addLineToShopifyCart` pour inclure `sellingPlanId` dans les lignes du panier. |

---

### 8. Mettre a jour le CartDrawer pour distinguer les achats uniques des abonnements

| Fichier | Changement |
|---------|-----------|
| `src/components/dashboard/CartDrawer.tsx` | Afficher un badge "Subscribe" ou "One-time" a cote de chaque article. Pour les articles avec selling plan, afficher la frequence de livraison. |

---

### Resume des fichiers modifies

| # | Fichier | Action |
|---|---------|--------|
| 1 | Secret `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Mise a jour via outil securise |
| 2 | `supabase/functions/shopify-storefront-proxy/index.ts` | Basculer vers API Storefront |
| 3 | `src/lib/shopify.ts` | Ajouter sellingPlanGroups aux queries + interfaces + support dans cart functions |
| 4 | `src/components/dashboard/pdp/IngredientsLabel.tsx` | Meilleure detection image label |
| 5 | `src/components/dashboard/pdp/ProductPurchaseBox.tsx` | Refonte Buy once / Subscribe |
| 6 | `src/components/dashboard/shop/ProductGroupCard.tsx` | Afficher prix abonnement |
| 7 | `src/stores/cartStore.ts` | Support sellingPlanId |
| 8 | `src/components/dashboard/CartDrawer.tsx` | Badges abonnement/unique |
| 9 | `supabase/functions/ai-shop-recommendations/index.ts` | Basculer aussi vers Storefront API |

