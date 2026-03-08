

# Mise à jour du tutoriel — Reflet fidèle du dashboard + écran d'introduction

## Contexte
Le dashboard a évolué avec de nouveaux widgets (HealthScoreWidget, WeeklyGoalsWidget, NotificationPanel, section Aide enrichie, Paramètres enrichis avec notifications/sécurité/complétion profil, LogoutConfirmModal). Le tutoriel doit refléter fidèlement ces changements et être précédé d'un écran d'accueil.

---

## 1. Écran d'introduction avant le tutoriel

**Fichier** : `DashboardTutorial.tsx`

Ajouter une phase `"intro"` avant la première étape. Écran plein écran glassmorphism avec :
- Logo VitaSync animé (float + halo, réutilise le pattern du ChatWelcomeScreen)
- Titre : "Bienvenue dans le tutoriel VitaSync"
- Sous-titre : "Découvrez votre dashboard en 7 étapes — moins d'une minute"
- Bouton "Commencer la visite" (gradient primary)
- Bouton secondaire "Passer" (texte discret)

L'intro s'affiche avant `currentStep = 0`. Un state `showIntro` contrôle l'affichage.

---

## 2. TutorialHomeDemo — Ajout HealthScoreWidget + WeeklyGoalsWidget

**Fichier** : `src/components/dashboard/tutorial/TutorialHomeDemo.tsx`

Le Home réel affiche maintenant dans cet ordre :
1. Greeting + date
2. **HealthScoreWidget** (anneau radial 0-100)
3. **WeeklyGoalsWidget** (barres de progression par objectif)
4. DailyCheckinWidget
5. QuickCoachWidget
6. SupplementTracker + Boutique (grid 2 cols)
7. MyStack + Analyses (grid 2 cols)

Le tutoriel actuel manque les items 2 et 3. Ajouter des répliques mockées :

- **Score Santé mock** : Anneau radial SVG animé, score = 78, label "Bon", tendance "+5 vs hier". Réutilise le même code SVG que `HealthScoreWidget` mais avec données statiques.
- **Objectifs Semaine mock** : 3 mini-cards (Énergie 72%, Sommeil 80%, Anti-stress 60%) avec barres de progression animées et badges tendance.

---

## 3. TutorialSettingsDemo — Ajout Notifications, Sécurité, Complétion

**Fichier** : `src/components/dashboard/tutorial/TutorialSettingsDemo.tsx`

Le Settings réel inclut maintenant : notifications (switches), changement de mot de passe, indicateur de complétion profil. Ajouter :

- **Section Complétion du profil** : Barre de progression mock à 80% avec 4/5 items complétés (avatar ✓, nom ✓, profil santé ✓, première analyse ✓, premier complément ✗)
- **Section Notifications** : 3 switches avec labels (Rappels compléments, Analyse prête, Résumé hebdomadaire) — auto-toggle animé comme le dark mode actuel
- **Section Sécurité** : Carte avec icône Lock, champs "Nouveau mot de passe" mockés (non interactifs), indicateur de force

---

## 4. Vérification des autres demos

Les demos Coach, Supplements, Shop, MyStack, Analyses sont déjà assez fidèles au dashboard réel — pas de changements majeurs nécessaires. Ajustements mineurs :

- **TutorialCoachDemo** : Le modèle affiché dans le header dit "VitaSync 3 Flash". Ajouter les nouveaux modèles OpenAI dans le dropdown mock (juste visuel, pas fonctionnel) pour refléter les 5 modèles disponibles.

---

## Fichiers impactés

| Fichier | Action |
|---|---|
| `src/components/dashboard/DashboardTutorial.tsx` | Modifier (ajout phase intro) |
| `src/components/dashboard/tutorial/TutorialHomeDemo.tsx` | Modifier (ajout HealthScore + WeeklyGoals mock) |
| `src/components/dashboard/tutorial/TutorialSettingsDemo.tsx` | Modifier (ajout notifications, sécurité, complétion) |
| `src/components/dashboard/tutorial/TutorialCoachDemo.tsx` | Modifier (ajout modèles dans dropdown mock) |

