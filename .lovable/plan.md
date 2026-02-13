# Plan : Fond progressif onboarding + Tutoriel Dashboard

## 1. Fond progressif d'avancement dans l'onboarding

**Concept** : A mesure que l'utilisateur repond aux questions, un degrade de couleur (vert/bleu/teal) monte progressivement depuis le bas de l'ecran en arriere-plan, donnant un retour visuel immersif de la progression.

**Implementation technique** :

- Dans `OnboardingFlow.tsx`, ajouter un `div` en position absolue derriere le contenu principal
- Ce div utilise un `height` anime via framer-motion, lie a la variable `progress` (deja calculee : `((currentStep + 1) / questions.length) * 100`)
- Le degrade va du vert au bleu/teal : `bg-gradient-to-t from-emerald-500/15 via-teal-500/10 to-primary/5`
- Animation fluide avec `motion.div` et `animate={{ height: progress + "%" }}`
- L'opacite reste subtile (10-15%) pour ne pas interferer avec la lisibilite du formulaire

## 2. Tutoriel du Dashboard (premiere connexion)

### 2.1 Base de donnees

- Ajouter une colonne `tutorial_completed` (boolean, default false) a la table `user_health_profiles` via migration SQL

### 2.2 Nouveau composant `DashboardTutorial.tsx`

Un overlay plein ecran en 4 etapes rapides, chaque etape est une "carte" avec :

- Un titre et une description courte
- Une illustration/mockup anime de la fonctionnalite
- Un bouton "Suivant" et un bouton "Passer le tutoriel"

**Les 4 etapes du tutoriel :**

1. **Check-in du jour** : "Chaque jour, reponds a un court formulaire sur ton sommeil, energie et stress. Ces donnees permettent a ton Coach IA de mieux te conseiller."
2. **Coach IA (VitaSync)** : "Pose tes questions sante a VitaSync, ton coach personnel. Il connait ton profil et t'accompagne au quotidien." -- Avec une animation simulant une conversation (bulles de chat qui apparaissent)
3. **Suivi des complements** : "Suis ta routine quotidienne et coche tes prises. Exemple : Creatine Monohydrate le matin, Whey Protein le soir." -- Avec une animation montrant des items qui se cochent
4. **Boutique** : "Decouvre des complements adaptes a ton profil dans notre boutique integree." -- Avec un apercu de cartes produits

### 2.3 Flux utilisateur

```text
Connexion -> Check-in du jour (modal existante)
          -> Si tutorial_completed = false : Tutoriel (4 etapes)
          -> Dashboard normal
```

- Le tutoriel se declenche apres la fermeture du check-in quotidien (ou son skip)
- L'utilisateur peut passer le tutoriel a tout moment via un bouton "Passer"
- A la fin ou au skip, `tutorial_completed` passe a `true` en base

### 2.4 Design du tutoriel

- Overlay plein ecran avec fond semi-transparent et `backdrop-blur`
- Cartes centrales en glassmorphism (`glass-card-premium`)
- Animations framer-motion (slide + deblur entre etapes)
- Indicateur de progression (4 points en bas)
- Le tutoriel est sobre, rapide (~15 secondes au total si l'utilisateur clique vite)

## 3. Fichiers concernes


| Fichier                                          | Action                                                  |
| ------------------------------------------------ | ------------------------------------------------------- |
| `supabase/migrations/`                           | Nouvelle migration : ajout colonne `tutorial_completed` |
| `src/hooks/useHealthProfile.tsx`                 | Ajouter `tutorial_completed` au type `HealthProfile`    |
| `src/components/onboarding/OnboardingFlow.tsx`   | Ajouter le div de fond progressif                       |
| `src/components/dashboard/DashboardTutorial.tsx` | **Nouveau** - Composant tutoriel 4 etapes               |
| `src/pages/Dashboard.tsx`                        | Integrer le tutoriel apres le check-in                  |


## 4. Details techniques

- Le fond progressif utilise `pointer-events-none` pour ne pas bloquer les interactions
- Le tutoriel utilise `z-index: 60` (au-dessus du check-in a z-50)
- Les animations de demo dans le tutoriel sont purement visuelles (pas de vraies donnees), simulees avec des timeouts et des animations framer-motion
- Le composant tutoriel recoit un callback `onComplete` qui met a jour la base et ferme l'overlay