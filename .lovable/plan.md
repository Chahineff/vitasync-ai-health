
# Animations Premium Enrichies pour le Dashboard VitaSync

## Vue d'ensemble

Plan d'animations enrichi couvrant l'ensemble du dashboard avec des micro-interactions, des transitions cinematiques et des effets visuels avances. Toutes les animations sont GPU-accelerees (transform + opacity) et respectent le design "Bio-Tech Luxury".

---

## 1. Nouvelles Keyframes CSS (src/index.css + tailwind.config.ts)

Ajout de 8 nouvelles keyframes reutilisables :

- **shimmer-bar** : Bande lumineuse qui traverse un element horizontalement (barre de progression)
- **scan-line** : Point cyan lumineux traversant une ligne de gauche a droite en boucle (typing indicator)
- **success-burst** : Scale 1 -> 1.3 -> 1 avec flash vert (cochage supplement)
- **cursor-blink** : Clignotement du curseur de streaming (opacity 0/1 toutes les 530ms)
- **ripple** : Onde circulaire qui s'etend et disparait au clic (boutons)
- **card-shine** : Reflet lumineux diagonal qui traverse une carte (hover sur les product cards)
- **bounce-in** : Entree elastique scale 0 -> 1.1 -> 1 (badges, notifications)
- **breathe** : Pulsation douce d'opacite 0.4 -> 1 -> 0.4 (indicateurs "en ligne", dots)

Enregistrement de chaque keyframe comme classe utilitaire Tailwind (`animate-shimmer-bar`, `animate-cursor-blink`, `animate-ripple`, `animate-card-shine`, `animate-bounce-in`, `animate-breathe`).

---

## 2. Coach IA - Animations de Streaming et Typing

### TypingIndicator.tsx - Refonte complete

