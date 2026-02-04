
# Plan d'amelioration du Dashboard VitaSync

## Problemes identifies

Apres analyse du code, voici les 3 ameliorations demandees :

1. **Design de la boutique a ameliorer** : Ajouter plus de dynamisme et d'interactivite
2. **Sidebar du dashboard avec bords arrondis** : La sidebar actuelle a des bords droits, il faut des coins arrondis
3. **Scroll to top lors du changement de page** : La pagination ne remonte pas automatiquement en haut
4. **Recommandations IA dans la boutique** : Widget "Your AI Recommendation" qui se rafraichit quotidiennement

---

## Solution 1 : Design de la boutique ameliore

### Modifications visuelles prevues

```text
+------------------------------------------------------------------+
|  SHOP HEADER                                                      |
|  Titre avec gradient + sous-titre anime                          |
+------------------------------------------------------------------+
|                                                                   |
|  CATEGORIES (avec effet de hover plus prononce)                  |
|  [All] [Sport] [Wellness] [Digestive] ...                        |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------+  AI RECOMMENDATIONS WIDGET                 |
|  |  LOGO IA        |  "Your AI Coach is thinking..."            |
|  |  + Animation    |  [Product 1] [Product 2] [Product 3]       |
|  +------------------+                                            |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  PRODUCT GRID (avec hover effects ameliores)                     |
|                                                                   |
+------------------------------------------------------------------+
```

### Fichier : `src/components/dashboard/ShopSection.tsx`

Ameliorations :
- Header avec titre en gradient et animation subtile
- Badge "Personalized for you" sur les produits recommandes
- Animation de scale plus fluide sur les cartes produits
- Espacement et ombres ameliorees

### Fichier : `src/components/dashboard/shop/ProductGroupCard.tsx`

Ameliorations :
- Effet de hover plus prononce avec ombre portee
- Transition d'image plus fluide
- Badge "AI Pick" visible sur les produits recommandes

---

## Solution 2 : Sidebar avec bords arrondis

### Fichier : `src/pages/Dashboard.tsx`

Modification de la sidebar (ligne 166) :

```text
AVANT:
<aside className="fixed inset-y-0 left-0 z-50 glass-sidebar ..."

APRES:
<aside className="fixed top-4 bottom-4 left-4 z-50 glass-sidebar rounded-3xl ..."
```

La sidebar aura :
- `top-4` et `bottom-4` : marge de 16px en haut et en bas
- `left-4` : marge de 16px a gauche
- `rounded-3xl` : coins arrondis de 24px

### Fichier : `src/index.css`

Mettre a jour la classe `.glass-sidebar` pour supporter les coins arrondis :
- Ajouter `border-radius: 24px`
- Remplacer `border-right` par `border` pour que tous les cotes aient une bordure

---

## Solution 3 : Scroll to top lors du changement de page

### Fichier : `src/components/dashboard/ShopSection.tsx`

Ajouter un `useEffect` qui scroll vers le haut a chaque changement de page :

```typescript
useEffect(() => {
  // Scroll to top of shop container when page changes
  const shopContainer = document.querySelector('.shop-products-container');
  if (shopContainer) {
    shopContainer.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [currentPage]);
```

### Fichier : `src/components/dashboard/shop/Pagination.tsx`

Modifier `onPageChange` pour inclure le scroll to top :

```typescript
const handlePageChange = (page: number) => {
  // Scroll dans le conteneur parent
  const container = document.querySelector('[data-shop-container]');
  if (container) {
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }
  onPageChange(page);
};
```

---

## Solution 4 : Widget "Your AI Recommendation"

### Nouveau fichier : `src/components/dashboard/shop/AIRecommendationsWidget.tsx`

Ce widget :
1. Se charge une fois par jour (stockage dans localStorage avec date)
2. Affiche un etat de chargement anime ("Your AI Coach is thinking...")
3. Appelle l'edge function `ai-coach` avec un prompt specifique pour les recommandations
4. Affiche 3 produits recommandes avec image, nom, prix et bouton "Add to Cart"

### Structure du widget

```text
+-----------------------------------------------------------------------+
|  [LOGO IA]  Your AI Recommendation                    [Refresh btn]  |
+-----------------------------------------------------------------------+
|                                                                       |
|  Loading state: "Your AI Coach is analyzing your profile..."         |
|  [Spinner animation]                                                  |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
|  +------------------+  +------------------+  +------------------+     |
|  |   [IMG]          |  |   [IMG]          |  |   [IMG]          |     |
|  |   Product Name   |  |   Product Name   |  |   Product Name   |     |
|  |   $29.99         |  |   $34.99         |  |   $19.99         |     |
|  |   [Add to Cart]  |  |   [Add to Cart]  |  |   [Add to Cart]  |     |
|  +------------------+  +------------------+  +------------------+     |
|                                                                       |
+-----------------------------------------------------------------------+
```

