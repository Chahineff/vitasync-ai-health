

# Refonte Premium de l'Onboarding et du Check-in Quotidien

## Objectif

Remplacer tous les emojis par des icones Phosphor Icons stylisees, ajouter des animations professionnelles, adapter le layout desktop (3/4 de l'ecran) et optimiser pour mobile.

---

## 1. OnboardingFlow.tsx -- Refonte complete

### Layout Desktop vs Mobile
- Centrer le contenu dans un conteneur `max-w-3xl mx-auto` (environ 6/8 de l'ecran sur desktop)
- Sur mobile : plein ecran comme actuellement
- Ajouter un fond decoratif avec orbes flottants animes

### Remplacement des emojis par des icones Phosphor
Chaque option utilisera une icone Phosphor Icons (`weight="duotone"`) dans un cercle degrade au lieu d'un emoji :

| Emoji actuel | Remplacement Phosphor |
|---|---|
| `😴` Sommeil | `Moon` avec fond indigo |
| `⚡` Energie | `Lightning` avec fond amber |
| `🎯` Focus | `Crosshair` avec fond blue |
| `🧘` Stress | `Leaf` avec fond green |
| `🏋️` Sport | `Barbell` avec fond orange |
| `💪` Muscle | `Dumbbell` avec fond red |
| `🏃` Perte poids | `PersonSimpleRun` avec fond teal |
| `🍃` Digestion | `Leaf` avec fond emerald |
| `🛡️` Immunite | `ShieldCheck` avec fond violet |
| `✨` Peau/cheveux | `Sparkle` avec fond pink |
| `💭` Autre | `DotsThree` avec fond gray |
| `🚶` 0-1x/sem | `PersonSimpleWalk` |
| `🏃` 2-3x/sem | `PersonSimpleRun` |
| `🏋️` 4-5x/sem | `Barbell` |
| `🔥` 6+/sem | `Flame` |
| `😫/😕/😊/😴` Sleep | `MoonStars` avec niveaux de remplissage |
| `🍖/🥗/🌱` Regimes | `CookingPot`, `Salad`, `Plant`, etc. |
| `🥛/🌾/🥚` Allergies | Icones dediees avec fond rouge/warning |
| `💊/🥤/🍬/💧` Formes | `Pill`, `Cup`, `Drop` |
| `✅/🔞` Oui/Non | `CheckCircle` / `XCircle` |
| `🔒` Prefer not say | `Lock` |

### Animations ajoutees
- **Selection d'option** : animation `spring` avec rebond (scale 0.95 -> 1.05 -> 1) + changement de couleur fluide
- **Transition entre etapes** : slide horizontal avec deblur (filter: blur(4px) -> blur(0))
- **Barre de progression** : animation fluide avec `layoutId` de Framer Motion
- **Bouton Continuer** : micro-animation de pulsation quand actif, effet "launch" au clic
- **Icone selectionnee** : rotation subtile + scale avec effet de glow

### Structure du conteneur desktop
```text
+----------------------------------------------------------+
|                     (espace vide ~1/8)                    |
|   +--------------------------------------------------+   |
|   |  [<] Barre progression [X]                       |   |
|   |                                                  |   |
|   |  Titre de la question                            |   |
|   |  Sous-titre                                      |   |
|   |                                                  |   |
|   |  [Options en grille 2 colonnes]                  |   |
|   |                                                  |   |
|   |  [ Continuer ]                                   |   |
|   +--------------------------------------------------+   |
|                     (espace vide ~1/8)                    |
+----------------------------------------------------------+
```

---

## 2. DailyCheckin.tsx -- Modale du check-in quotidien

### Remplacement des emojis
- **Sommeil** : Remplacer `["😫", "😕", "😐", "😊", "😴"]` par 5 niveaux visuels avec l'icone `Moon` (opacity/couleur progressive : rouge -> orange -> gris -> vert -> indigo)
- **Energie** : Remplacer `["🔋", "🪫", "⚡", "💪", "🚀"]` par l'icone `Lightning` avec une barre de remplissage animee (20% -> 100%)
- **Stress** : Remplacer `["😌", "🙂", "😐", "😰", "🤯"]` par l'icone `Brain` avec pulsation croissante
- **Humeur** : Remplacer les 5 emojis par des icones dans des cercles colores (vert -> jaune -> gris -> orange -> rouge)
- **Feedback supplements** : Remplacer `👍/😐/👎` par `ThumbsUp`, `Minus`, `ThumbsDown` avec couleurs

### Animations ajoutees
- **Changement de slider** : l'icone associee change de couleur/taille de maniere fluide selon la valeur
- **Selection humeur** : effet ripple + bordure animee
- **Transition entre etapes** : slide + deblur comme l'onboarding

---

## 3. DailyCheckinWidget.tsx -- Widget du dashboard

### Remplacement des emojis
- Remplacer `getValueDisplay()` : au lieu d'emojis, afficher une valeur numerique stylee (ex: "4/5") avec une barre de progression circulaire coloree
- Utiliser les memes icones Phosphor que la modale (Moon, Lightning, Brain)

---

## 4. SliderQuestion.tsx -- Composant slider reutilisable

- Remplacer la fonction `getEmoji()` par un indicateur visuel : cercle avec remplissage progressif et couleur dynamique
- Ajouter une animation de transition sur le changement de valeur

---

## 5. ChatWelcomeScreen.tsx -- Nettoyage emoji

- Remplacer le `👋` du greeting par rien ou une animation de main avec Phosphor `HandWaving`
- Remplacer le `🎯` du bouton onboarding par l'icone `Target` de Phosphor

---

## Fichiers modifies

| Fichier | Changements |
|---|---|
| `src/components/onboarding/OnboardingFlow.tsx` | Layout desktop 3/4, icones Phosphor, animations premium |
| `src/components/onboarding/SliderQuestion.tsx` | Indicateur visuel au lieu d'emojis |
| `src/components/dashboard/DailyCheckin.tsx` | Icones Phosphor, animations de slider |
| `src/components/dashboard/DailyCheckinWidget.tsx` | Valeurs numeriques stylisees, barres circulaires |
| `src/components/dashboard/chat/ChatWelcomeScreen.tsx` | Nettoyage emojis restants |