- **Logo pulsant organique** : Le logo VitaSync oscille en scale entre 0.9 et 1.1 avec un halo cyan qui respire (au lieu d'un simple boxShadow statique).
- **Textes rotatifs** : Alterner entre 4 phrases de chargement ("Analyse en cours...", "Consultation des donnees...", "Preparation de la reponse...", "Reflexion en cours...") avec un crossfade (opacity 0 -> 1 -> 0) toutes les 2.5 secondes via un useState + setInterval.
- **Barre scan-line** : Remplacer la barre de gradient statique par l'animation `scan-line` - un point lumineux cyan qui traverse la barre de gauche a droite en 1.5s en boucle.
- **Particules flottantes** : Ajouter 3 petits cercles (2px) autour du logo qui orbitent lentement (rotation 360deg en 4s chacun avec delais decales).

### ChatMessageBubble.tsx - Entrees directionnelles + Curseur streaming

- **Messages utilisateur** : Changer `initial` de `{ opacity: 0, y: 15 }` a `{ opacity: 0, x: 30, scale: 0.95, filter: "blur(4px)" }` pour un slide-in depuis la droite avec deblur.
- **Messages IA** : Changer `initial` a `{ opacity: 0, x: -30, scale: 0.95, filter: "blur(4px)" }` pour un slide-in depuis la gauche avec deblur.
- **Curseur de streaming** : Pendant `isStreaming`, ajouter un `<span>` clignotant ("|") apres le contenu avec la classe `animate-cursor-blink`. Ce span disparait des que `isStreaming` passe a false.
- **Avatar IA pendant streaming** : Ajouter une rotation lente du logo (0 -> 360deg en 3s) en plus du glow existant.
- **Boutons d'action** : Ajouter un stagger de 80ms entre chaque bouton (Copy, TTS, Regenerate) avec un effet slide-up + fade.
- **Effet de copie reussi** : Quand "Copie !" s'affiche, ajouter un scale bounce (1 -> 1.2 -> 1) sur l'icone Check.

### ChatWelcomeScreen.tsx - Entrees en cascade

- **Suggestion cards stagger** : Augmenter le delai entre les 4 cartes de suggestion de 100ms a 150ms, et ajouter un effet de scale (0.8 -> 1) + blur (8px -> 0) en plus du slide-up existant.
- **Logo d'accueil** : Ajouter un effet de "float" continu (translateY oscillant de 0 a -8px) une fois le logo apparu.
- **Texte "Comment puis-je t'aider"** : Appliquer l'animation `text-shimmer` existante sur le gradient-text pour un effet scintillant permanent.

### ChatInput.tsx - Micro-interactions enrichies

- **Bouton Send** : Ajouter un effet de "launch" lors de l'envoi : rotation de l'avion de 0 a -45deg + scale 0.8 pendant 200ms, puis retour. Utiliser framer-motion `animate` conditionnel.
- **Focus ring pulse** : Quand le textarea est focus, la bordure gradient fait un pulse continu (opacite 0.3 -> 0.7 -> 0.3) au lieu d'un simple static.
- **Compteur de caracteres** : Ajouter une animation de couleur progressive (vert -> orange -> rouge) quand on approche de la limite, avec un scale bounce a 90% de la limite.

---

## 3. Supplements - Animations de Suivi

### SupplementTrackerEnhanced.tsx

- **Success burst au cochage** : Quand un supplement est marque comme pris, le checkbox fait un scale bounce (1 -> 1.4 -> 1) avec un flash vert (background-color transition). La ligne entiere fait un subtil pulse lumineux.
- **Shimmer sur la barre de progression** : Ajouter la classe `animate-shimmer-bar` sur la barre quand elle n'est pas a 100%. A 100%, declencher un pulse vert celebratoire + un effet de particules (3 petits cercles verts qui s'elevent et disparaissent via framer-motion).
- **Stagger sur la checklist** : Chaque item de supplement apparait en sequence avec un delai de 60ms (opacity 0 + translateX: -20px -> 0) au lieu d'un affichage instantane.
- **Transition entre onglets Jour/Semaine/Mois** : Remplacer le slide vertical (`y: 10`) par un slide horizontal directionnel. Jour -> Semaine = slide-left (x: 30 -> 0), Semaine -> Jour = slide-right (x: -30 -> 0). Stocker le tab precedent pour determiner la direction.
- **FAB (bouton +)** : Ajouter un effet de pulsation continue sur le FAB quand la liste est vide (pour attirer l'attention) et un rotate 45deg -> 0deg quand il apparait.
- **Icone de suppression** : Quand le bouton X apparait au hover, ajouter un fade-in + scale (0.5 -> 1) au lieu du simple opacity.

---

## 4. Shop - Animations de Grille et Produits

### ProductGroupCard.tsx

- **Hover enrichi** : Ajouter un effet `card-shine` (reflet diagonal lumineux) qui traverse la carte au hover, en plus du `y: -4` existant.
- **Image hover** : Ajouter un leger filtre brightness (1 -> 1.1) au hover en plus du scale existant.
- **Crossfade saveur ameliore** : Lors du changement de saveur, l'image fait un crossfade avec un leger scale (0.95 -> 1) + blur (4px -> 0) au lieu du simple opacity 0.8 -> 1.
- **Badge "IA Recommended"** : Ajouter l'animation `bounce-in` quand le badge apparait, puis un subtil pulse continu.
- **Bouton "Ajouter au panier"** : Apres ajout reussi, l'icone Check fait un scale bounce (0 -> 1.3 -> 1) + rotation 360deg.

### ShopSection.tsx

- **Stagger de la grille** : Augmenter le delai entre les cartes de 30ms a 70ms pour un effet cascade plus cinematique.
- **Transition de pagination** : Lors du changement de page, la grille entiere fait un fade-out (opacity 1 -> 0, y: 0 -> -15) puis fade-in (opacity 0 -> 1, y: 15 -> 0) avec un `AnimatePresence mode="wait"` sur le conteneur pagine.
- **Loading spinner enrichi** : Remplacer le simple SpinnerGap par un trio de dots pulsants avec stagger (style "loading" moderne).

---

## 5. Home - Animations des Widgets

### Dashboard.tsx (DashboardHome)

- **Transition entre sections amelioree** : Remplacer `{ opacity: 0, y: 10 }` par `{ opacity: 0, scale: 0.97, filter: "blur(6px)" }` sur toutes les motion.div de section. L'entree combine un deblur + scale-up pour un effet "apparition" premium.
- **Titre de bienvenue** : Ajouter un effet typewriter sur le prenom : chaque lettre apparait avec un delai de 30ms (via un map sur les caracteres avec des spans animes individuellement).
- **Widgets stagger** : DailyCheckinWidget, QuickCoachWidget, SupplementTracker et ProgressChart apparaissent en cascade avec 120ms de delai entre chaque, avec un effet slide-up + deblur.

### DailyCheckinWidget.tsx

- **MetricCards stagger** : Les 3 cartes de metriques (Sommeil, Energie, Stress) apparaissent en stagger (80ms) avec un scale-in (0.8 -> 1) + fade.
- **Valeurs emoji** : L'emoji de valeur fait un bounce-in (scale 0 -> 1.2 -> 1) quand il apparait.
- **Trend arrows** : Les fleches de tendance font un slide-in depuis la direction correspondante (TrendUp = slide depuis le bas, TrendDown = slide depuis le haut).

### QuickCoachWidget.tsx

- **Logo VitaSync float** : Le logo dans le widget fait un float continu (translateY: 0 -> -6px -> 0 en 3s) pour donner une impression de "vivant".
- **Dot "pret"** : Le dot vert "Coach IA pret" utilise l'animation `breathe` au lieu du simple `animate-pulse` pour un effet plus doux et organique.
- **Bouton "Parler au Coach"** : Au hover, la fleche ArrowRight fait un translateX de 0 -> 4px pour indiquer l'action.

### ProgressChart.tsx

- **Barres hebdomadaires** : Augmenter le stagger entre les barres de 50ms a 80ms et ajouter un effet de "liquid fill" (les barres se remplissent de bas en haut avec un leger rebond elastique a la fin via `type: "spring", bounce: 0.3`).
- **Donut chart** : Ajouter une rotation initiale de -90deg -> 0deg sur le PieChart pour un effet d'apparition en arc.
- **Pourcentage central** : Le chiffre "78%" fait un count-up anime de 0 a 78 en 1s avec un easing ease-out.

---

## 6. Bottom Navigation - Micro-interactions

### MobileBottomNav.tsx

- **Indicateur actif** : L'indicateur actif (layoutId) fait un leger bounce a l'arrivee via `transition: { type: "spring", bounce: 0.25, duration: 0.5 }` (actuellement 0.2).
- **Icone active** : L'icone de l'onglet actif fait un scale bounce (1 -> 1.15 -> 1) lors de la selection, avec une petite "onde" circulaire (ripple) derriere.
- **Label** : Le label de l'onglet actif fait un fade-in + slide-up (y: 4 -> 0) lors de l'activation.

---

## Fichiers modifies

| Fichier | Modifications |
|---|---|
| `src/index.css` | 8 nouveaux @keyframes (shimmer-bar, scan-line, success-burst, cursor-blink, ripple, card-shine, bounce-in, breathe) |
| `tailwind.config.ts` | Enregistrement des 8 nouvelles animations comme classes utilitaires |
| `src/components/dashboard/TypingIndicator.tsx` | Textes rotatifs, scan-line, particules orbitales, pulsation organique |
| `src/components/dashboard/chat/ChatMessageBubble.tsx` | Slide-in directionnel + deblur, curseur streaming, boutons stagger, bounce sur copie |
| `src/components/dashboard/chat/ChatWelcomeScreen.tsx` | Stagger 150ms sur cartes, logo float, shimmer sur texte hero |
| `src/components/dashboard/chat/ChatInput.tsx` | Send "launch" effect, focus pulse, compteur progressif |
| `src/components/dashboard/SupplementTrackerEnhanced.tsx` | Success burst, shimmer barre, stagger items, slide horizontal tabs, FAB pulse, X fade-scale |
| `src/components/dashboard/shop/ProductGroupCard.tsx` | Card-shine hover, brightness image, crossfade blur, badge bounce-in, cart bounce |
| `src/components/dashboard/ShopSection.tsx` | Stagger 70ms, pagination fade-slide, loading dots |
| `src/pages/Dashboard.tsx` | Transition deblur + scale entre sections, titre typewriter, widgets stagger |
| `src/components/dashboard/DailyCheckinWidget.tsx` | MetricCards stagger, emoji bounce-in, trend slide directionnel |
| `src/components/dashboard/QuickCoachWidget.tsx` | Logo float, dot breathe, fleche hover translateX |
| `src/components/dashboard/ProgressChart.tsx` | Barres spring, donut rotation, count-up pourcentage |
| `src/components/dashboard/MobileBottomNav.tsx` | Bounce indicateur, icone scale + ripple, label slide-up |

## Principes respectes

- Toutes les animations utilisent `transform`, `opacity` et `filter` (GPU-accelerees)
- Durees entre 150ms et 600ms pour rester reactif
- framer-motion pour les animations complexes, CSS keyframes pour les boucles infinies
- Respect de `prefers-reduced-motion` nativement via framer-motion
- Aucune nouvelle dependance
- Design Bio-Tech Luxury preserve (glassmorphism, rounded-3xl, accents cyan/teal)
