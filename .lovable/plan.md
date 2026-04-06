

# Refonte de l'indicateur de progression de l'onboarding

## Probleme actuel
La progression est indiquee par un simple fond vert/bleu qui monte depuis le bas de l'ecran (`from-emerald-500/15`). C'est subtil et peu engageant visuellement.

## Nouvelle approche : "DNA Helix Progress"

Remplacer le fond uni par un systeme de progression visuel multi-couche, premium et immersif :

### 1. Barre de progression circulaire (coin superieur droit)
Un anneau SVG anime qui se remplit au fur et a mesure des etapes, avec le numero de l'etape au centre. Gradient anime de primary vers secondary.

### 2. Particules flottantes reactives
Des petites particules lumineuses (dots) qui apparaissent progressivement a chaque etape completee. Elles flottent doucement en arriere-plan avec un mouvement organique. Plus on avance, plus il y en a (densité proportionnelle à la progression).

### 3. Ligne de progression verticale laterale (gauche)
Une ligne fine verticale style "timeline" avec des noeuds (dots) pour chaque question. Le noeud actif pulse, les noeuds completes sont remplis avec un check, les futurs sont vides. Visible uniquement sur desktop.

### 4. Fond dynamique avec gradient qui evolue
Au lieu d'un simple remplissage vert, le fond change de teinte progressivement : debut = bleu sombre (primary), milieu = teal, fin = vert emeraude, avec un effet de particules/orbes qui s'intensifie.

### 5. Micro-animations de transition
A chaque changement d'etape, une onde circulaire (ripple) part du bouton "Continuer" et traverse l'ecran.

## Fichiers modifies

- **`src/components/onboarding/OnboardingFlow.tsx`** : Remplacer le div de progression de fond (lignes 854-859), ajouter l'anneau SVG, la timeline laterale, et les particules
- **`src/components/onboarding/ProgressRing.tsx`** (nouveau) : Composant anneau SVG anime
- **`src/components/onboarding/ProgressParticles.tsx`** (nouveau) : Systeme de particules flottantes reactif
- **`src/components/onboarding/StepTimeline.tsx`** (nouveau) : Timeline verticale desktop

## Aspect technique
- Animations via Framer Motion (deja installe)
- SVG pour l'anneau circulaire (pas de librairie supplementaire)
- Particules generees via un simple map avec positions aleatoires et animations CSS
- Responsive : timeline laterale masquee sur mobile, anneau visible partout

