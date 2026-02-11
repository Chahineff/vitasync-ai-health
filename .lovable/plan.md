
# Plan d'adaptation mobile et tablette du Dashboard VitaSync

## Problemes identifies

1. **Sidebar visible sur mobile/tablette** : La sidebar fixe (positionnee avec `left-4`, `z-50`) reste partiellement visible ou cause du debordement horizontal sur les ecrans < 1024px, meme avec `-translate-x-full`. Le `left-4` (16px) peut causer un decalage residuel visible.

2. **Shop / PDP : debordement horizontal** : Sur mobile, le contenu du PDP et de la boutique depasse la largeur de l'ecran, obligeant a scroller horizontalement. Le container principal utilise `overflow-auto` sans contrainte `overflow-x-hidden`.

3. **Settings incomplet sur mobile** : Les boutons "Help Center" et "Sign Out" n'existent que dans la sidebar desktop. Sur mobile/tablette, ces options sont inaccessibles depuis la bottom nav.

---

## Corrections prevues

### 1. Masquer completement la sidebar sur mobile et tablette

**Fichier** : `src/pages/Dashboard.tsx`

- Remplacer la visibilite de la sidebar par `hidden lg:flex` au lieu de `-translate-x-full lg:translate-x-0`. Cela elimine tout risque de debordement ou d'element partiellement visible.
- Supprimer le bouton hamburger mobile et l'overlay associe (devenus inutiles car la bottom nav remplace la sidebar).
- Supprimer l'import de `List` (hamburger icon) devenu inutile.

### 2. Corriger le debordement horizontal du contenu

**Fichier** : `src/pages/Dashboard.tsx`

- Ajouter `overflow-x-hidden` au container principal `<main>` pour empecher tout scroll horizontal.
- Ajouter `max-w-full` ou `w-full overflow-hidden` sur le wrapper du contenu.

**Fichier** : `src/components/dashboard/pdp/ProductDetailMaster.tsx`

- Ajouter `overflow-x-hidden` au wrapper principal du PDP (`max-w-[1200px]`).
- S'assurer que les sections internes (galerie, purchase box, etc.) respectent `max-w-full`.

**Fichier** : `src/components/dashboard/pdp/ProductGallery.tsx`

- Verifier que l'image principale utilise bien `object-contain` avec des contraintes `max-w-full` pour ne jamais depasser la largeur de l'ecran.

**Fichier** : `src/components/dashboard/ShopSection.tsx`

- Ajouter `overflow-x-hidden` au container de la grille produits.

### 3. Ajouter Help Center et Sign Out dans les Settings (mobile/tablette)

**Fichier** : `src/components/dashboard/ProfileSection.tsx`

- Ajouter en bas de la section Settings (visible uniquement en dessous de `lg:`) :
  - Un bouton "Centre d'aide" qui declenche le changement de section vers "help"
  - Un bouton "Se deconnecter" avec style destructif
- Cela necessite de passer deux nouvelles props a `ProfileSection` : `onNavigateToHelp` et `onSignOut`.

**Fichier** : `src/pages/Dashboard.tsx`

- Passer les callbacks `onNavigateToHelp` et `onSignOut` a `ProfileSection`.

---

## Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/pages/Dashboard.tsx` | Sidebar `hidden lg:flex`, suppression hamburger mobile, `overflow-x-hidden` sur main, passage de props a ProfileSection |
| `src/components/dashboard/ProfileSection.tsx` | Ajout des boutons Help Center et Sign Out visibles uniquement sur mobile/tablette (`lg:hidden`) |
| `src/components/dashboard/pdp/ProductDetailMaster.tsx` | `overflow-x-hidden` sur le wrapper PDP |
| `src/components/dashboard/ShopSection.tsx` | `overflow-x-hidden` sur le container grille |

## Principes respectes

- Aucune nouvelle dependance
- Design Bio-Tech Luxury preserve (glassmorphism, rounded-3xl)
- Bottom nav reste la navigation principale sur mobile/tablette
- Desktop (>= 1024px) reste inchange
