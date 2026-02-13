

# Plan : 3 ameliorations du tutoriel

## 1. Agrandir la zone de description explicative

La bulle explicative (ligne 272) est actuellement limitee a `max-w-xl` avec un padding `p-4` et un texte `text-sm`. On va :
- Retirer la contrainte `max-w-xl` pour que la bulle prenne toute la largeur disponible
- Augmenter le padding a `p-5`
- Passer le texte a `text-base` avec un `leading-relaxed`
- Agrandir l'icone VitaSync de `w-6 h-6` a `w-8 h-8`
- Ajouter le titre de l'etape en cours au-dessus du texte descriptif (ex: "Accueil", "Coach IA", etc.)

**Fichier** : `DashboardTutorial.tsx` lignes 272-275

## 2. Images reelles des produits dans la boutique du tutoriel

Actuellement, les cartes produits affichent un fond colore avec un emoji. On va remplacer cela par les vraies images des produits Shopify.

**Approche** : Le composant `TutorialShopDemo` fera un appel a `fetchProducts()` depuis `src/lib/shopify.ts` au montage pour recuperer les vrais produits avec leurs images. Les donnees statiques (noms, prix, tags) seront conservees en fallback si le fetch echoue.

- Ajouter un `useEffect` + `useState` pour charger les produits Shopify
- Mapper les produits par nom pour associer chaque produit statique a son image reelle
- Afficher `<img src={imageUrl}>` dans un container `aspect-square` au lieu du fond colore + emoji
- Conserver le fallback colore si aucune image n'est trouvee

**Fichier** : `TutorialShopDemo.tsx`

## 3. Bouton "Retour" pour revenir en arriere

Ajouter un bouton "Precedent" a cote du bouton "Suivant" dans les controles du tutoriel, visible uniquement quand `currentStep > 0`.

- Ajouter une fonction `handlePrev` qui appelle `goToStep(currentStep - 1)` avec la meme animation de curseur
- Modifier `goToStep` pour accepter les indices inferieurs au step actuel (deja le cas)
- Afficher le bouton avec une fleche gauche (`ArrowLeft` de Phosphor)

**Fichier** : `DashboardTutorial.tsx` lignes 280-301

## Resume des fichiers modifies

| Fichier | Modification |
|---|---|
| `src/components/dashboard/DashboardTutorial.tsx` | Bulle agrandie + bouton Precedent |
| `src/components/dashboard/tutorial/TutorialShopDemo.tsx` | Fetch des vraies images produits Shopify |

