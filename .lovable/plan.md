
# Plan d'amélioration des cartes de recommandation produit dans le Chat IA

## Problème identifié

Les recommandations de produits dans le chat AI Coach affichent actuellement :
- ❌ Des codes/tags bruts parfois visibles (`[[PRODUCT:...]]`)
- ❌ Pas d'image produit (seulement nom + prix en inline)
- ❌ Design basique non cohérent avec le reste du dashboard
- ❌ Les données complètes du produit ne sont récupérées qu'au moment de l'ajout au panier

Le widget `AIRecommendationsWidget` dans la boutique fonctionne correctement avec images, nom, prix et bouton - il faut s'en inspirer.

---

## Solution

### 1. Refonte complète du composant `ProductRecommendationCard`

**Nouveau design :**

```text
+----------------------------------------------------------+
|  +--------+                                              |
|  |  IMG   |  Nom du produit                             |
|  | produit|  29.99 USD                                  |
|  +--------+                                              |
|                                                          |
|  [🛒 Ajouter au panier]  [➕ Ajouter au suivi]          |
+----------------------------------------------------------+
```

**Fonctionnalités :**
- Récupération automatique de l'image depuis Shopify via `fetchProductById`
- Affichage de l'image, du nom et du prix dans un design moderne
- État de chargement avec skeleton pendant la récupération
- Boutons d'action identiques (Panier + Suivi)
- Animation d'apparition fluide

### 2. Amélioration du parsing des tags produit

**Fichier : `parseProductRecommendations`**

- Nettoyer les tags mal formés
- Ignorer les tags incomplets
- S'assurer que les placeholders sont correctement remplacés

### 3. Amélioration de l'affichage dans `ChatMessageBubble`

- Meilleur rendu des cartes produit
- Espacement cohérent avec le reste du message
- Gestion des erreurs si le produit n'existe pas

---

## Structure du nouveau composant

```typescript
interface EnhancedProductCardProps {
  productId: string;
  variantId: string;
  name: string;
  price: string;
}

// États:
// 1. Loading: Skeleton avec animation
// 2. Loaded: Image + Nom + Prix + Boutons
// 3. Error: Message discret "Produit non disponible"
```

---

## Fichiers à modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/components/dashboard/ProductRecommendationCard.tsx` | Modifier | Refonte complète avec image et design moderne |
| `src/components/dashboard/chat/ChatMessageBubble.tsx` | Modifier | Améliorer le rendu des cartes produit |
| `src/lib/shopify.ts` | Vérifier | S'assurer que `fetchProductById` fonctionne correctement |

---

## Nouveau design du ProductRecommendationCard

```text
+------------------------------------------------------------------+
|                                                                  |
|   +----------+   Nom du produit complet                         |
|   |          |   (ligne 2 si long)                               |
|   |   IMG    |                                                   |
|   |          |   💰 29.99 USD                                   |
|   +----------+                                                   |
|                                                                  |
|   [🛒 Ajouter au panier]      [➕ Ajouter au suivi]             |
|                                                                  |
+------------------------------------------------------------------+
```

**Caractéristiques :**
- Image carrée à gauche (80x80px)
- Nom du produit (max 2 lignes, truncate)
- Prix en gras avec devise
- Deux boutons d'action distincts
- Effet de hover subtil
- Bordure avec gradient comme le widget AI

---

## Logique de récupération des données

```typescript
useEffect(() => {
  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const product = await fetchProductById(productId);
      if (product) {
        setProductData({
          imageUrl: product.node.images.edges[0]?.node.url || '',
          title: product.node.title,
          price: product.node.priceRange.minVariantPrice.amount,
          currency: product.node.priceRange.minVariantPrice.currencyCode,
          variantId: product.node.variants.edges[0]?.node.id || variantId,
        });
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  
  loadProductDetails();
}, [productId]);
```

---

## Avantages

1. **Cohérence visuelle** : Design identique au widget AI Recommendations de la boutique
2. **Données complètes** : Image, nom et prix récupérés depuis Shopify
3. **Meilleure UX** : État de chargement visible, pas de codes bruts affichés
4. **Synchronisation** : Les produits sont toujours à jour avec le catalogue Shopify
5. **Actions claires** : Deux boutons distincts pour panier et suivi

---

## Exemple de rendu final

Le message de l'IA affichera :

> "Pour améliorer ton énergie, je te recommande :"
> 
> [Carte produit avec image + nom + prix + boutons]
> 
> "Ce complément est idéal pour..."

Plus aucun code brut visible, juste une carte élégante et fonctionnelle.
