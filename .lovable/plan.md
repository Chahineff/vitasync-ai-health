

# Corrections Pricing + Preview Features mobile/tablette

## Problèmes identifiés

1. **Pricing cards Go AI & Premium AI** : Le `ShineBorder` crée un fond gradient animé trop visible derrière le contenu des cartes, rendant le texte difficile à lire.
2. **Section Features ("Une IA qui comprend vraiment votre corps")** : Les widgets de preview (ChatPreviewWidget, TrackerPreviewWidget, etc.) sont masqués sur mobile et tablette (`hidden lg:block`), donc invisibles sur ces appareils.

## Plan

### 1. Réduire l'intensité du ShineBorder sur les pricing cards

**Fichier** : `src/components/sections/PricingSection.tsx`
- Réduire `borderWidth` de `1.5` à `1` pour les deux cartes avec ShineBorder
- Ajouter un fond opaque explicite sur le contenu intérieur des cartes (`bg-background`) pour que le gradient shine ne transparaisse pas à travers le contenu, uniquement visible sur le bord extérieur

**Fichier** : `src/components/ui/shine-border.tsx`
- Ajouter `bg-background` au div enfant intérieur (`.relative.z-[1]`) pour garantir que le contenu a toujours un fond opaque et que le shine ne se voit qu'en bordure

### 2. Afficher les previews Features sur mobile et tablette

**Fichier** : `src/components/ui/feature-steps.tsx`
- Changer le wrapper preview de `hidden lg:block` à `w-full lg:w-3/5`
- Sur mobile/tablette : afficher le preview sous les étapes en taille réduite (`aspect-[16/10]` et hauteur limitée `max-h-[250px] md:max-h-[350px]`)
- Garder le layout côte-à-côte sur desktop (`lg:flex-row`)
- Ajuster la hauteur du preview container : `h-[250px] md:h-[350px] lg:h-[500px]`

