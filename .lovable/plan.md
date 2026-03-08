

# Ameliorations du Suivi des Complements

## 1. Streak Counter & Motivation Badge
Ajouter un compteur de serie (streak) visible en haut du tracker : "🔥 12 jours consecutifs". Quand l'utilisateur complete 100% de ses complements, afficher une animation de celebration (confetti ou pulse dore). Calcule a partir des `supplement_logs` — nombre de jours consecutifs ou tous les complements ont ete pris.

**Fichier** : `SupplementTrackerEnhanced.tsx` (nouveau bloc sous la progress bar), `useSupplementTracking.tsx` (nouveau calcul `streakDays`)

## 2. Barre de Progression Circulaire (Radial)
Remplacer la barre horizontale par un **anneau radial SVG** anime qui montre le pourcentage du jour. Plus visuel, plus premium, avec le chiffre `3/5` au centre. L'anneau se remplit avec un gradient et un effet glow quand 100%.

**Fichier** : `SupplementTrackerEnhanced.tsx` (remplacer la div progress bar par un composant SVG radial)

## 3. Micro-interactions ameliorees sur le check
Quand l'utilisateur coche un complement : ajouter un petit burst de particules (3-4 cercles colores qui disparaissent) autour de la checkbox, et un haptic-style scale bounce plus prononce. Quand tous sont coches → confetti full-width.

**Fichier** : `SupplementTrackerEnhanced.tsx` (SupplementItem + composant Confetti existant)

## 4. Rappel visuel "Prochain creneau"
Sous la progress bar, afficher un mini-badge contextuel : "Prochain : Midi — Omega-3, Zinc" base sur l'heure actuelle et les complements non-pris du prochain creneau. Guide l'utilisateur sans effort.

**Fichier** : `SupplementTrackerEnhanced.tsx` (nouveau bloc conditionnel base sur `new Date().getHours()`)

## 5. Empty State Anime
Remplacer l'empty state statique par une illustration animee (icone Pill qui flotte avec un effet pulse + texte engageant "Construis ton stack ideal") avec un CTA plus visible.

**Fichier** : `SupplementTrackerEnhanced.tsx` (section empty state)

## 6. Swipe-to-complete (mobile)
Sur mobile, permettre un swipe droite sur un complement pour le marquer comme pris (feedback visuel vert), et swipe gauche pour ouvrir les options (supprimer). Utilise `framer-motion` drag gestures.

**Fichier** : `SupplementTrackerEnhanced.tsx` (SupplementItem — `drag` prop de framer-motion)

## Plan d'implementation

**Priorite suggeree :**
1. Anneau radial + streak counter (impact visuel immediat)
2. Rappel "Prochain creneau" (utilite fonctionnelle)
3. Micro-interactions check + confetti 100% (engagement)
4. Empty state anime (polish)
5. Swipe mobile (UX mobile)

**Fichiers impactes :**
- `src/components/dashboard/SupplementTrackerEnhanced.tsx` — Tous les changements UI
- `src/hooks/useSupplementTracking.tsx` — Calcul streak
- `src/components/ui/Confetti.tsx` — Reutilise pour celebration 100%

