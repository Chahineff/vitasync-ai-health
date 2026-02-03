

# Plan d'amelioration de la Boutique VitaSync

## Problemes identifies

Apres analyse du code et des donnees Shopify, j'ai identifie les problemes suivants :

1. **Multilangue non fonctionnel dans le Dashboard** : Le systeme i18n fonctionne uniquement sur la landing page (Navbar), mais le dashboard utilise du texte code en dur en francais
2. **Pas de regroupement des produits par saveurs** : Les produits comme "Energy Powder (Fruit Punch)", "Energy Powder (Strawberry Shortcake)" apparaissent separement au lieu d'etre regroupes
3. **Grille non optimale** : Actuellement 1-2-3 colonnes, au lieu de 3 mobile / 4 desktop
4. **Pas de pagination** : Tous les produits s'affichent d'un coup
5. **Recherche basique** : Requiert le nom exact, pas de recherche interactive
6. **Filtres limites** : Seulement categories, manque prix, tri A-Z

## Categories definies

Basees sur les productType Shopify existants, je propose ces mega-categories :

| Mega-Categorie | Types Shopify inclus |
|----------------|---------------------|
| Sport | Proteins, Muscle Builders, Pre-Workout, Intra-Workout, Post-Workout Recovery |
| Bien-etre | Specialty Supplements, Stress & Relaxation, Sleep Support |
| Sante Digestive | Digestive Support, Gut Health |
| Vitamines | Vitamins & Minerals |
| Cerveau & Focus | Brain & Cognitive |
| Poids | Weight Management |
| Champignons | Mushroom Products, Bee Products |
| Os & Articulations | Bone, Joint & Cartilage |
| Autre | Tous les autres types |

## Solution proposee

### Etape 1 : Ajouter les traductions du Dashboard

Modifier `src/lib/i18n.ts` pour ajouter les cles de traduction du dashboard et de la boutique en FR/EN/ES

### Etape 2 : Creer le composant de recherche interactive

Nouveau fichier : `src/components/dashboard/shop/SearchOverlay.tsx`
- Barre de recherche qui s'agrandit au focus
- Recherche fuzzy (tolere les fautes, recherche partielle)
- Affiche les resultats avec images en temps reel
- Maximum 6 resultats dans l'overlay
- Ferme automatiquement quand on clique ailleurs

### Etape 3 : Creer le systeme de filtres avances

Nouveau fichier : `src/components/dashboard/shop/ShopFilters.tsx`
- Tabs de mega-categories en haut (Sport, Bien-etre, etc.)
- Dropdown de tri : A-Z, Z-A, Prix croissant, Prix decroissant
- Slider de prix (min-max)
- Bouton de reinitialisation des filtres

### Etape 4 : Creer le composant ProductGroupCard

Nouveau fichier : `src/components/dashboard/shop/ProductGroupCard.tsx`
- Affiche un groupe de produits (ex: toutes les saveurs de Whey)
- Badge "X saveurs" si plusieurs produits groupes
- Au hover sur desktop : montre les autres saveurs disponibles
- Image change selon la saveur survolee
- Au clic : ouvre la fiche produit avec le selecteur de saveurs

### Etape 5 : Creer le hook de regroupement des produits

Nouveau fichier : `src/hooks/useProductGroups.ts`
- Logique de regroupement basee sur le titre de base
- Detecte les patterns : "Nom (Saveur)", "Nom - Saveur"
- Retourne des groupes au lieu de produits individuels

### Etape 6 : Refondre ShopSection avec pagination

Modifier `src/components/dashboard/ShopSection.tsx`
- Integrer les nouveaux composants
- Grille : 3 colonnes mobile / 4 colonnes desktop
- Pagination : 20 produits par page
- Navigation premiere/precedente/suivante/derniere page
- Compteur "Page X sur Y" et "X produits trouves"

## Structure de la nouvelle boutique

