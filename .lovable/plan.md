
# Refonte Premium de la Home Page -- Inspire par useorigin.com

## Vision
S'inspirer du design epure, immersif et haut de gamme de useorigin.com pour transformer la homepage VitaSync : fond photo/video plein ecran dans le hero, typographie editoriale avec italique sur le mot-cle, barre de prompt AI interactive, badges de credibilite, sections de contenu en bento/cards avec des images reelles, carrousel de temoignages horizontal, et CTA final immersif.

---

## Changements prevus

### 1. HeroSection -- Refonte complete
**Actuellement** : Fond Spline 3D, badge, titre bold, sous-titre, 2 boutons CTA.
**Nouveau design inspire d'Origin** :
- Fond avec gradient sombre immersif (tons bleu-nuit/teal au lieu du ciel d'Origin) couvrant tout l'ecran
- Badge promotionnel en haut ("Propulse par l'IA" dans une pill)
- Titre editorial geant avec le mot-cle en italique serif (ex: "*Propulse* ta sante.") -- utiliser une font serif (Playfair Display) uniquement pour le mot en italique
- Sous-titre plus court et elegant en dessous
- Un seul bouton CTA principal blanc/outline avec fleche ("Commencer" + ArrowRight)
- Barre de prompt AI interactive en dessous du CTA (comme Origin) : un faux champ de recherche avec une question pre-remplie animee ("Quels supplements pour mon energie ?") et un bouton d'envoi
- Slogan sous la barre : "Suivez tout. Demandez tout."
- Badges de credibilite en bas (ex: logos/badges fictifs "Top App Sante 2025", "IA Certifiee")
- Suppression du Spline 3D (trop lourd) au profit d'un fond CSS/gradient premium
- Scroll indicator conserve

### 2. Navbar -- Subtiles ameliorations
- Rendre la navbar completement transparente au depart (pas de fond), avec transition vers glass au scroll (deja en partie fait)
- Bouton CTA de la navbar en style outline blanc/border au lieu du neumorphic actuel
- Espacement de lettres en uppercase pour les liens de navigation (comme Origin : "PRODUCTS", "RESOURCES")

### 3. ProductPreviewSection -- Transformation en "Simplify your health"
**Actuellement** : Mockup desktop avec screenshot.
**Nouveau** :
- Titre avec italique sur le mot-cle : "*Simplifie* ta sante"
- Image de telephone/mockup mobile centree (comme Origin montre un phone) au lieu du desktop monitor
- Remplacer le mockup desktop par un design mobile-first plus moderne
- Garder l'effet parallax

### 4. FeaturesSection -- Format Bento Cards avec images
**Actuellement** : Zigzag layout avec GlassCards et icones decoratives.
**Nouveau inspire d'Origin** :
- Restructurer en grille Bento asymetrique (grandes et petites cards)
- Chaque card a un titre court, une description, et une image/screenshot reelle du dashboard
- Cards avec fond glass-card-premium et bordures subtiles
- Hover : legere elevation et glow
- Les images utilisent les screenshots existants du dashboard
- Bouton "En savoir plus" style lien discret avec fleche sur chaque section principale

### 5. Nouvelle section "Coach IA" (remplace/ameliore une partie de Features)
- Section dediee avec fond gradient et texte centre
- Titre : "*Demande* n'importe quoi"
- Sous-titre expliquant le coach IA
- 2-3 sous-cards montrant des cas d'usage (insights instantanes, recaps personnalises)
- Animation de reveal au scroll

### 6. PricingSection -- Nettoyage
- Conserver la structure actuelle mais aligner le style des cards avec le nouveau design (bordures plus fines, moins de couleurs)
- Simplifier visuellement

### 7. Nouvelle section Temoignages -- Carrousel horizontal
**Actuellement** : Pas de section temoignages sur la homepage (existe dans TestimonialsSection mais pas importee).
**Nouveau** :
- Carrousel horizontal auto-scrollant (comme Origin)
- Cards de temoignages avec etoiles, citation, nom
- Style minimaliste, fond transparent, bordures fines
- Defilement infini en boucle

### 8. Nouvelle section CTA Final
**Inspire du bas de page Origin** :
- Badge rappelant l'offre
- Grand titre : "Telecharge VitaSync" ou "Commence maintenant"
- Sous-titre court
- Bouton CTA final
- Image/illustration decorative

### 9. Footer -- Pas de changement majeur
- Garder tel quel, deja propre

### 10. CSS / Design System
- Ajouter la font Playfair Display (Google Fonts) pour les mots en italique editorial
- Nouveau gradient de fond hero (tons sombres bleu-nuit)
- Nouveaux styles de boutons : outline blanc, plus sobre
- Cards avec ombres plus douces

---

## Fichiers modifies

| Fichier | Action |
|---------|--------|
| `src/index.css` | Ajouter font Playfair Display, nouveaux gradients hero, styles boutons outline, styles carrousel temoignages |
| `src/components/sections/HeroSection.tsx` | Refonte complete : fond gradient, titre editorial italic, barre prompt AI, badges credibilite |
| `src/components/layout/Navbar.tsx` | Style transparent initial, liens uppercase, CTA outline |
| `src/components/sections/ProductPreviewSection.tsx` | Simplifier en mockup mobile, titre italic |
| `src/components/sections/FeaturesSection.tsx` | Restructurer en Bento grid avec images, ajouter section Coach IA |
| `src/components/sections/PricingSection.tsx` | Ajustements visuels mineurs |
| `src/components/sections/TestimonialsSection.tsx` | Refaire en carrousel horizontal auto-scrollant |
| `src/pages/Index.tsx` | Ajouter TestimonialsSection et CTASection, reorganiser l'ordre des sections |
| `src/components/sections/CTASection.tsx` | Nouveau fichier -- section CTA finale immersive |

---

## Details techniques

- Police Playfair Display importee via Google Fonts (CSS `@import`) uniquement pour les titres hero en italique
- Carrousel temoignages : implementation CSS pure avec `animation: scroll` et `translateX` pour la boucle infinie (pas de librairie supplementaire)
- Barre de prompt AI dans le hero : composant visuel uniquement (redirige vers `/auth?mode=signup` au clic), texte anime avec un effet de rotation de phrases
- Suppression complete du composant Spline 3D dans le hero (gain de performance significatif)
- Toutes les animations respectent `prefers-reduced-motion`
- Le contexte VitaSync (sante, supplements, IA) est conserve partout -- seul le design est inspire d'Origin