### Logique de cache quotidien

```typescript
const CACHE_KEY = 'vitasync_ai_recommendations';

interface CachedRecommendations {
  date: string; // Format: YYYY-MM-DD
  products: AIRecommendedProduct[];
}

// Verifier si le cache est valide (meme jour)
const isCacheValid = (cached: CachedRecommendations): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return cached.date === today;
};
```

### Nouveau fichier : `supabase/functions/ai-shop-recommendations/index.ts`

Cette edge function :
1. Recupere le profil de sante de l'utilisateur
2. Recupere ses check-ins recents
3. Recupere le catalogue Shopify
4. Demande a l'IA de recommander 3 produits pertinents
5. Retourne les IDs des produits recommandes

### Prompt de l'IA pour les recommandations

```text
Tu es VitaSync AI. Basé sur le profil utilisateur suivant :
[Health profile data]
[Recent check-ins trends]

Recommande exactement 3 produits du catalogue qui seraient les plus bénéfiques.
Réponds UNIQUEMENT avec un JSON valide contenant les product IDs.
```

---

## Fichiers a creer/modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/pages/Dashboard.tsx` | Modifier | Sidebar avec bords arrondis |
| `src/index.css` | Modifier | Classe glass-sidebar avec border-radius |
| `src/components/dashboard/ShopSection.tsx` | Modifier | Design ameliore + scroll to top + widget AI |
| `src/components/dashboard/shop/ProductGroupCard.tsx` | Modifier | Hover effects ameliores |
| `src/components/dashboard/shop/Pagination.tsx` | Modifier | Scroll to top au changement de page |
| `src/components/dashboard/shop/AIRecommendationsWidget.tsx` | Creer | Widget des recommandations IA |
| `src/components/dashboard/shop/index.ts` | Modifier | Exporter le nouveau widget |
| `supabase/functions/ai-shop-recommendations/index.ts` | Creer | Edge function pour les recommandations |
| `src/lib/i18n.ts` | Modifier | Ajouter les traductions du widget |

---

## Details techniques

### Edge Function `ai-shop-recommendations`

```typescript
// Structure de la reponse attendue
interface AIRecommendation {
  productIds: string[];
  reasoning: string;
}
```

### Cache localStorage

```typescript
// Format du cache
{
  "vitasync_ai_recommendations": {
    "date": "2026-02-04",
    "products": [
      { "productId": "123", "title": "...", "price": "29.99", "imageUrl": "..." },
      { "productId": "456", "title": "...", "price": "34.99", "imageUrl": "..." },
      { "productId": "789", "title": "...", "price": "19.99", "imageUrl": "..." }
    ]
  }
}
```

### Animations du widget

- Loading state : Pulse animation sur le logo IA
- Apparition des produits : Fade-in + slide-up avec delai echelonne
- Hover sur les produits : Scale + shadow

---

## Traductions a ajouter

```typescript
// FR
"shop.aiRecommendations": "Recommandations IA",
"shop.aiThinking": "Votre Coach IA analyse votre profil...",
"shop.aiRecommendationsDesc": "Sélection personnalisée pour vous",
"shop.refreshRecommendations": "Actualiser",

// EN
"shop.aiRecommendations": "AI Recommendations",
"shop.aiThinking": "Your AI Coach is analyzing your profile...",
"shop.aiRecommendationsDesc": "Personalized selection for you",
"shop.refreshRecommendations": "Refresh",

// ES
"shop.aiRecommendations": "Recomendaciones IA",
"shop.aiThinking": "Tu Coach IA está analizando tu perfil...",
"shop.aiRecommendationsDesc": "Selección personalizada para ti",
"shop.refreshRecommendations": "Actualizar",
```

---

## Avantages

1. **Design dynamique** : Animations fluides et feedback visuel ameliore
2. **Sidebar elegante** : Effet "flottant" moderne avec coins arrondis
3. **Navigation fluide** : Retour en haut automatique lors du changement de page
4. **Personnalisation IA** : Recommandations pertinentes basees sur le profil utilisateur
5. **Performance** : Cache quotidien pour eviter les appels API repetitifs
