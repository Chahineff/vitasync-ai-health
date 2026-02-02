
# Plan d'amelioration des fiches produits VitaSync

## Probleme principal identifie

Actuellement, quand on clique sur un produit depuis la boutique du dashboard, on est redirige vers `/product/:handle` qui est une page independante, sans la sidebar du dashboard. La sidebar disparait completement.

## Solution proposee

### Architecture : Page produit integree au Dashboard

Au lieu d'utiliser une route separee `/product/:handle`, je propose d'integrer l'affichage des produits directement dans le dashboard, comme une nouvelle section. Cela garantit que la sidebar reste toujours visible.

### Etape 1 : Creer un composant ProductDetailSection

Nouveau fichier : `src/components/dashboard/ProductDetailSection.tsx`

Ce composant sera affiche dans le dashboard quand on clique sur un produit. Il contiendra :

**Zone Image (gauche sur desktop)**
- Galerie d'images avec navigation par miniatures
- Image principale avec animation de transition
- Badge "Recommande par l'IA" si applicable
- Zoom au survol (optionnel)

**Zone Informations (droite sur desktop)**
- Marque (vendor) en petit au-dessus du titre
- Titre du produit en grand
- Badge de categorie (productType)
- Prix avec indication de devise
- Selecteur de variantes (si plusieurs disponibles)
- Statut de disponibilite
- Boutons d'action :
  - Ajouter au panier (principal)
  - Ajouter au suivi des complements

**Onglets d'information detaillee**
1. **Description** : HTML complet depuis Shopify avec mise en forme
2. **Bienfaits** : Liste extraite depuis les metafields ou parsee depuis la description
3. **Ingredients** : Liste complete extraite depuis la description HTML
4. **Utilisation** : Dosage recommande et conseils d'utilisation
5. **Informations** : Pays de fabrication, poids, avertissements

### Etape 2 : Parser les donnees riches depuis Shopify

Les descriptions Shopify contiennent des informations structurees :
- **Ingredients** : Section "Ingredients:" dans le HTML
- **Suggested Use** : Section "Suggested Use:" 
- **Product Amount** : Section "Product Amount:"
- **Caution/Warning** : Sections d'avertissement
- **Manufacturer Country** : Pays de fabrication

Je vais creer des fonctions utilitaires pour extraire ces donnees :

```text
Fichier: src/lib/shopify-parser.ts
- extractIngredients(htmlDescription)
- extractSuggestedUse(htmlDescription)
- extractProductAmount(htmlDescription)
- extractManufacturerCountry(htmlDescription)
- extractWarnings(htmlDescription)
- extractCertifications(htmlDescription) - pour les badges (Gluten-free, etc.)
```

### Etape 3 : Modifier le Dashboard pour supporter la navigation produit

Modifications dans `src/pages/Dashboard.tsx` :
- Ajouter un nouvel etat `selectedProductHandle`
- Ajouter une section conditionnelle pour afficher `ProductDetailSection`
- Le bouton retour ramene a la boutique

```text
Type Section etendu:
"home" | "coach" | "supplements" | "shop" | "product" | "settings" | "help"
```

### Etape 4 : Modifier ProductCard pour navigation interne

Modifications dans `src/components/dashboard/ProductCard.tsx` :
- Au lieu de `<Link to="/product/...">`, utiliser un callback `onProductClick`
- Propager le handle vers le parent pour changer la section

### Etape 5 : Modifier ShopSection pour gerer la selection

Modifications dans `src/components/dashboard/ShopSection.tsx` :
- Ajouter prop `onProductSelect(handle: string)`
- Passer cette prop aux ProductCard

## Structure de la nouvelle fiche produit

```text
+------------------------------------------------------------------+
|  [←] Retour a la boutique                    [Panier] [Favoris]  |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------+   +--------------------------------+  |
|  |                        |   | VITASYNC                       |  |
|  |    IMAGE PRINCIPALE    |   | Titre du Produit               |  |
|  |                        |   | [Specialty Supplements]        |  |
|  |                        |   |                                |  |
|  |                        |   | 19.90 EUR                      |  |
|  +------------------------+   |                                |  |
|  [min1] [min2] [min3]         | Variante: [Option 1] [Option 2]|  |
|                               |                                |  |
|                               | [+ Ajouter au panier]  [Suivi] |  |
|                               +--------------------------------+  |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | [Description] [Bienfaits] [Ingredients] [Utilisation] [Info] | |
|  +--------------------------------------------------------------+ |
|  |                                                               | |
|  |  Contenu de l'onglet selectionne...                          | |
|  |                                                               | |
|  |  - Point 1                                                    | |
|  |  - Point 2                                                    | |
|  |  - Point 3                                                    | |
|  |                                                               | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | Certifications: [Gluten-free] [Lactose-free] [All Natural]   | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

## Fichiers a creer/modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/lib/shopify-parser.ts` | Creer | Fonctions d'extraction des donnees structurees |
| `src/components/dashboard/ProductDetailSection.tsx` | Creer | Nouveau composant fiche produit complete |
| `src/pages/Dashboard.tsx` | Modifier | Ajouter section "product" et gestion navigation |
| `src/components/dashboard/ShopSection.tsx` | Modifier | Ajouter callback onProductSelect |
| `src/components/dashboard/ProductCard.tsx` | Modifier | Navigation interne au lieu de lien externe |

## Avantages de cette approche

1. **Sidebar toujours visible** : L'utilisateur reste dans le contexte du dashboard
2. **Navigation fluide** : Pas de rechargement de page
3. **Donnees enrichies** : Extraction automatique des ingredients, dosage, etc.
4. **Coherence UX** : Meme design glass-card que le reste du dashboard
5. **Acces rapide** : Bouton retour ramene directement a la boutique

## Note technique

La route `/product/:handle` existante sera conservee pour l'acces direct par URL (partage, SEO), mais la navigation depuis le dashboard utilisera le systeme de sections internes.
