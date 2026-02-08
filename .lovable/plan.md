

# Corrections : Suivi des complements + Bouton "Ajouter au suivi" du Coach IA

## Problemes identifies

### 1. Bouton "+" pas assez visible
Le bouton "+" est en haut a droite du tracker, petit et discret. L'utilisateur le souhaite en bas a droite, plus visible, style FAB (Floating Action Button).

### 2. Modale d'ajout : options de moment limitees
La modale `AddSupplementModal` ne propose que "Matin" et "Soir". Il manque "Midi" et "Heure specifique".

### 3. Bouton "Suivi" du Coach IA : time_of_day toujours "morning"
Dans `ProductRecommendationCard.tsx`, le bouton "Ajouter au suivi" force `time_of_day: 'morning'` sans possibilite de personnaliser. L'IA devrait pouvoir determiner le meilleur moment de prise selon le produit.

### 4. Le tracker ne gere que "morning" et "evening"
Le composant `SupplementTrackerEnhanced` filtre uniquement `morning` et `evening`. Les complements avec `noon` ou une heure specifique ne s'afficheraient pas.

---

## Solution

### A. Bouton "+" flottant en bas a droite

**Fichier : `src/components/dashboard/SupplementTrackerEnhanced.tsx`**

- Supprimer le petit bouton "+" du header
- Ajouter un FAB (Floating Action Button) en bas a droite du composant (position sticky/absolute), rond, avec icone "+", couleur primary
- Le FAB ouvre la meme modale `AddSupplementModal`

### B. Options de moment elargies dans la modale

**Fichier : `src/components/dashboard/AddSupplementModal.tsx`**

- Ajouter 4 options au lieu de 2 : **Matin**, **Midi**, **Soir**, **Heure specifique**
- Si "Heure specifique" est selectionne, afficher un champ de saisie d'heure (input type="time")
- Le `time_of_day` stocke sera : `morning`, `noon`, `evening`, ou `custom:HH:MM`

### C. Tracker : afficher les 3 groupes + heures specifiques

**Fichier : `src/components/dashboard/SupplementTrackerEnhanced.tsx`**

- Ajouter un groupe "Midi" (icone Soleil) entre Matin et Soir
- Ajouter un groupe "Heure specifique" pour les complements avec `time_of_day` commencant par `custom:`
- Afficher l'heure a cote du nom du complement pour les heures specifiques

### D. Coach IA : le bouton "Suivi" determine intelligemment le moment

**Fichier : `src/components/dashboard/ProductRecommendationCard.tsx`**

- Au lieu de forcer `time_of_day: 'morning'`, deduire le moment optimal en fonction du **type de produit** et de sa **description** :
  - Produits contenant "sleep", "sommeil", "melatonin", "relaxation", "night" -> `evening`
  - Produits contenant "pre-workout", "energy", "caffeine", "matin" -> `morning`
  - Produits contenant "lunch", "midi", "digestion" -> `noon`
  - Par defaut -> `morning`
- Cette logique sera une fonction utilitaire simple `inferTimeOfDay(title: string, description: string): string`

### E. Coach IA : l'IA peut suggerer le moment via le system prompt

**Fichier : `supabase/functions/ai-coach/index.ts`**

- Ajouter dans les instructions du system prompt que lorsqu'un produit est recommande, l'IA doit mentionner dans son texte le moment de prise ideal (matin, midi, soir)
- Pas besoin de tool calling supplementaire : la logique cote client (`inferTimeOfDay`) s'en chargera automatiquement

---

## Details techniques

### Fichiers modifies

1. **`src/components/dashboard/SupplementTrackerEnhanced.tsx`**
   - Suppression du bouton "+" du header
   - Ajout d'un FAB en bas a droite (position relative au conteneur)
   - Ajout des groupes "Midi" et "Heure specifique"

2. **`src/components/dashboard/AddSupplementModal.tsx`**
   - 4 options de moment : Matin / Midi / Soir / Heure specifique
   - Champ time picker conditionnel

3. **`src/components/dashboard/ProductRecommendationCard.tsx`**
   - Fonction `inferTimeOfDay()` pour deduire le moment de prise
   - Utilisation dans `handleAddToTracking`

### Aucun changement de schema de base de donnees
Le champ `time_of_day` est un `text` libre, il accepte deja n'importe quelle valeur.

