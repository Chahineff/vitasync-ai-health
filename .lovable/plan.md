

# Plan de modifications

## 1. Navbar responsive et adaptative

**Probleme actuel** : La navbar a une largeur fixe `w-[96%] max-w-6xl` (72rem) qui ne s'adapte pas fluidement aux ecrans intermediaires.

**Corrections** :
- Remplacer la largeur fixe par un systeme de marges responsives progressives
- Sur mobile (<768px) : marges de 12px de chaque cote
- Sur tablette (768-1024px) : marges de 24px
- Sur desktop (1024-1440px) : marges de 40px
- Sur grand ecran (>1440px) : max-width de 1400px centre
- Modifier le CSS dans `src/index.css` (classe `.nav-sticky`) pour utiliser des marges responsives via des media queries ou des classes Tailwind adaptatives
- La navbar gardera son design flottant capsule actuel

**Fichiers modifies** : `src/index.css` (classe `.nav-sticky`)

---

## 2. Page About - En attente du PDF

Vous avez mentionne vouloir fournir un PDF avec les vraies informations VitaSync. Je mettrai a jour la page About des reception de ce document. En attendant, aucune modification sur cette page.

---

## 3. Page Blog - Etat vide + systeme d'administration

**Etat vide** :
- Remplacer la grille d'articles fictifs par un message "Aucun article pour le moment"
- Garder le hero et le design existant
- Supprimer les articles en dur

**Systeme d'administration des articles** :
- Creer une table `blog_posts` dans la base de donnees avec les colonnes : `id`, `slug`, `title`, `excerpt`, `content` (Markdown), `category`, `read_time`, `published`, `author_id`, `created_at`, `updated_at`
- Ajouter des politiques RLS pour que seul l'auteur puisse creer/modifier/supprimer, et que les articles publies soient lisibles par tous
- La page Blog affichera dynamiquement les articles depuis la base de donnees
- Pour gerer vos articles (creer, modifier, supprimer), vous pourrez utiliser l'interface backend de Lovable Cloud (onglet Cloud > Database > table `blog_posts`) pour inserer et editer vos articles directement

**Fichiers modifies** :
- `src/pages/Blog.tsx` : affichage dynamique depuis la DB, etat vide
- `src/lib/i18n.ts` : ajout des traductions pour l'etat vide
- Migration SQL : creation de la table `blog_posts`

---

## Details techniques

| Tache | Fichiers | Complexite |
|-------|----------|------------|
| Navbar responsive | `src/index.css` | Faible |
| Blog etat vide | `src/pages/Blog.tsx` | Faible |
| Table blog_posts + RLS | Migration SQL | Moyenne |
| Blog dynamique | `src/pages/Blog.tsx` | Moyenne |

