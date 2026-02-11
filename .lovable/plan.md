

# Correction "Produit non disponible" et reponses tronquees

## Probleme identifie

L'erreur dans la console est claire : `Error calling Shopify: Variable $id of type ID! was provided invalid value`.

Deux causes racines :

### Cause 1 : Le regex de parsing casse les IDs contenant des colons

Le variantId fourni par l'IA contient `gid://shopify/ProductVariant/53224061731184` avec des colons (`:`). Le regex actuel `([^:\]]+)` s'arrete au premier colon et capture seulement `gid` au lieu du GID complet. Le parsing est completement fausse.

### Cause 2 : L'IA peut halluciner des IDs produit

Meme si les IDs etaient correctement parses, l'IA genere parfois des IDs numeriques qui ne correspondent a aucun produit reel dans Shopify (ex: `15014337380720`). Appeler `fetchProductById` avec un ID invalide echoue systematiquement.

---

## Solution : Utiliser le cache produit partage au lieu d'appels individuels

Le hook `useShopifyProductResolver` existe deja et charge TOUS les produits en une seule requete, les met en cache, et permet de resoudre n'importe quel ID (numerique ou GID) vers les donnees produit. Il faut l'utiliser dans `ProductRecommendationCard` au lieu de `fetchProductById`.

De plus, il faut corriger le regex pour gerer les GIDs avec colons dans le variantId.

---

## Modifications

### 1. Corriger le regex de parsing (`ProductRecommendationCard.tsx`)

Remplacer le regex actuel :
```
/\[\[PRODUCT:([^:\]]+):([^:\]]+):([^:\]]+):([^\]]+)\]\]/g
```

Par un regex qui gere les GIDs contenant des colons dans le variantId :
```
/\[\[PRODUCT:([^:\]]+):((?:gid:\/\/[^:]+|[^:\]]+)):([^:\]]+):([^\]]+)\]\]/g
```

Ce nouveau pattern autorise `gid://...` comme variantId sans casser sur les colons internes.

### 2. Utiliser `useShopifyProductResolver` dans `ProductRecommendationCard.tsx`

Remplacer l'appel direct a `fetchProductById` (qui echoue quand l'ID est hallucine) par une resolution via le cache partage :

- Importer `useShopifyProductResolver` au niveau du composant parent (le `ChatMessageBubble` qui rend les cartes produit)
- Ou bien dans `ProductRecommendationCard` lui-meme, utiliser le hook pour resoudre le productId
- Le hook charge tous les produits une seule fois et les met en cache, puis fait une correspondance par ID numerique ou GID
- Si le productId ne matche pas par ID, ajouter un fallback par nom de produit (fuzzy match sur le titre)

### 3. Ajouter un fallback par nom de produit

Si le productId ne se resout pas via le cache (ID hallucine), chercher le produit par son nom (`product.name` du tag) dans la liste des produits caches. Cela garantit que meme avec un mauvais ID, le produit s'affiche si le nom est correct.

### 4. Simplifier le format des IDs dans le system prompt (`ai-coach/index.ts`)

Changer le format du tag dans le catalogue pour utiliser uniquement des IDs numeriques (sans GID pour le variantId) :
```
Avant : [[PRODUCT:${productId}:${variantId}:${p.title}:${price}]]
Apres : [[PRODUCT:${productId}:${variantNumericId}:${p.title}:${price}]]
```

Ou `variantNumericId = variant.id.split('/').pop()` pour eviter les GIDs avec colons dans le tag.

---

## Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/components/dashboard/ProductRecommendationCard.tsx` | Regex corrige pour GIDs, fallback par nom de produit via `useShopifyProductResolver` |
| `supabase/functions/ai-coach/index.ts` | Utiliser des IDs numeriques (sans `gid://`) dans les tags `[[PRODUCT:...]]` du catalogue |

