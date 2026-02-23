

## Plan : Page "Mon Stack Mensuel" -- Gestionnaire d'Abonnement

### Vue d'ensemble

Creer une nouvelle section dans le dashboard existant ("mystack") qui centralise la gestion des abonnements produits (Shopify Selling Plans), l'abonnement IA (Go AI / Premium AI), les moyens de paiement et les recommandations IA. Pour l'instant, les donnees seront mockees car l'API Customer Account GraphQL de Shopify necessite un buyer access token qui sera integre dans une phase ulterieure. L'abonnement IA (Stripe) est aussi moque en attendant l'integration.

---

### Fichiers a creer

| # | Fichier | Description |
|---|---------|-------------|
| 1 | `src/components/dashboard/mystack/MyStackSection.tsx` | Composant principal de la page, orchestre les 5 sections (A-E) avec staggered fade-in |
| 2 | `src/components/dashboard/mystack/NextDeliveryHero.tsx` | Section A : Hero "Prochaine Livraison" avec boutons Repousser / Pause |
| 3 | `src/components/dashboard/mystack/CurrentStackList.tsx` | Section B : Liste des produits dans la box avec actions Echanger / Retirer |
| 4 | `src/components/dashboard/mystack/AIRecommendationCard.tsx` | Section C : Recommandation IA (Gemini 2.5 Flash) avec upsell |
| 5 | `src/components/dashboard/mystack/CoachingTierSelector.tsx` | Section D : Grille des 3 tiers d'abonnement IA |
| 6 | `src/components/dashboard/mystack/SettingsDangerZone.tsx` | Section E : Paiement, adresse, lien annulation |
| 7 | `src/components/dashboard/mystack/index.ts` | Barrel export |

### Fichiers a modifier

| # | Fichier | Changement |
|---|---------|-------------|
| 8 | `src/pages/Dashboard.tsx` | Ajouter "mystack" au type `Section`, ajouter l'entree dans `menuItems` (icone `Package`), rendre `<MyStackSection />` dans le switch AnimatePresence |
| 9 | `src/components/dashboard/MobileBottomNav.tsx` | Ajouter "mystack" au type `Section` et dans les `navItems` (6 items au total, ou remplacement du lien settings qui passe dans "general" uniquement) |

---

### Details techniques par section

**Section A -- NextDeliveryHero**
- Card blanche avec `rounded-[20px]`, padding 24px, shadow `0 4px 12px rgba(0,0,0,0.03)`
- Flexbox : gauche = icone CalendarBlank + date prochaine livraison (H2) + badge "Actif" vert
- Droite = bouton primaire "Repousser de 15 jours" (bg accent, radius 12px) + bouton outline "Mettre en pause"
- Donnees mockees (date : 15 novembre, statut : Actif)

**Section B -- CurrentStackList**
- Liste verticale de produits mockes (Magnesium, Omega 3, Ashwagandha)
- Chaque ligne : image 64x64 (radius 8px, bg `#F8FAFC`), nom (H3 18px), quantite (x1), prix
- Boutons discrets a droite : "Echanger" et "Retirer" (text gris, hover accent)

**Section C -- AIRecommendationCard**
- Card avec bordure `1px #00D09C` et background `rgba(0, 208, 156, 0.05)`
- Header : icone Sparkle + "Analyse Gemini 2.5 Flash"
- Texte dynamique base sur les check-ins recents (mocke initialement)
- Mini-card produit suggeree avec bouton "Ajouter au Stack"
- **Future** : appellera l'edge function `ai-shop-recommendations` avec le contexte des produits actuels du stack

**Section D -- CoachingTierSelector**
- Grille 3 colonnes (1 col mobile) avec gap 24px
- Basic (0$), Go AI (7.99$), Premium AI (24.99$)
- La carte active a une bordure 2px accent + badge "Plan Actuel"
- Bouton "Mettre a niveau" sur la carte superieure
- Donnees mockees (plan actuel = Go AI)
- **Future** : connecte a Stripe pour la gestion reelle

**Section E -- SettingsDangerZone**
- Grid 2 colonnes (1 col mobile)
- Carte "Moyen de paiement" : icone Visa, `**** 4242`, bouton outline "Modifier"
- Carte "Adresse de livraison" : texte adresse mockee, bouton outline "Modifier"
- En bas centre : lien texte gris 14px "Annuler mon abonnement", hover rouge discret

---

### Navigation

- Nouvelle entree dans la sidebar desktop : icone `Package` (Phosphor), label "Mon Stack" entre "Shop" et "Settings"
- Sur mobile bottom nav : ajouter l'icone `Package` -- la barre passera a 6 items. Si trop serre, on remplace l'entree "Settings" dans la bottom nav (Settings reste accessible dans le menu "General" de la sidebar desktop)

### Animations

- Toutes les sections (A-E) entrent avec un stagger de 100ms : `opacity 0->1, translateY 20px->0, duration 400ms`
- Boutons : `transition: all 0.2s ease-in-out` sur les hover states
- Les cartes produit dans la liste (Section B) ont un hover leger (elevation + border-color change)

### Design System applique

- Fond page : `#F8FAFC` (deja le bg du dashboard)
- Cards : `bg-white rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6`
- Accent : `#00D09C` (variable `primary` deja configuree)
- Texte principal : `#0F172A` / Secondaire : `#64748B` / Bordures : `#E2E8F0`
- Boutons : radius 12px, transitions 200ms
- Espacement entre sections : 48px (`space-y-12`)

