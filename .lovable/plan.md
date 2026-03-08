

# Fix: Galerie sticky et alignement page produit

## Problèmes identifiés

1. **Sticky ne fonctionne pas** : Le conteneur parent `#dashboard-scroll-container` a `overflow-auto`, ce qui crée un nouveau contexte de scroll. Or `position: sticky` fonctionne par rapport au plus proche ancêtre scrollable. La galerie est sticky par rapport à ce conteneur scrollable, mais le `top-[100px]` ne correspond pas au bon offset dans ce contexte (le header sticky interne du PDP ajoute ~60px, pas 100px depuis le viewport).

2. **Contenu décalé à droite** : La grille `lg:grid-cols-2` force un layout 50/50. Comme la galerie (colonne gauche) est plus petite que la moitié de l'espace disponible, tout le contenu texte se retrouve poussé dans la colonne droite, créant un déséquilibre visuel.

## Plan de correction

### Fichier : `src/components/dashboard/pdp/ProductDetailMaster.tsx`

1. **Corriger le sticky** :
   - Changer `lg:top-[100px]` en `lg:top-[80px]` pour correspondre à la hauteur réelle du header sticky du PDP (~64px + marge)
   - Ajouter `overflow-y-auto` sur la colonne sticky pour gérer les cas où la galerie dépasse la hauteur visible

2. **Rééquilibrer la grille** :
   - Passer de `lg:grid-cols-2` (50/50) à `lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]` pour donner ~42% à la galerie et ~58% au contenu — moins d'espace perdu à gauche, contenu moins poussé à droite
   - Réduire le gap de `lg:gap-10` à `lg:gap-8`

3. **S'assurer que le sticky fonctionne dans le scroll container** :
   - Le `sticky` fonctionne avec `overflow-auto` du parent tant que le `top` est relatif au conteneur scrollable (pas au viewport). Donc `top-0` ou un petit offset comme `top-4` est plus approprié que `top-[100px]`
   - Mettre `lg:top-4` sur la galerie sticky (petit offset depuis le haut du scroll container)

### Résumé des changements
| Élément | Avant | Après |
|---------|-------|-------|
| Grille | `lg:grid-cols-2 gap-10` | `lg:grid-cols-[5fr_7fr] gap-8` |
| Sticky top | `lg:top-[100px]` | `lg:top-4` |
| Max height | `lg:max-h-[calc(100vh-120px)]` | `lg:max-h-[calc(100vh-140px)]` avec `overflow-y-auto` |

