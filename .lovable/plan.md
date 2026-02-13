

# Plan : Ameliorations du tutoriel Dashboard

## 1. Fond opaque du tutoriel

Le conteneur principal du tutoriel (`DashboardTutorial.tsx`) utilise actuellement `bg-gradient-to-br from-background via-background to-secondary/5`, ce qui laisse entrevoir le vrai dashboard en arriere-plan. On remplace par un fond completement opaque `bg-background` (qui sera le noir/sombre du theme actuel) pour eliminer toute transparence.

**Fichier** : `DashboardTutorial.tsx` ligne 129
- Remplacer `bg-gradient-to-br from-background via-background to-secondary/5` par `bg-background`

## 2. Animation de transition "Bienvenue" a la fin du tutoriel

Quand l'utilisateur clique sur "C'est parti !", au lieu de fermer instantanement le tutoriel :

1. Le tutoriel disparait avec un fade-out rapide
2. Un message "Bienvenue dans votre dashboard" apparait en plein ecran (centre, grande typographie, avec le logo VitaSync) pendant ~2.5 secondes
3. Ce message disparait en fade-out
4. Le vrai dashboard se revele

**Implementation** :
- Ajouter un nouvel etat `welcomePhase` dans `Dashboard.tsx` (au lieu de dans le tutoriel)
- Quand `handleTutorialComplete` est appele, activer `welcomePhase = true` pendant 3 secondes
- Afficher un overlay anime avec le texte "Bienvenue dans votre dashboard" + logo VitaSync
- Apres 3 secondes, fade-out du message

**Fichier** : `Dashboard.tsx`

## 3. Shop avec vrais noms de produits VitaSync

Remplacer les 6 produits generiques par 12 produits reels du catalogue VitaSync avec des vrais noms et des images placeholder plus realistes. Les produits seront affiches dans une grille 4 colonnes (desktop) pour donner l'impression d'un catalogue riche.

**Fichier** : `TutorialShopDemo.tsx`

Produits a afficher (12 au lieu de 6) :

| Nom | Prix | Categorie |
|---|---|---|
| Creatine Monohydrate | 29,99 EUR | Muscle |
| Whey Isolate | 44,99 EUR | Proteines |
| 5-HTP | 24,99 EUR | Sommeil |
| BCAA 2:1:1 | 27,99 EUR | Muscle |
| Magnesium Bisglycinate | 22,99 EUR | Sommeil |
| Omega-3 Ultra | 34,99 EUR | Cerveau |
| Vitamine D3 + K2 | 19,99 EUR | Immunite |
| Ashwagandha KSM-66 | 27,99 EUR | Stress |
| Zinc Picolinate | 14,99 EUR | Immunite |
| Collagene Marin | 32,99 EUR | Peau |
| Probiotiques 50B | 29,99 EUR | Digestion |
| Multivitamines Sport | 24,99 EUR | Energie |

- Utiliser des images de produits du dossier `lovable-uploads` si disponibles, sinon un placeholder colore representatif de la categorie
- Grille responsive : 4 colonnes desktop, 3 tablette, 2 mobile
- Ajouter des categories supplementaires dans les filtres : "Tous", "Proteines", "Vitamines", "Mineraux", "Omega", "Energie", "Sommeil", "Muscle"

## Resume des fichiers modifies

| Fichier | Modification |
|---|---|
| `src/components/dashboard/DashboardTutorial.tsx` | Fond opaque `bg-background` |
| `src/pages/Dashboard.tsx` | Ajout phase "Bienvenue" avec overlay anime apres le tutoriel |
| `src/components/dashboard/tutorial/TutorialShopDemo.tsx` | 12 vrais produits VitaSync, grille elargie |

