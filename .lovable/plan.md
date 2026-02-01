
## Plan : Améliorations VitaSync - Mobile, Animations, IA, Thème, Style & Internationalisation

Ce plan couvre 6 axes d'amélioration : mobile, animations, catalogue IA, bouton thème, style des questions, et traduction multi-langue.

---

### 1. Améliorer la Version Mobile

**Fichiers concernés :**
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/FeaturesSection.tsx`
- `src/components/sections/PricingSection.tsx`
- `src/components/sections/ProductPreviewSection.tsx`
- `src/index.css`

**Améliorations prévues :**

| Section | Problème actuel | Amélioration |
|---------|-----------------|--------------|
| Hero | Texte trop grand sur mobile | Réduire tailles : `text-3xl sm:text-4xl md:text-5xl` |
| Hero | Spline viewer peut ralentir | Désactiver sur mobile (`hidden md:block`) |
| Features | Cartes trop serrées | Augmenter `gap-4` → `gap-6` sur mobile |
| Pricing | Tableau trop large | Mode scroll horizontal ou cards empilées |
| Dashboard Preview | Image trop grande | Ajouter `max-h-[400px]` sur mobile |

**Ajouts CSS mobile :**
```css
/* Améliorations tactiles */
@media (max-width: 768px) {
  .btn-neumorphic, .btn-hero-glass {
    @apply py-5 px-8 text-base;
    -webkit-tap-highlight-color: transparent;
  }
  
  .glass-card {
    @apply rounded-xl;
  }
}
```

---

### 2. Améliorer les Animations

**Fichiers concernés :**
- `src/components/sections/HeroSection.tsx`
- `src/components/sections/FeaturesSection.tsx`
- `src/components/sections/ProductPreviewSection.tsx`
- `src/index.css`

**Nouvelles animations :**

| Animation | Description | Application |
|-----------|-------------|-------------|
| `stagger-in` | Entrée décalée des éléments | Listes de fonctionnalités |
| `float` | Flottement subtil | Éléments décoratifs |
| `pulse-glow` | Lueur pulsante | Boutons CTA, badges |
| `parallax-depth` | Effet de profondeur au scroll | Cartes Features |

**Ajouts dans `index.css` :**
```css
@keyframes float-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px hsl(var(--primary) / 0.3); }
  50% { box-shadow: 0 0 40px hsl(var(--primary) / 0.5); }
}

.animate-float-gentle {
  animation: float-gentle 4s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}
```

**Amélioration des transitions existantes :**
- Réduire les durées de 0.6s à 0.4s pour plus de réactivité
- Ajouter `will-change: transform` pour fluidité GPU

---

### 3. Rafraîchir le Catalogue IA avec les Nouveaux Produits

**Fichier concerné :**
- `supabase/functions/ai-coach/index.ts`

**Situation actuelle :**
Le catalogue est déjà récupéré dynamiquement via `fetchShopifyCatalog()` à chaque requête. Les produits Shopify sont automatiquement à jour.

**Améliorations :**

1. **Ajouter plus de métadonnées produits :**
```typescript
const query = `
  query {
    products(first: 100) {  // Augmenter de 50 à 100
      edges {
        node {
          id
          title
          description
          productType
          tags  // NOUVEAU - pour catégorisation
          vendor
          variants(first: 1) {
            edges {
              node {
                id
                price { amount currencyCode }
                availableForSale  // NOUVEAU - stock
              }
            }
          }
        }
      }
    }
  }
`;
```

2. **Améliorer le formatage du catalogue pour l'IA :**
```typescript
// Catégoriser les produits par type
const categorizedCatalog = `
CATALOGUE VITASYNC (${products.length} produits)
═══════════════════════════════════════════════

📦 PROTÉINES & MUSCLES:
${proteinProducts.join('\n')}

💊 VITAMINES & MINÉRAUX:
${vitaminProducts.join('\n')}

🧠 NOOTROPIQUES & FOCUS:
${nootropicProducts.join('\n')}

😴 SOMMEIL & RELAXATION:
${sleepProducts.join('\n')}
`;
```

3. **Ajouter indication de disponibilité :**
```typescript
const availability = variant?.availableForSale ? '✓ En stock' : '⚠ Rupture';
```

---

### 4. Bouton Toggle Thème (Clair/Sombre) - Pages Publiques

**Nouveau fichier :**
- `src/components/ui/FloatingThemeToggle.tsx`

**Fichiers modifiés :**
- `src/pages/Index.tsx`
- `src/pages/About.tsx`
- `src/pages/Blog.tsx`
- `src/pages/Contact.tsx`

**Composant FloatingThemeToggle :**
```typescript
import { useTheme } from "next-themes";
import { Sun, Moon } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full
                 glass-card flex items-center justify-center
                 shadow-lg hover:shadow-xl transition-shadow"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
          >
            <Sun weight="light" className="w-5 h-5 text-yellow-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
          >
            <Moon weight="light" className="w-5 h-5 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
