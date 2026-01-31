
## Plan : Améliorations de la Homepage VitaSync

Ce plan corrige 4 éléments de la homepage selon vos retours : capture du vrai dashboard, scroll raccourci, suppression des témoignages, et section tarifs enrichie.

---

### 1. Dashboard Personnel : Capture d'écran réelle

**Situation actuelle :**
La section "Votre Dashboard Personnel" (`ProductPreviewSection.tsx`) affiche un mockup CSS construit en dur (`MiniDashboard` et `MiniDashboardMobile`), pas le vrai dashboard.

**Solution :**
Remplacer les composants `MiniDashboard` par une image (screenshot) du vrai dashboard.

**Fichier : `src/components/sections/ProductPreviewSection.tsx`**

| Avant | Après |
|-------|-------|
| Composants `MiniDashboard` + `MiniDashboardMobile` (~300 lignes) | Simple balise `<img>` avec la capture |
| Animation complexe avec ring charts | Image statique avec léger effet de parallaxe |

**Actions :**
1. Capturer une image haute qualité du dashboard réel (via le navigateur)
2. Uploader l'image dans `public/lovable-uploads/`
3. Simplifier drastiquement le composant :

```typescript
// Remplacer MiniDashboard par :
<img 
  src="/lovable-uploads/dashboard-screenshot.png" 
  alt="Dashboard VitaSync" 
  className="w-full h-full object-cover rounded-xl"
/>
```

4. Supprimer les composants inutilisés : `RingChart`, `RoutineChecklist`, `MiniDashboard`, `MiniDashboardMobile`

---

### 2. Section "Comment ça marche" : Raccourcir le scroll

**Situation actuelle :**
La section utilise `100vh × 4 étapes = 400vh` de hauteur, ce qui crée un scroll très long.

**Fichier : `src/components/sections/HowItWorksSection.tsx`**

**Solution :**
Réduire la hauteur par étape de 100vh à 60vh.

| Paramètre | Avant | Après |
|-----------|-------|-------|
| Hauteur totale | `${steps.length * 100}vh` (400vh) | `${steps.length * 60}vh` (240vh) |
| Durée scroll | ~4 écrans complets | ~2.5 écrans |

```typescript
// Ligne 217 - Réduire la hauteur
<section 
  style={{ height: `${steps.length * 60}vh` }}  // Était 100vh
>
```

**Ajustements additionnels :**
- Réduire le padding vertical des cartes
- Accélérer les transitions d'animation (de 0.6s à 0.4s)

---

### 3. Supprimer la section Témoignages

**Situation actuelle :**
La section `TestimonialsSection` affiche 5 faux témoignages avec métriques inventées.

**Fichier : `src/pages/Index.tsx`**

**Solution :**
Retirer l'import et le composant de la homepage.

```typescript
// Supprimer ces lignes :
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
// ...
<TestimonialsSection />
```

**Note :** Le fichier `TestimonialsSection.tsx` restera dans le projet pour une utilisation future avec de vrais témoignages.

---

### 4. Section Tarifs : Plus de détails + Tableau comparatif

**Situation actuelle :**
Deux cartes simples avec listes de fonctionnalités basiques.

**Fichier : `src/components/sections/PricingSection.tsx`**

**Nouvelle structure :**

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Tarification simple                          │
│              Choisissez votre niveau d'intelligence              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌──────────────────┐    ┌──────────────────┐                   │
│   │    GRATUIT       │    │   PREMIUM IA ★   │                   │
│   │      0€          │    │    7,99€/mois    │                   │
│   │  [Features...]   │    │  [Features...]   │                   │
│   └──────────────────┘    └──────────────────┘                   │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│           TABLEAU COMPARATIF DÉTAILLÉ                            │
│                                                                   │
│   Fonctionnalité               │ Gratuit │ Premium              │
│   ─────────────────────────────┼─────────┼──────────            │
│   Conversations IA / jour      │    5    │ Illimité             │
│   Chat texte                   │    ✓    │    ✓                 │
│   Fonctions vocales            │    ✗    │    ✓                 │
│   Analyse documents (PDF)      │    ✗    │    ✓                 │
│   Historique                   │  7 jours│ Illimité             │
│   Recommandations personnalisées│ Basiques│ Avancées            │
│   Suivi proactif temps réel    │    ✗    │    ✓                 │
│   Support                      │ Standard│ Prioritaire          │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│   Note : L'abonnement aux compléments est proposé séparément     │
└─────────────────────────────────────────────────────────────────┘
```

**Détails enrichis pour les plans :**

| Plan | Nouvelles fonctionnalités détaillées |
|------|--------------------------------------|
| Gratuit | Conversations IA : 5/jour, Chat texte uniquement, Recommandations générales, Historique 7 jours, Pas de voix ni documents |
| Premium | Conversations illimitées, Chat + Voix, Analyse PDF/photos, Suivi proactif, Historique illimité, Support prioritaire 24/7 |

**Composants à ajouter :**
- Tableau HTML/CSS avec composant `Table` de shadcn/ui
- Icônes Check/X pour comparaison visuelle
- Section "Questions fréquentes sur les tarifs" (optionnel)

---

### Récapitulatif des Fichiers

| Action | Fichier | Impact |
|--------|---------|--------|
| Modifier | `src/components/sections/ProductPreviewSection.tsx` | Remplacer mockup par image |
| Modifier | `src/components/sections/HowItWorksSection.tsx` | Réduire hauteur scroll |
| Modifier | `src/pages/Index.tsx` | Supprimer TestimonialsSection |
| Modifier | `src/components/sections/PricingSection.tsx` | Ajouter tableau comparatif |
| Conserver | `src/components/sections/TestimonialsSection.tsx` | Ne pas supprimer (futur usage) |

---

### Ordre d'Implémentation

1. **Supprimer Témoignages** - Modification rapide dans Index.tsx
2. **Raccourcir scroll** - Ajuster la hauteur dans HowItWorksSection
3. **Tableau tarifs** - Enrichir PricingSection avec comparaison détaillée
4. **Screenshot Dashboard** - Capturer et intégrer l'image (nécessite capture préalable)

---

### Note sur la Capture d'Écran

Pour la capture du dashboard réel, deux options :

**Option A - Manuelle :**
Vous capturez une image du dashboard depuis votre navigateur et l'uploadez dans le projet.

**Option B - Automatisée :**
Je peux prendre une capture via l'outil browser de Lovable et l'intégrer directement.

Quelle option préférez-vous pour le screenshot ?
