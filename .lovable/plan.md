

# Plan : Tutoriel Dashboard immersif + Relancer depuis les parametres

## 1. Bouton "Relancer le tutoriel" dans les Parametres

Ajouter un bouton dans `ProfileSection.tsx` (entre le selecteur de langue et le formulaire de profil) qui :
- Remet `tutorial_completed` a `false` en base
- Declenche le tutoriel immediatement via un callback passe depuis `Dashboard.tsx`

**Fichiers concernes** : `ProfileSection.tsx`, `Dashboard.tsx`

## 2. Refonte complete du tutoriel : Experience immersive

### Concept

Au lieu de cartes statiques dans une modale, le tutoriel prend tout l'ecran et simule un vrai dashboard VitaSync. Un curseur anime se deplace automatiquement entre les elements de la sidebar, clique dessus, et des bulles explicatives apparaissent pour decrire chaque fonctionnalite.

### Architecture du composant

Le composant `DashboardTutorial.tsx` sera entierement reecrit avec :

**a) Un faux dashboard plein ecran**
- Une sidebar simplifiee (logo VitaSync + menu items : Accueil, Coach IA, Supplements, Boutique, Parametres)
- Une zone de contenu principale qui change selon la section selectionnee
- Le tout en glassmorphism, identique au vrai dashboard

**b) Un curseur anime**
- Un element `motion.div` representant un curseur (forme de fleche SVG)
- Il se deplace avec `animate={{ x, y }}` entre des positions precalculees
- A chaque "clic", un effet ripple/pulse apparait

**c) Sequence automatique en 5 etapes**

| Etape | Le curseur va vers... | Contenu affiche | Bulle explicative |
|---|---|---|---|
| 1 | Zone "Accueil" (deja selectionnee) | Apercu du dashboard home avec check-in widget | "Chaque jour, remplis ton check-in pour que ton Coach IA s'adapte a toi." |
| 2 | Bouton "Coach IA" dans la sidebar | Simulation d'une conversation (bulles de chat animees) | "Pose tes questions sante a VitaSync. Il connait ton profil et s'adapte a tes besoins." |
| 3 | Bouton "Supplements" dans la sidebar | Liste de supplements avec cochage automatique | "Suis ta routine et coche tes prises. Exemple : Creatine le matin, Magnesium le soir." |
| 4 | Bouton "Boutique" dans la sidebar | Grille de 3 cartes produits animees | "Decouvre une large selection de complements adaptes a ton profil." |
| 5 | Bouton "Parametres" dans la sidebar | Apercu des settings (theme toggle, profil sante) | "Modifie ton profil de sante, change de theme, ajuste tes preferences a tout moment." |

**d) Bulles explicatives**
- Positionnees a cote du contenu principal (pas par-dessus)
- Animation d'apparition en slide + deblur
- Texte court et precis

**e) Controles utilisateur**
- Bouton "Passer" en haut a droite (permanent)
- Bouton "Suivant" pour avancer manuellement (ou l'animation avance automatiquement apres ~4 secondes)
- Indicateur de progression (5 points en bas)

### Deroulement temporel de chaque etape

```text
1. Curseur se deplace vers l'element sidebar (~800ms)
2. Effet de clic/pulse sur l'element (~300ms)
3. L'element sidebar s'active visuellement (~200ms)
4. Le contenu principal change avec animation slide (~400ms)
5. La bulle explicative apparait (~300ms)
6. Pause (~3 secondes) ou clic utilisateur sur "Suivant"
```

## 3. Fichiers concernes

| Fichier | Action |
|---|---|
| `src/components/dashboard/DashboardTutorial.tsx` | Reecrit entierement : tutoriel immersif plein ecran |
| `src/components/dashboard/ProfileSection.tsx` | Ajout bouton "Relancer le tutoriel" |
| `src/pages/Dashboard.tsx` | Passer callback `onRestartTutorial` a ProfileSection |

## 4. Details techniques

- Le faux dashboard est un composant pur (pas de donnees reelles, tout est simule)
- Le curseur utilise un SVG de pointeur classique (fleche blanche avec bord noir)
- Les positions du curseur sont des coordonnees en pourcentage pour etre responsive
- Sur mobile, le tutoriel utilise la bottom nav au lieu de la sidebar
- Les refs des elements sidebar sont utilisees pour calculer les positions du curseur via `useRef` + positions fixes
- Le composant reste en `z-[60]` pour etre au-dessus de tout
- `pointer-events-none` sur le faux dashboard, seuls les boutons Passer/Suivant sont cliquables

