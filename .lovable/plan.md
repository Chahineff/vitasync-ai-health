
# Plan : Tutoriel Dashboard - Replique fidele du vrai dashboard

## Objectif

Reecrire entierement `DashboardTutorial.tsx` pour que le tutoriel soit une replique quasi copier-coller du vrai dashboard VitaSync. L'utilisateur voit exactement le meme layout (sidebar flottante, header, contenu principal) mais avec `pointer-events-none` sur tout sauf les boutons de controle du tutoriel (Passer / Suivant). Le curseur anime navigue entre les sections et le contenu change automatiquement.

## Approche : Repliques visuelles des vrais composants

Plutot que d'importer les vrais composants (qui declenchent des hooks Supabase, Shopify, etc.), on cree des sous-composants internes qui reprennent **exactement** le meme JSX et les memes classes CSS, mais avec des donnees statiques en dur.

## Composants repliques

### 1. Sidebar (copie de Dashboard.tsx lignes 145-220)
- Logo VitaSync + "VitaSync" avec meme style `glass-sidebar-floating`
- Menu items identiques : Accueil (House), Coach IA (VitaSyncIcon), Supplements (FirstAidKit), Boutique (Storefront)
- Section "General" : Parametres (Gear), Aide (Question)
- Carte "Application mobile" avec bouton "Bientot" desactive
- Profil utilisateur en bas (avatar placeholder + "User" + "Plan Gratuit")
- Indicateur actif : meme style `bg-primary/10 text-primary border border-primary/20`

### 2. Contenu par etape

**Etape 1 - Accueil** : Replique du `DashboardHome`
- Header "Bonjour User, pret pour ta routine ?"
- `DailyCheckinWidget` replique : carte `glass-card-premium rounded-3xl p-6` avec titre "Mon suivi du jour", 3 MetricCards (Sommeil 4/5, Energie 3/5, Stress 2/5) avec cercles de progression SVG
- `QuickCoachWidget` replique : carte glassmorphism avec logo VitaSync anime, titre "Coach IA Personnel", bouton "Parler au Coach"
- Grille 2 colonnes : `SupplementTrackerEnhanced` (avec items Creatine/Magnesium/Omega-3 et checkbox animees) + `ProgressChart` (donut 78% + barres hebdomadaires)

**Etape 2 - Coach IA** : Replique du `ChatInterface`
- Layout `flex h-[calc(100vh-2rem)] rounded-3xl border border-white/10`
- Sidebar de conversations (2-3 fausses conversations)
- Header avec selecteur de modele "VitaSync 3 Flash"
- Zone de messages : bulles de conversation animees (utilisateur + assistant avec avatar VitaSync)
- Barre de saisie en bas avec gradient `from-background`

**Etape 3 - Supplements** : Replique de la section supplements
- Titre "Supplements"
- Grille 3/5 + 2/5 : SupplementTrackerEnhanced (tabs Jour/Semaine/Mois, barre de progression, groupes Matin/Soir avec items cochables animes automatiquement) + carte "Analyse IA"

**Etape 4 - Boutique** : Replique du `ShopSection`
- Header avec icone panier et compteur
- Barre de filtres (categories)
- Grille de 4-6 cartes produits avec images placeholder, prix, boutons "Ajouter"

**Etape 5 - Parametres** : Replique du `ProfileSection`
- Titre "Parametres"
- ThemeToggle replique (switch anime automatiquement)
- Selecteur de langue (boutons FR/EN/ES)
- Carte "Profil de sante" avec badges objectifs
- Formulaire nom/prenom (champs pre-remplis)

### 3. Curseur anime
- Meme systeme SVG avec ripple au clic
- Se deplace vers l'element sidebar correspondant avant chaque transition
- Positions calculees via `refs` sur les boutons sidebar

### 4. Bulle explicative
- Overlay flottant en glassmorphism positionne en bas a droite du contenu
- Texte court avec icone VitaSync
- Animation slide + deblur a chaque etape

### 5. Controles utilisateur
- Bouton "Passer" en haut a droite (toujours visible, `z-[70]`)
- Bouton "Suivant" / "C'est parti !" en bas
- 5 points de progression
- Auto-avance apres 6 secondes

### 6. Mobile
- Sidebar remplacee par bottom nav identique a `MobileBottomNav` (avec `layoutId` indicator)
- Contenu adapte en colonnes simples

## Fichier concerne

| Fichier | Action |
|---|---|
| `src/components/dashboard/DashboardTutorial.tsx` | Reecriture complete |

## Details techniques

- Classes CSS identiques au vrai dashboard : `glass-card-premium`, `glass-sidebar-floating`, `rounded-3xl`, `border border-white/10`, `backdrop-blur-xl`
- Icones Phosphor identiques avec meme `weight="light"` ou `weight="duotone"`
- Donnees statiques (aucun hook Supabase/Shopify)
- `pointer-events-none` sur tout le faux dashboard
- `pointer-events-auto` uniquement sur les boutons Passer/Suivant
- Overlay `fixed inset-0 z-[60] bg-background`
- Les animations internes des demos (cochage, bulles de chat, donut) se declenchent automatiquement a chaque changement d'etape via des `useEffect` avec timeouts
