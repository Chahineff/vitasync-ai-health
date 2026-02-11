
# Adaptation Mobile Complete du Dashboard VitaSync

## Contexte

Le dashboard fonctionne bien sur desktop mais plusieurs sections ne sont pas optimisees pour les ecrans mobiles (< 768px). L'objectif est d'adapter chaque section pour offrir une experience native et fluide sur smartphone.

---

## Sections a adapter

### 1. Shop (ShopSection + ProductGroupCard)

**Problemes actuels :**
- Grille 3 colonnes sur mobile = cartes produits trop etroites
- Bouton "Ajouter au panier" avec texte trop large dans les cartes
- Les selecteurs de saveurs (flavor chips) sont difficilement cliquables
- Header de la boutique pas assez compact

**Corrections :**
- Passer la grille de `grid-cols-3` a `grid-cols-2` sur mobile (< 768px), garder 3 colonnes tablette et 4 desktop
- Dans `ProductGroupCard` : masquer le texte du bouton panier sur mobile (icone seule), reduire le padding
- Reduire la taille des chips de saveur sur petits ecrans
- Compacter le header (titre + sous-titre sur une seule ligne)

### 2. Settings (ProfileSection + HealthProfileSection)

**Problemes actuels :**
- Le formulaire `grid-cols-2` pour prenom/nom reste en 2 colonnes sur mobile
- Le titre "Mon Profil Sante" et son bouton "Modifier" peuvent se chevaucher
- Les cartes du profil sante restent en `sm:grid-cols-2` mais le padding est excessif sur petit ecran

**Corrections :**
- Forcer `grid-cols-1` sur mobile pour le formulaire prenom/nom
- Reduire le padding des glass-cards de `p-8` a `p-4` sur mobile (via responsive `p-4 md:p-8`)
- Adapter l'en-tete du profil sante (flex-col sur mobile avec bouton pleine largeur)

### 3. Coach IA (ChatInterface + ChatSidebar)

**Problemes actuels :**
- La sidebar du chat est cachee (`hidden md:flex`) = pas d'acces a l'historique sur mobile
- La hauteur `h-[calc(100vh-2rem)]` ne tient pas compte du bottom nav (80px)
- Le padding de l'input bar est trop genereux sur mobile

**Corrections :**
- Ajuster la hauteur pour tenir compte de la bottom nav : `h-[calc(100vh-8rem)]` sur mobile
- Reduire le padding de la zone de messages et de l'input bar sur mobile
- Ajouter un bouton hamburger dans le header du chat pour ouvrir la sidebar en overlay sur mobile (sheet/drawer)

### 4. Supplements (SupplementTrackerEnhanced + SupplementAIInsights)

**Problemes actuels :**
- Le layout `lg:grid-cols-5` (3+2) s'empile bien en une colonne mais les cartes internes gardent un padding excessif
- Les onglets (Jour/Semaine/Mois) et les boutons d'action manquent de taille tactile

**Corrections :**
- S'assurer que les targets tactiles font au minimum 44px de hauteur
- Reduire le padding interne des cartes supplement sur mobile

### 5. Home (DashboardHome)

**Problemes actuels :**
- Le titre de bienvenue est trop long sur mobile
- La grille `grid-cols-1 lg:grid-cols-2` fonctionne mais les widgets internes ont des paddings trop larges

**Corrections :**
- Reduire la taille du titre de `text-2xl` a `text-xl` sur les plus petits ecrans
- Ajuster les paddings des widgets (QuickCoachWidget notamment : `p-6 lg:p-8` deja OK, verifier DailyCheckinWidget)

---

## Fichiers modifies

| Fichier | Modification |
|---|---|
| `src/components/dashboard/ShopSection.tsx` | Grille responsive `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, header compact |
| `src/components/dashboard/shop/ProductGroupCard.tsx` | Bouton panier icone-seule sur mobile, padding reduit, chips plus petites |
| `src/components/dashboard/ProfileSection.tsx` | Formulaire 1 colonne sur mobile, padding responsive |
| `src/components/dashboard/HealthProfileSection.tsx` | Padding responsive, en-tete adaptatif |
| `src/components/dashboard/ChatInterface.tsx` | Hauteur ajustee pour bottom nav, bouton sidebar mobile, padding responsive |
| `src/components/dashboard/chat/ChatSidebar.tsx` | Mode overlay (sheet) sur mobile au lieu de `hidden md:flex` |
| `src/components/dashboard/SupplementTrackerEnhanced.tsx` | Padding responsive, targets tactiles 44px min |
| `src/pages/Dashboard.tsx` | Ajustements mineurs des paddings et titres home |

---

## Principes respectes

- Mobile-first : les changements ciblent les breakpoints `md:` et `lg:` pour ne pas casser le desktop
- Pas de nouvelles dependances
- Conservation du design "Bio-Tech Luxury" (glassmorphism, rounded-3xl, etc.)
- Targets tactiles minimum 44px conformes aux guidelines iOS/Android
