

# Adaptation responsive mobile/tablette de la homepage + corrections UX

## Résumé

Adapter toutes les sections récentes de la homepage pour mobile et tablette, ajouter la navigation par clic dans la section Features, corriger la séparation visuelle entre Features et Pricing avec une nouvelle banderole, et afficher un mockup iPhone/tablette pour la preview du dashboard sur petits écrans.

---

## Plan d'implémentation

### 1. Masquer les DisplayCards sur mobile et tablette dans le Hero

Les cartes à survol ne fonctionnent pas sur tactile. On les cache sous `lg:` et on centre le texte Hero sur mobile/tablette.

**Fichier** : `src/components/sections/HeroSection.tsx`
- Le wrapper des DisplayCards passe de `w-full lg:w-[50%]` à `hidden lg:flex lg:w-[50%]`
- Le texte Hero passe de `w-full lg:w-[50%]` à `w-full lg:w-[50%] text-center lg:text-left` sur mobile
- Les boutons CTA sont centrés sur mobile (`items-center lg:items-start`)

### 2. Responsive de HowItWorksSection (Votre parcours)

Corriger la superposition de texte sur mobile et ajuster les tailles.

**Fichier** : `src/components/sections/HowItWorksSection.tsx`
- Réduire la taille du grand numéro sur mobile : `text-[5rem] md:text-[8rem] lg:text-[12rem]`
- Réduire les paddings internes sur mobile : `p-5 md:p-8 lg:p-14`
- Masquer le `ProgressIndicator` (points à droite) sur mobile (`hidden md:flex`)
- Réduire la hauteur de scroll sur mobile (`3 * 80vh` au lieu de `4 * 80vh` sur petit écran, ou garder la même mais ajuster)
- Le header (titre) passe à `top-16 md:top-24 lg:top-32` pour éviter la superposition avec la navbar

### 3. Ajouter une banderole entre Features et Pricing

Insérer un nouveau `MarqueeBanner` dans `Index.tsx` entre `FeaturesSection` et `PricingSection`.

**Fichier** : `src/pages/Index.tsx`
- Ajouter `<MarqueeBanner text="Your health needs VitaSync" />` entre Features et Pricing
- Déplacer le deuxième MarqueeBanner actuel (entre ProductPreview et Features) pour garder un slogan différent, par ex. "Smart supplements, real results"

### 4. Navigation par clic dans la section Features (FeatureSteps)

Permettre de cliquer sur les numéros/étapes pour naviguer directement à cette étape au lieu de devoir scroller.

**Fichier** : `src/components/ui/feature-steps.tsx`
- Ajouter un `onClick` handler sur chaque step item du panneau gauche
- Le clic calcule la position de scroll cible dans le `containerRef` et fait un `window.scrollTo({ behavior: 'smooth' })` vers l'étape correspondante
- Conserver le scroll naturel en parallèle

### 5. Dashboard Preview responsive : mockup iPhone sur mobile

Remplacer l'image desktop par un mockup mobile lorsque l'écran est petit.

**Fichier** : `src/components/sections/ProductPreviewSection.tsx`
- Utiliser `useIsMobile()` pour détecter l'écran
- Sur mobile : afficher l'image dans un cadre iPhone (div avec `rounded-[2.5rem] border-[8px] border-foreground/10` et ratio `aspect-[9/19.5]`)
- Sur tablette (md) : garder le format actuel mais réduire la hauteur
- Les images existantes restent les mêmes (l'image desktop sera objectFit "cover" dans le cadre iPhone, montrant la partie haute)

**Fichier** : `src/components/ui/container-scroll-animation.tsx`
- Adapter les hauteurs : `h-[40rem] md:h-[55rem] lg:h-[60rem]` pour le container
- Adapter la card interne : `h-[22rem] md:h-[30rem] lg:h-[40rem]`

### 6. FeatureSteps responsive

**Fichier** : `src/components/ui/feature-steps.tsx`
- Sur mobile, le layout passe en colonne (déjà `flex-col lg:flex-row`)
- Réduire la hauteur du preview area sur mobile : `aspect-[4/3]` déjà en place
- Réduire le `scrollHeight` sur mobile pour éviter un scroll trop long
- Masquer les previews widgets sur mobile si trop complexes, ou garder un aspect simplifié

### 7. Ajustements globaux de spacing et tailles

- **MarqueeBanner** : texte plus petit sur mobile (`text-base md:text-2xl lg:text-3xl`)
- **PricingSection** : les cards de pricing en `flex-col` sur mobile (probablement déjà fait)
- Vérifier les paddings de toutes les sections pour cohérence mobile

---

## Détails techniques

- ~7 fichiers modifiés, aucun fichier dashboard touché
- Utilisation de `useIsMobile()` depuis `src/hooks/use-mobile.tsx` pour la détection
- Les breakpoints suivent le système Tailwind existant : `sm:640px`, `md:768px`, `lg:1024px`
- Le mockup iPhone est purement CSS (border-radius + border), pas d'image de cadre externe

