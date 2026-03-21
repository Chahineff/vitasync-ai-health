

# Harmonisation visuelle de toutes les pages publiques (hors Dashboard)

## Contexte

Les pages publiques (About, Contact, Blog, BlogPost, Legal) utilisent des patterns visuels incohérents par rapport aux améliorations récentes de la homepage (bordures renforcées en mode clair, GlowCard, meilleur contraste). L'objectif est d'aligner toutes ces pages sur le même niveau de qualité visuelle, en mode clair comme en mode sombre.

## Pages concernees

- About (`src/pages/About.tsx`)
- Contact (`src/pages/Contact.tsx`)
- Blog (`src/pages/Blog.tsx`)
- BlogPost (`src/pages/BlogPost.tsx`)
- LegalPageLayout (`src/components/layout/LegalPageLayout.tsx`)
- Footer (`src/components/layout/Footer.tsx`)
- GlassCard (`src/components/ui/GlassCard.tsx`)

---

## Plan d'implementation

### 1. Renforcer GlassCard pour le mode clair

Le composant `GlassCard` utilise la classe CSS `glass-card` qui manque de contraste en light mode. Ajouter des classes Tailwind conditionnelles pour le mode clair : bordure visible (`border border-border/50`), fond blanc semi-transparent (`bg-white/60 dark:bg-transparent`), et ombre légere.

**Fichier** : `src/components/ui/GlassCard.tsx`

### 2. Harmoniser les pages About, Contact, Blog

Ces 3 pages partagent la meme structure (hero + sections). Les ajustements :

- **Inputs du formulaire Contact** : remplacer `border-0` par `border border-border/50` pour que les champs soient visibles en mode clair
- **Sections avec `bg-gradient-subtle`** : ajouter `border-y border-border/30` pour delimiter les zones en mode clair
- **Badge/labels "uppercase tracking-widest"** : uniformiser l'opacite (`text-primary/80` en light)
- **Hero sections** : retirer `bg-gradient-radial` (qui n'existe pas dans le CSS) et utiliser un fond transparent coherent

### 3. Harmoniser BlogPost

- Ajouter une `GlassCard` autour du contenu de l'article pour la separation visuelle
- Aligner les styles prose avec ceux de `LegalPageLayout`

### 4. Harmoniser LegalPageLayout

- Ajouter une bordure et un fond subtil autour de l'article (`glass-card` ou bordure)
- Ajouter le `FloatingThemeToggle` et harmoniser le header avec le pattern hero des autres pages (badge + animation framer-motion d'entree)

### 5. Harmoniser le Footer

- Renforcer les bordures des icones sociales en mode clair (`border-border/50`)
- S'assurer que la section "brand column" a un contraste suffisant pour les deux modes

---

## Details techniques

- **Aucun fichier dashboard** ne sera modifie
- Les modifications principales portent sur ~6 fichiers
- Les classes CSS existantes dans `index.css` (`.glass-card`, `.glass-card-premium`) seront reutilisees, pas de nouveau CSS
- La coherence sera assuree par l'utilisation systematique de `border-border/40` (light) et des variables CSS deja definies

