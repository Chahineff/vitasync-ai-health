
# Ameliorations Coach IA VitaSync - Plan complet

## Vue d'ensemble

7 modifications majeures pour pousser le Coach IA au niveau superieur : correction du logo qui tourne, animation de typing progressive, 4 questions dans les pre-prompts, profil de sante injecte dans l'IA, creation de quiz par l'IA (VitaSync 2.0 uniquement), selecteur de langue pour la dictee vocale, et amelioration du formatage des reponses IA.

---

## 1. Correction du logo qui tourne pendant le streaming

**Fichier** : `src/components/dashboard/chat/ChatMessageBubble.tsx`

Le logo VitaSync dans l'avatar IA fait actuellement une rotation 360deg pendant le streaming (lignes 158-169). Remplacement par un effet de "glow pulsant" (scale + boxShadow) sans rotation pour que le logo reste droit.

- Supprimer `rotate: [0, 360]` de l'animation
- Conserver uniquement le `boxShadow` pulsant + un leger `scale: [1, 1.05, 1]`

---

## 2. Animation de typing progressive (reveal progressif)

**Fichier** : `src/components/dashboard/chat/ChatMessageBubble.tsx`

Actuellement, le bloc de reponse IA s'affiche d'un coup (le SSE met a jour le contenu mais visuellement c'est brut). Ajout d'un effet de "reveal" progressif :

- Envelopper le contenu de `MessageContent` dans un `motion.div` avec une animation `opacity: 0 -> 1` a chaque mise a jour du contenu
- Ajouter un masque CSS gradient en bas du message pendant le streaming : un degradee `from-transparent to-background` qui donne l'illusion que le texte "apparait" progressivement
- Le masque disparait une fois le streaming termine (`isStreaming === false`)

---

## 3. Passer de 2 a 4 questions dans les pre-prompts guides

**Fichier** : `src/components/dashboard/GuidedSuggestionCards.tsx`

Chaque carte (Energie, Sommeil, Stress, Nutrition) a actuellement 2 questions. Ajout de 2 questions supplementaires par categorie :

### Energie (2 nouvelles) :
- Q3 : "Pratiquez-vous une activite physique reguliere ?" (Quotidien / 3-4x semaine / Rarement / Jamais)
- Q4 : "Avez-vous des carences connues ?" (Fer / Vitamine D / Vitamine B12 / Non, pas a ma connaissance)

### Sommeil (2 nouvelles) :
- Q3 : "Utilisez-vous des ecrans avant de dormir ?" (Oui, constamment / Parfois / Rarement / Non)
- Q4 : "A quelle heure vous couchez-vous en general ?" (Avant 22h / 22h-23h / 23h-00h / Apres minuit)

### Stress (2 nouvelles) :
- Q3 : "Pratiquez-vous des techniques de relaxation ?" (Meditation / Sport / Respiration / Aucune)
- Q4 : "Votre alimentation est-elle equilibree ?" (Tres equilibree / Plutot bien / Ameliorable / Pas du tout)

### Nutrition (2 nouvelles) :
- Q3 : "Combien de repas prenez-vous par jour ?" (2 repas / 3 repas / 4+ repas / Irregulier)
- Q4 : "Avez-vous des intolérances alimentaires ?" (Gluten / Lactose / Noix / Aucune)

Mise a jour du badge "3 etapes" en "5 etapes" (4 questions + 1 recommandation).
Mise a jour du `totalSteps` et de `getRecommendation` pour integrer les 4 reponses dans le prompt genere.

---

## 4. Ne plus proposer directement des complements dans les pre-prompts

**Fichier** : `src/components/dashboard/GuidedSuggestionCards.tsx`

Modifier les fonctions `getRecommendation` de chaque carte pour ne plus terminer par "Quels complements me conseilles-tu ?" mais plutot par une demande de conseils ouverte :

- Energie : "Quels sont tes conseils pour ameliorer mon energie au quotidien ?"
- Sommeil : "Que me recommandes-tu pour ameliorer mon sommeil naturellement ?"
- Stress : "Quelles strategies me proposes-tu pour mieux gerer mon stress ?"
- Nutrition : "Quels conseils nutritionnels personnalises me donnes-tu ?"

Cela evite que l'IA saute directement a la recommandation de produits.

---

## 5. Selecteur de langue pour la dictee vocale

**Fichier** : `src/components/dashboard/chat/ChatInput.tsx`

Ajout d'un dropdown/popover a cote du bouton micro pour choisir la langue de reconnaissance vocale.

Langues disponibles :
- Francais (fr-FR) - defaut
- Anglais (en-US)
- Espagnol (es-ES)
- Arabe (ar-SA)
- Mandarin (zh-CN)
- Allemand (de-DE)
- Portugais (pt-BR)
- Italien (it-IT)
- Japonais (ja-JP)
- Coreen (ko-KR)
- Hindi (hi-IN)
- Russe (ru-RU)

Implementation :
- `useState<string>('fr-FR')` pour la langue selectionnee
- Un petit bouton drapeau/globe a cote du micro qui ouvre un popover avec la liste des langues
- La langue choisie est passee a `useSpeechToText` via un nouveau parametre `lang`

**Fichier** : `src/hooks/useSpeechToText.tsx`

- Ajouter un parametre `lang?: string` a la function `useSpeechToText`
- Utiliser `recognition.lang = lang || 'fr-FR'` au lieu du hardcode `'fr-FR'` (ligne 149)
- Pour ElevenLabs fallback, mapper le code langue vers le code ISO correspondant

---

## 6. Quiz genere par l'IA (VitaSync 2.0 uniquement)

### 6a. Composant Quiz dans le chat

**Nouveau fichier** : `src/components/dashboard/chat/ChatQuizBlock.tsx`

Un composant qui rend un quiz interactif inline dans le chat quand l'IA genere un bloc `[[QUIZ_START]]...[[QUIZ_END]]`. Le quiz affiche :
- Un titre et une description
- 10 questions avec 4 options chacune
- Un bouton "Terminer le quiz" qui envoie les reponses comme message utilisateur
- Design glassmorphism coherent avec le reste

### 6b. Parsing du quiz

**Fichier** : `src/components/dashboard/ProductRecommendationCard.tsx` (ou nouveau utilitaire)

Ajouter le parsing du format quiz :
```
[[QUIZ_START]]
TITLE: Mon Quiz Personnalise
Q1: Question texte ? | Option A | Option B | Option C | Option D
Q2: ...
[[QUIZ_END]]
```

### 6c. Instructions dans le system prompt

**Fichier** : `supabase/functions/ai-coach/index.ts`

Ajouter un nouveau playbook dans le system prompt :

```
PLAYBOOK QUIZ PERSONNALISE (VitaSync 2.0 uniquement)
- Tu peux creer un quiz de 10 questions pour approfondir un sujet
- Format OBLIGATOIRE : [[QUIZ_START]] ... [[QUIZ_END]]
- Maximum 10 questions, 4 options par question
- Utilise un quiz quand l'utilisateur a besoin d'un diagnostic plus pousse
- Exemples de quiz : "Quiz Energie", "Quiz Sommeil", "Quiz Stress"
```

### 6d. Restriction VitaSync 2.0

**Fichier** : `src/components/dashboard/ChatInterface.tsx`

- Passer `selectedModel.version` dans le body du fetch vers l'edge function
- Dans l'edge function, ne generer des quiz que si le modele est version 2.0

---

## 7. Amelioration du formatage des reponses IA

**Fichier** : `supabase/functions/ai-coach/index.ts`

Ajouter dans le system prompt une section de formatage :

```
STYLE DE FORMATAGE (OBLIGATOIRE)
- Utilise des emojis pour rendre les reponses visuelles (ex: "energie", "sommeil", etc.)
- Structure tes reponses avec des titres Markdown (## et ###)
- Utilise des listes a puces pour les points cles
- Mets en **gras** les informations importantes
- Utilise des separateurs (---) entre les sections
- Ne fais PAS de blocs de texte monotones
- Limite tes recommandations a MAXIMUM 2 produits par reponse
- Varie la taille des titres pour la hierarchie visuelle
```

Ajout de la regle "maximum 2 produits par reponse" dans la section LOGIQUE PRODUITS.

---

## 8. Profil de sante deja envoye a l'IA

Le profil de sante est **deja integre** dans le system prompt (lignes 575-612 de l'edge function). Les donnees du questionnaire d'onboarding (objectifs, allergies, budget, activite, sommeil, stress, alimentation, etc.) sont injectees dans la section "PROFIL UTILISATEUR ACTUEL". Aucune modification necessaire ici - le systeme fonctionne deja correctement.

---

## Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/components/dashboard/chat/ChatMessageBubble.tsx` | Correction logo (pas de rotation), masque gradient pendant streaming |
| `src/components/dashboard/GuidedSuggestionCards.tsx` | 4 questions par carte, badge "5 etapes", prompts ouverts (sans "quels complements") |
| `src/components/dashboard/chat/ChatInput.tsx` | Selecteur de langue dictee vocale (12 langues) |
| `src/hooks/useSpeechToText.tsx` | Parametre `lang` dynamique |
| `src/components/dashboard/chat/ChatQuizBlock.tsx` | Nouveau composant quiz interactif inline |
| `src/components/dashboard/chat/ChatMessageBubble.tsx` | Parsing et rendu du bloc quiz |
| `supabase/functions/ai-coach/index.ts` | Playbook quiz, formatage enrichi (emojis, titres, gras), max 2 produits |
| `src/components/dashboard/ChatInterface.tsx` | Passer version du modele a l'edge function |

## Principes respectes

- Animations GPU-accelerees (transform + opacity)
- Design Bio-Tech Luxury preserve
- Aucune nouvelle dependance
- Compatibilite avec le systeme de modeles existant (1.0 / 2.0)
- Securite : quiz uniquement cote IA, pas d'injection utilisateur