```

**Intégration dans Index.tsx :**
```typescript
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingThemeToggle />  {/* Ajout ici */}
      <Navbar />
      <main>...</main>
      <Footer />
    </div>
  );
};
```

**Note :** Le bouton sera en bas à **gauche**, visible sur toutes les pages publiques SAUF le dashboard (qui a déjà son propre toggle dans les paramètres).

---

### 5. Améliorer le Style des Questions (Onboarding + Daily Check-in)

**Fichiers concernés :**
- `src/components/onboarding/OnboardingFlow.tsx`
- `src/components/dashboard/DailyCheckin.tsx`

**Problèmes actuels :**
- Boutons d'options trop basiques (`border-border bg-card/50`)
- Manque de polish visuel
- Pas assez d'espace entre les éléments

**Nouveau design des boutons d'option :**

```typescript
// Nouveau style pour les boutons d'option
<motion.button
  onClick={() => handleSelect(opt.value)}
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.02 }}
  className={cn(
    "group p-5 rounded-2xl border-2 text-left transition-all duration-300",
    "backdrop-blur-sm shadow-sm hover:shadow-md",
    isOptionSelected(opt.value)
      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
      : "border-border/60 bg-card/30 hover:border-primary/40 hover:bg-card/50"
  )}
>
  <div className="flex items-center gap-4">
    <span className="text-3xl group-hover:scale-110 transition-transform">
      {opt.emoji}
    </span>
    <span className="text-sm font-medium text-foreground">
      {opt.label}
    </span>
  </div>
  
  {/* Indicateur de sélection */}
  {isOptionSelected(opt.value) && (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
    >
      <Check className="w-3 h-3 text-white" />
    </motion.div>
  )}
</motion.button>
```

**Améliorations du Daily Check-in :**
- Modal avec effet glassmorphism plus prononcé
- Sliders avec couleurs de gradient
- Animations d'entrée pour chaque question
- Progress bar colorée

---

### 6. Support Multi-Langue (FR, EN, ES)

**Nouveaux fichiers :**
- `src/lib/i18n.ts` - Configuration i18n
- `src/hooks/useTranslation.ts` - Hook personnalisé
- `src/locales/fr.json` - Traductions françaises
- `src/locales/en.json` - Traductions anglaises
- `src/locales/es.json` - Traductions espagnoles
- `src/components/ui/LanguageSelector.tsx` - Sélecteur de langue

**Architecture i18n (sans dépendance externe) :**

```typescript
// src/lib/i18n.ts
type Locale = 'fr' | 'en' | 'es';

const translations: Record<Locale, Record<string, string>> = {
  fr: {
    "hero.title": "Votre Santé, Propulsée par l'Intelligence Artificielle",
    "hero.subtitle": "VitaSync analyse vos besoins en temps réel...",
    "hero.cta": "Démarrer mon bilan gratuit",
    "nav.features": "Fonctionnalités",
    "nav.pricing": "Tarifs",
    // ...
  },
  en: {
    "hero.title": "Your Health, Powered by Artificial Intelligence",
    "hero.subtitle": "VitaSync analyzes your needs in real-time...",
    "hero.cta": "Start my free assessment",
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    // ...
  },
  es: {
    "hero.title": "Tu Salud, Impulsada por la Inteligencia Artificial",
    "hero.subtitle": "VitaSync analiza tus necesidades en tiempo real...",
    "hero.cta": "Comenzar mi evaluación gratuita",
    "nav.features": "Características",
    "nav.pricing": "Precios",
    // ...
  }
};
```

**Hook useTranslation :**
```typescript
// src/hooks/useTranslation.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface I18nStore {
  locale: 'fr' | 'en' | 'es';
  setLocale: (locale: 'fr' | 'en' | 'es') => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'fr',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'vitasync-locale' }
  )
);

