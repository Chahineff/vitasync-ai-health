

## Améliorations proposées pour "Mes Analyses"

### A. Améliorations de Design

1. **Score de santé global (Health Score Hero Card)**
   - Ajouter en haut de la page un bandeau "hero" avec un score de santé synthétique (0-100) calculé à partir de la dernière analyse (nombre de valeurs normales vs anormales). Cercle de progression animé avec couleur dégradée (rouge → vert). Affiche aussi la date de la dernière analyse et un indicateur de tendance (↑↓) si plusieurs analyses existent.

2. **Timeline / historique visuel**
   - Remplacer la simple liste de fichiers (colonne gauche) par une timeline verticale avec des nœuds connectés par une ligne. Chaque nœud affiche la date, le nom du fichier, et un mini badge de statut. Donne une meilleure perception de l'historique médical dans le temps.

3. **Cartes de résumé rapide (stat cards)**
   - Au-dessus de la zone de détail, afficher 3 mini-cartes glassmorphism : "Valeurs anormales" (count, rouge), "Déficiences" (count, amber), "Compléments suggérés" (count, vert). Permet un aperçu instantané sans scroller.

4. **Badges de sévérité améliorés avec icônes**
   - Remplacer le simple "!" par des icônes de sévérité distinctes (flamme pour critique, triangle warning pour modéré, info pour léger) et ajouter des bordures colorées à gauche des cartes de valeurs anormales (style "accent border").

5. **Empty state plus engageant**
   - Ajouter une illustration/animation Lottie ou une icône animée dans l'état vide, avec un CTA plus visible et un texte expliquant les bénéfices de l'analyse IA.

### B. Améliorations Fonctionnelles

6. **Comparaison entre analyses**
   - Si l'utilisateur a 2+ analyses, proposer un bouton "Comparer" qui affiche un tableau côte à côte des valeurs anormales entre deux dates, avec des flèches indiquant l'évolution (amélioration / dégradation).

7. **Export PDF du rapport IA**
   - Bouton "Exporter le rapport" qui génère un PDF propre contenant le résumé IA, les valeurs anormales, les déficiences et les compléments suggérés, avec le branding VitaSync.

8. **Confirmation de suppression**
   - Actuellement `handleDelete` supprime directement sans confirmation. Ajouter un `AlertDialog` pour éviter les suppressions accidentelles.

9. **Polling automatique pendant l'analyse**
   - Quand une analyse est en status `pending`, poller la base toutes les 5 secondes pour détecter automatiquement quand l'analyse est terminée, au lieu de dépendre d'un refresh manuel.

10. **Localisation (i18n)**
    - Tous les textes de la section sont en français hardcodé. Les migrer vers le système `useTranslation` existant pour supporter les 6 langues du projet.

### C. Plan d'implémentation

**Fichiers impactés :**
- `src/components/dashboard/BloodTestSection.tsx` — Score hero, stat cards, timeline, confirmation suppression, polling, i18n
- `src/components/dashboard/BloodTestViewer.tsx` — Export PDF, badges améliorés
- `src/lib/i18n.ts` — Nouvelles clés de traduction
- Potentiellement un nouveau composant `BloodTestComparison.tsx` pour la comparaison

**Priorité suggérée :**
1. Confirmation de suppression + polling (quick wins, UX critique)
2. Stat cards + badges améliorés (impact visuel fort, effort modéré)
3. Score de santé hero card (feature phare)
4. Timeline historique (refonte visuelle de la sidebar)
5. Comparaison entre analyses (feature avancée)
6. Export PDF (nécessite une lib comme jsPDF ou une edge function)
7. i18n (systématique, à faire en dernier)

