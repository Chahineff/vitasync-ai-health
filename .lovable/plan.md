
# Plan d'ameliorations VitaSync - Multi-fonctionnalites

Ce plan couvre l'ensemble des ameliorations demandees, organisees en phases logiques.

---

## Phase 1 : Correctifs visuels Light Mode

**Probleme** : En mode clair, il n'y a pas assez de contraste entre les zones (chat, sidebar, input). Les classes comme `bg-white/5`, `border-white/10` sont pensees pour le dark mode et deviennent invisibles en light mode.

**Actions** :
- Ajouter des variantes light-aware sur les bordures et fonds dans `ChatInterface.tsx` (header, sidebar, input zone) : remplacer `border-white/5` par `border-border/50`, `bg-white/5` par `bg-muted/50 dark:bg-white/5`
- Appliquer le meme traitement aux composants : `ChatInput.tsx`, `ChatSidebar.tsx`, `ChatModelSelector.tsx`, `CartDrawer.tsx`, `ShopSection.tsx`, `ProductDetailMaster.tsx`, `BodyMapModal.tsx`
- Verifier les `ProductGroupCard`, `AIRecommendationsWidget` et autres composants shop
- Corriger les classes `glass-card` dans `index.css` pour avoir des valeurs light mode distinctes

---

## Phase 2 : Correction des recommandations IA boutique

**Probleme** : Les logs montrent `Shopify API error: 401` dans `ai-shop-recommendations`. Le token Admin API (`SHOPIFY_ACCESS_TOKEN`) retourne 401.

**Actions** :
- Verifier que le secret `SHOPIFY_ACCESS_TOKEN` est valide et a les permissions `read_products`
- Ajouter un mecanisme de fallback plus robuste : si le catalogue est vide, retourner une liste vide propre au lieu de crasher silencieusement
- Ajouter un message d'erreur visible cote client quand les recommandations echouent

---

## Phase 3 : Page "Mon Stack" - ameliorations UX

**Actions dans `NextDeliveryHero.tsx`** :
- Remplacer le bouton unique "Decouvrir nos formules" par deux boutons :
  1. "Creer ta formule avec le Coach IA" -> navigue vers l'onglet coach
  2. "Parcourir la boutique" -> navigue vers l'onglet shop
- Verifier que la banniere de connexion Shopify s'affiche correctement en plein ecran

**Actions dans `CoachingTierSelector.tsx`** :
- Remplacer le bouton "Mettre a niveau" par un etat "Temporairement indisponible" ou "En cours de creation" avec le bouton grise

---

## Phase 4 : Persistance du modele IA selectionne

**Probleme** : A chaque visite du Coach IA, le modele se remet sur VitaSync 3 Flash.

**Actions** :
- Sauvegarder le modele selectionne dans `localStorage` (cle `vitasync_selected_model`)
- Au chargement de `ChatInterface.tsx`, lire cette valeur au lieu d'utiliser `DEFAULT_MODEL`
- Mettre a jour le localStorage a chaque changement de modele

---

## Phase 5 : Animation "Reflexion en cours" conditionnelle

**Probleme** : L'animation de reflexion s'affiche pour tous les modeles, y compris 2.5 Flash qui est rapide.

**Actions** :
- Passer le `selectedModel` au composant `TypingIndicator`
- Si le modele est `google/gemini-2.5-flash-lite`, afficher un indicateur simple (3 dots) sans les phrases "Reflexion en cours"
- Si le modele est `google/gemini-3-flash-preview` ou `google/gemini-3-pro-preview`, conserver l'animation complete avec les phrases rotatives

---

## Phase 6 : Limites d'historique par modele

**Regle** :
- VitaSync 2.5 Flash : 7 jours max d'historique (conversations, check-ins, complements)
- VitaSync 3 Flash / 3 Pro : 90 jours max

**Actions** :
- Dans l'edge function `ai-coach/index.ts`, calculer la plage de dates en fonction du `modelVersion` recu dans le body
- Appliquer cette limite aux requetes de check-ins, supplement tracking, et messages de conversation
- Le nombre de messages transmis au modele reste limite pour des raisons de tokens, mais la fenetre temporelle change

---

## Phase 7 : Carte corporelle amelioree (Body Map)

**Etat actuel** : Silhouette SVG basique avec 20 zones predefinies par vue (face/dos).

**Actions** :
- Redesign complet de la silhouette SVG avec beaucoup plus de details anatomiques (muscles, articulations)
- Passer d'un systeme de zones predefinies a un systeme de "point clique" : l'utilisateur clique a un endroit precis et un point s'affiche
- Utiliser un algorithme de detection de zone basee sur les coordonnees du clic (hitbox mapping)
- Ajouter des couleurs et degradees pour un rendu plus realiste (peau, ombres)
- Augmenter le nombre de zones a 40+ (ajout : trapeze, deltoides, biceps, triceps, avant-bras, poignets, hanches detaillees, cheville, etc.)
- Garder le toggle Face/Dos

