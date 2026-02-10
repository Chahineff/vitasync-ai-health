

# Corrections du Suivi des Complements

## Probleme principal : le tracker demande de "Lancer le diagnostic" alors que l'utilisateur a deja des complements

### Cause racine
Dans `Dashboard.tsx`, la prop `showAwaitingState` est conditionnee par `hasInteractedWithCoach`, un simple `useState(false)` qui se reinitialise a chaque chargement de page. Resultat : **a chaque visite du dashboard, le tracker affiche "Lancer le diagnostic"** au lieu de la checklist, meme si l'utilisateur a deja des complements en base.

### Correction
Remplacer la logique `showAwaitingState={!hasInteractedWithCoach}` par une verification reelle : si l'utilisateur a au moins un supplement actif dans la table `supplement_tracking`, on affiche la checklist directement. L'etat "Awaiting" ne s'affiche que si **aucun** supplement n'est enregistre.

Pour cela, `SupplementTrackerEnhanced` n'a plus besoin des props `showAwaitingState` et `onStartDiagnostic` venant du parent. Il determinera lui-meme s'il doit afficher l'etat vide (0 supplements) ou la checklist, en se basant sur les donnees reelles du hook `useSupplementTracking`.

---

## Autres corrections

### 1. Donnees persistantes et reset a minuit
Le systeme actuel fonctionne deja correctement : les logs sont dans `supplement_logs` avec une date, et le hook filtre par "aujourd'hui". La checklist se reinitialise automatiquement a minuit car les logs du jour precedent ne correspondent plus au filtre. **Aucun changement necessaire** sur cette partie.

### 2. FAB avec animation au survol
Le bouton "+" actuel est positionne en `absolute bottom-5 right-5` dans le conteneur du tracker. Il sera modifie pour :
- Rester en position `fixed bottom-8 right-8` dans la section "supplements" (pas dans le home)
- Au survol, s'etendre en pilule avec le texte "Ajouter au suivi" via une animation CSS

### 3. Enregistrement automatique des non-prises (historique 30 jours)
Actuellement, seules les prises sont enregistrees (on cree un log quand on coche). Les "non-prises" sont implicites (absence de log). C'est suffisant pour les statistiques : si un jour n'a pas de log pour un supplement, c'est qu'il n'a pas ete pris. Les graphiques Semaine et Mois calculent deja les pourcentages de cette maniere. **Pas de changement de schema necessaire.**

---

## Details techniques

### Fichiers modifies

1. **`src/pages/Dashboard.tsx`**
   - Section "home" : remplacer `showAwaitingState={!hasInteractedWithCoach}` par `showAwaitingState={false}` (le tracker gere son etat vide lui-meme)
   - Section "supplements" : meme chose, supprimer `showAwaitingState` et `onStartDiagnostic`

2. **`src/components/dashboard/SupplementTrackerEnhanced.tsx`**
   - Supprimer les props `showAwaitingState` et `onStartDiagnostic` (plus de dependance sur l'etat "coach")
   - Supprimer le bloc conditionnel `if (showAwaitingState && onStartDiagnostic)` qui retournait `AwaitingAnalysis`
   - L'etat vide (0 supplements) est deja gere dans le composant avec le message "Aucun complement ajoute" et le bouton "Ajouter un complement"
   - Modifier le FAB : au survol, transition de rond a pilule avec texte "Ajouter au suivi" (animation width + opacite du texte)

### Aucun changement de schema de base de donnees requis