export function useTranslation() {
  const { locale } = useI18n();
  
  const t = (key: string) => {
    return translations[locale][key] || key;
  };
  
  return { t, locale };
}
```

**Composant LanguageSelector :**
```typescript
// src/components/ui/LanguageSelector.tsx
export function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  
  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50">
        <Globe weight="light" className="w-4 h-4" />
        <span className="text-sm">{languages.find(l => l.code === locale)?.flag}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={locale === lang.code ? "bg-primary/10" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Intégration dans la Navbar :**
Le sélecteur de langue sera ajouté à côté du bouton "Se connecter" dans la navbar.

---

### Récapitulatif des Fichiers

| Action | Fichier | Priorité |
|--------|---------|----------|
| Créer | `src/components/ui/FloatingThemeToggle.tsx` | Haute |
| Créer | `src/lib/i18n.ts` | Haute |
| Créer | `src/hooks/useTranslation.ts` | Haute |
| Créer | `src/locales/fr.json` | Haute |
| Créer | `src/locales/en.json` | Haute |
| Créer | `src/locales/es.json` | Haute |
| Créer | `src/components/ui/LanguageSelector.tsx` | Haute |
| Modifier | `src/pages/Index.tsx` | Haute |
| Modifier | `src/pages/About.tsx` | Moyenne |
| Modifier | `src/pages/Blog.tsx` | Moyenne |
| Modifier | `src/pages/Contact.tsx` | Moyenne |
| Modifier | `src/components/layout/Navbar.tsx` | Haute |
| Modifier | `src/components/onboarding/OnboardingFlow.tsx` | Haute |
| Modifier | `src/components/dashboard/DailyCheckin.tsx` | Haute |
| Modifier | `src/components/sections/HeroSection.tsx` | Moyenne |
| Modifier | `src/components/sections/FeaturesSection.tsx` | Moyenne |
| Modifier | `src/index.css` | Moyenne |
| Modifier | `supabase/functions/ai-coach/index.ts` | Moyenne |

---

### Ordre d'Implémentation

1. **Bouton Theme Toggle** - Composant simple, impact visuel immédiat
2. **Style des Questions** - Amélioration UX critique (onboarding + daily check-in)
3. **Animations** - Polish visuel général
4. **Mobile** - Optimisations responsive
5. **Système i18n** - Infrastructure de traduction
6. **Catalogue IA** - Enrichissement des données produits

---

### Sections à Traduire (Prioritaires)

| Section | Clés de traduction |
|---------|-------------------|
| Navbar | `nav.howItWorks`, `nav.features`, `nav.testimonials`, `nav.pricing`, `nav.faq` |
| Hero | `hero.title`, `hero.subtitle`, `hero.cta`, `hero.secondary` |
| Features | `features.title`, `features.subtitle`, + 4 blocs |
| Pricing | `pricing.title`, `pricing.free.*`, `pricing.premium.*` |
| FAQ | `faq.title`, + questions/réponses |
| Auth | `auth.login`, `auth.signup`, `auth.email`, `auth.password` |
| Onboarding | Toutes les questions (11 étapes) |

---

### Détails Techniques

**Note importante pour le mode sombre du bouton thème :**
Le bouton flottant utilisera la classe `.glass-card` qui s'adapte automatiquement au thème grâce aux variables CSS définies dans `index.css` (`.dark .glass-card`).

**Persistance de la langue :**
La langue choisie sera stockée dans `localStorage` via Zustand persist, et détectée automatiquement au premier chargement via `navigator.language`.
