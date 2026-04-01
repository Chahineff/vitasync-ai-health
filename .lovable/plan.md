

# Plan d'application de l'audit UX/Design VitaSync

## Resume des problemes identifies et actions

L'audit identifie des problemes classes par priorite. Voici le plan d'implementation, en se concentrant sur les corrections les plus impactantes.

---

## Etape 1 — Fix critique : ShineBorder Pricing (lisibilite)

**Probleme :** Le gradient anime ShineBorder rend le texte des cartes tarifaires difficile a lire.

**Action :** Dans `PricingSection.tsx`, reduire `borderWidth` de 1 a 1 (deja fait) mais surtout ajouter un fond opaque `bg-background` sur le contenu interieur des cartes Go AI et Premium AI pour que le gradient ne transparaisse pas derriere le texte.

---

## Etape 2 — Fix critique : Previews Features visibles sur mobile

**Probleme :** Les widgets de preview (ChatPreviewWidget, TrackerPreviewWidget, etc.) sont caches sur mobile avec `hidden lg:block`.

**Action :** Dans `feature-steps.tsx`, le preview area est deja visible sur mobile (`w-full lg:w-3/5`). Verifier que les previews individuels n'ont pas de `hidden lg:block` et ajuster les hauteurs pour mobile.

---

## Etape 3 — Fix modere : Supprimer le max-width restrictif de App.css

**Probleme :** `#root { max-width: 1280px; padding: 2rem; text-align: center }` cree des conflits d'alignement.

**Action :** Supprimer ou neutraliser ces styles dans `App.css` — ce fichier est un vestige du template Vite par defaut et n'est probablement pas utilise.

---

## Etape 4 — Masquer le selecteur de modele IA par defaut

**Probleme :** Le selecteur de modele IA (2.5 Flash, 3 Flash, 3 Pro) est visible et confus pour les utilisateurs non-techniques.

**Action :** Dans `ChatModelSelector.tsx` / `ChatInterface.tsx`, masquer le selecteur par defaut. Utiliser automatiquement le meilleur modele (VitaSync 3 Flash) et afficher un petit bouton discret "Mode avance" pour reveler le selecteur.

---

## Etape 5 — Supprimer la carte "Application mobile - Bientot" de la sidebar

**Probleme :** Rappelle une fonctionnalite manquante, percu negativement.

**Action :** Dans `Dashboard.tsx`, supprimer le bloc "App Promo Card" (lignes 376-390) de la sidebar.

---

## Etape 6 — Simplifier le dashboard (reduire la sidebar a 5 items)

**Probleme :** 7 sections + tutoriel = complexite excessive.

**Action :** Fusionner "Mon Stack" dans la section Boutique ou le rendre accessible depuis Boutique. Reduire la sidebar a : Accueil, Coach IA, Supplements, Boutique, Parametres. Supprimer "Mes Analyses" de la sidebar (accessible depuis Accueil via un widget).

---

## Etape 7 — Standardiser les border-radius

**Probleme :** Mix de `rounded-xl`, `rounded-2xl`, `rounded-[16px]`, `rounded-[20px]`, `rounded-3xl`.

**Action :** Adopter une convention simple : `rounded-xl` pour les petits elements, `rounded-2xl` pour les cards. Harmoniser dans les principaux composants (GlowCard, pricing cards, feature-steps, dashboard cards).

---

## Etape 8 — Ameliorer la typographie (hierarchie stricte)

**Probleme :** Tailles et weights melanges sans structure claire.

**Action :** Appliquer la hierarchie recommandee :
- H1 Hero : `text-5xl tracking-tight`
- H2 Section : `text-3xl font-semibold`
- Body : `text-base leading-relaxed`
- CTA : `text-lg font-bold`

Ajuster dans `HeroSection.tsx`, `PricingSection.tsx`, `FeaturesSection.tsx`.

---

## Etape 9 — Reduire les nuances de gris inconsistantes

**Probleme :** 6+ nuances de gris differentes.

**Action :** Standardiser sur `text-muted-foreground` pour le secondaire, `text-foreground/50` pour le tertiaire, `text-foreground/30` pour le desactive. Corriger les `text-foreground/40`, `/60`, etc. vers ces 3 niveaux.

---

## Etape 10 — Ajouter les animations manquantes

- **Number counter anime** sur le score sante dans `HealthScoreWidget` (counter up de 0 a la valeur)
- **Scroll reveal staggered** deja en place avec `ScrollReveal` — verifier qu'il est applique partout sur la landing

---

## Details techniques

| Fichier | Modification |
|---------|-------------|
| `App.css` | Supprimer styles `#root` |
| `PricingSection.tsx` | Ajouter `bg-background` opaque dans ShineBorder cards |
| `feature-steps.tsx` | Verifier visibilite mobile des previews |
| `Dashboard.tsx` | Supprimer carte mobile "Bientot", reduire sidebar a 5 items |
| `ChatModelSelector.tsx` | Masquer par defaut, mode avance |
| `ChatInterface.tsx` | Auto-select meilleur modele |
| Composants divers | Harmoniser border-radius et typographie |