```text
+------------------------------------------------------------------+
|  Boutique                              [Recherche...] [Panier]   |
+------------------------------------------------------------------+
|  [Tous] [Sport] [Bien-etre] [Digestif] [Vitamines] [Focus] ...   |
+------------------------------------------------------------------+
|  Trier: [A-Z v]   Prix: [-----|-----]   [Reinitialiser]          |
+------------------------------------------------------------------+
|                                                                   |
|  +----------+  +----------+  +----------+  +----------+          |
|  |  WHEY    |  |  ENERGY  |  | CREATINE |  |  BCAA    |          |
|  | PROTEIN  |  |  POWDER  |  |          |  |          |          |
|  |          |  |          |  |          |  |          |          |
|  | 2 saveurs|  | 3 saveurs|  |          |  |          |          |
|  | 34.90 EUR|  | 29.90 EUR|  | 33.90 EUR|  | 28.90 EUR|          |
|  +----------+  +----------+  +----------+  +----------+          |
|                                                                   |
|  +----------+  +----------+  +----------+  +----------+          |
|  |          |  |          |  |          |  |          |          |
|  |   ...    |  |   ...    |  |   ...    |  |   ...    |          |
|  +----------+  +----------+  +----------+  +----------+          |
|                                                                   |
|              [<] Page 1 sur 4 [>]   |  73 produits               |
+------------------------------------------------------------------+
```

## Recherche interactive (overlay)

```text
+------------------------------------------------------------------+
|  [Q Rechercher un produit...                                 X]  |
+------------------------------------------------------------------+
|  +--------+  Whey Protein Isolate                                |
|  |  IMG   |  Proteins - 34.90 EUR                                |
|  +--------+                                                       |
|  +--------+  Whey Protein Concentrate                            |
|  |  IMG   |  Proteins - 29.90 EUR                                |
|  +--------+                                                       |
|  +--------+  Weight Gainer                                        |
|  |  IMG   |  Weight Management - 45.90 EUR                       |
|  +--------+                                                       |
+------------------------------------------------------------------+
```

## Fichiers a creer/modifier

| Fichier | Action | Description |
|---------|--------|-------------|
| `src/lib/i18n.ts` | Modifier | Ajouter traductions dashboard + boutique |
| `src/components/dashboard/shop/SearchOverlay.tsx` | Creer | Recherche interactive avec resultats |
| `src/components/dashboard/shop/ShopFilters.tsx` | Creer | Tabs categories + tri + slider prix |
| `src/components/dashboard/shop/ProductGroupCard.tsx` | Creer | Carte produit avec saveurs groupees |
| `src/components/dashboard/shop/Pagination.tsx` | Creer | Composant pagination |
| `src/components/dashboard/shop/index.ts` | Creer | Exports des composants shop |
| `src/hooks/useProductGroups.ts` | Creer | Hook de regroupement produits |
| `src/components/dashboard/ShopSection.tsx` | Modifier | Integrer tous les nouveaux composants |
| `src/components/dashboard/MobileBottomNav.tsx` | Modifier | Ajouter traductions |
| `src/pages/Dashboard.tsx` | Modifier | Ajouter traductions |

## Details techniques

### Algorithme de regroupement des produits

```text
Pour chaque produit:
  1. Extraire le titre de base (sans suffixe saveur)
  2. Patterns detectes:
     - "Nom (Saveur)" -> base = "Nom", flavor = "Saveur"
     - "Nom - Saveur" -> base = "Nom", flavor = "Saveur"
  3. Grouper par titre de base
  4. Si groupe > 1 produit : afficher comme groupe avec saveurs
  5. Si groupe = 1 produit : afficher normalement
```

### Recherche fuzzy

```text
La recherche matchera si:
  - Le terme est inclus dans le titre (insensible a la casse)
  - Le terme est inclus dans la description
  - Le terme est inclus dans le type de produit
  - Match partiel (ex: "whey" trouve "Whey Protein")
  - Tolere les espaces supplementaires
```

### Mega-categories mapping

```text
const CATEGORY_MAPPING = {
  sport: [
    "Proteins", "Muscle Builders", "Pre-Workout Supplements",
    "Intra-Workout Supplements", "Post-Workout Recovery"
  ],
  wellness: [
    "Specialty Supplements", "Stress & Relaxation", 
    "Sleep Support", "Sexual & Reproductive Wellness"
  ],
  digestive: ["Digestive Support"],
  vitamins: ["Vitamins & Minerals"],
  brain: ["Brain & Cognitive"],
  weight: ["Weight Management"],
  mushrooms: ["Mushroom Products", "Bee Products"],
  bones: ["Bone, Joint & Cartilage"],
}
```

## Avantages de cette approche

1. **Produits regroupes** : Les saveurs sont dans une seule carte, plus clair pour l'utilisateur
2. **Recherche intuitive** : Pas besoin du nom exact, affichage temps reel
3. **Navigation par categories** : Acces rapide aux types de produits
4. **Tri flexible** : Par nom ou par prix
5. **Pagination** : Chargement plus rapide, navigation claire
6. **Multilangue** : Interface traduite en FR/EN/ES
7. **Responsive** : 3 colonnes mobile, 4 desktop