---

## Phase 8 : Page "Mes Analyses" (analyses sanguines)

**Nouvelle fonctionnalite majeure** :

**Base de donnees** :
- Creer une table `blood_test_analyses` : `id`, `user_id`, `file_url`, `file_name`, `analysis_text`, `suggested_supplements`, `created_at`, `analyzed_at`
- RLS : utilisateurs voient uniquement leurs propres analyses
- Storage : utiliser le bucket `vitasyncdata` pour stocker les PDFs

**Onboarding** :
- Ajouter une etape optionnelle dans `OnboardingFlow.tsx` (apres les questions existantes) : "As-tu des analyses sanguines recentes ?" avec upload de fichiers PDF

**Page Dashboard** :
- Ajouter un nouvel onglet "Mes Analyses" dans le Dashboard
- Layout : liste des PDFs a gauche, apercu PDF + analyse IA a droite
- L'analyse OCR sera effectuee par VitaSync 3 Flash via une edge function dediee `analyze-blood-test`

**Integration Coach IA** :
- Quand un utilisateur upload un PDF dans le chat, verifier si c'est une analyse sanguine
- Si oui, sauvegarder automatiquement dans `blood_test_analyses` et declencher l'analyse

**Edge Function `analyze-blood-test`** :
- Recoit le fichier PDF (URL du storage)
- Utilise Gemini 3 Flash pour OCR + analyse
- Retourne : defaillances detectees, valeurs anormales, complements suggeres
- Sauvegarde le resultat dans la table

---

## Phase 9 : Generation de graphiques par l'IA (3 Flash / 3 Pro uniquement)

**Actions** :
- Enrichir le systeme de rendu des messages IA pour supporter des blocs `chart` (ex: `[[CHART:bar:data]]`)
- Utiliser `recharts` (deja installe) pour rendre les graphiques inline dans le chat
- Types supportes : barres, lignes, camembert
- Le coach IA peut visualiser : tendances de check-ins, suivi de complements, comparaisons
- Conditionner cette capacite aux modeles 3 Flash et 3 Pro dans le prompt systeme

---

## Phase 10 : Sticky gallery sur la page produit (PDP)

**Etat actuel** : `lg:sticky lg:top-[100px] lg:self-start` est deja applique sur la galerie mais elle se decolle quand le contenu de droite est plus court.

**Actions** :
- S'assurer que la galerie reste sticky jusqu'a la fin de la section `grid` (avant QuickBenefitsStrip)
- Ajouter un `min-h` sur la colonne droite pour garantir que le sticky fonctionne sur toute la hauteur
- Quand on scrolle au-dela de la grille 50/50, l'image reste en place (arretee)

---

## Phase 11 : Checkout dans le meme onglet

**Etat actuel** : `window.open(checkoutUrl, '_blank')` ouvre un nouvel onglet.

**Actions** :
- Remplacer `window.open(checkoutUrl, '_blank')` par `window.location.href = checkoutUrl` dans :
  - `CartDrawer.tsx`
  - `MobileStickyCart.tsx` (si applicable)
  - `cartStore.ts` (si le checkout y est gere)

---

## Phase 12 : Connexion Shopify pour historique/adresse/paiement

**Verification** :
- `OrderHistory` utilise deja `shopify-customer-api` pour les commandes
- L'adresse de livraison est geree via `AddressModal`
- Le paiement redirige vers Shopify (politique existante)
- Verifier que ces composants fonctionnent correctement avec le token corrige

---

## Ordre d'implementation recommande

1. **Phase 1** (Light Mode) - Impact visuel immediat
2. **Phase 11** (Checkout meme onglet) - Fix rapide
3. **Phase 3** (Mon Stack UX) - Fix rapide
4. **Phase 4** (Persistance modele) - Fix rapide
5. **Phase 5** (Animation conditionnelle) - Fix rapide
6. **Phase 2** (Recommandations IA) - Debug API
7. **Phase 6** (Limites historique) - Logique backend
8. **Phase 10** (Sticky gallery) - CSS
9. **Phase 7** (Body Map) - Redesign important
10. **Phase 8** (Mes Analyses) - Feature majeure (DB + Storage + Edge Function + UI)
11. **Phase 9** (Graphiques IA) - Feature avancee
12. **Phase 12** (Verification Shopify) - Validation

---

## Details techniques

- **Fichiers principaux impactes** : ~25 fichiers
- **Nouvelles tables DB** : 1 (`blood_test_analyses`)
- **Nouvelles edge functions** : 1 (`analyze-blood-test`)
- **Nouveau composant page** : "Mes Analyses" dans le Dashboard
- **Modifications onboarding** : 1 nouvelle etape (upload PDF)

