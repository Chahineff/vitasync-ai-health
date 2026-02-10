
# Enrichissement des Fiches Produits avec les Donnees PDF

## Vue d'ensemble

Les PDFs stockes dans le bucket "vitasyncdata" contiennent des recherches detaillees pour chaque produit (ingredients, dosages, etudes scientifiques, precautions, etc.). Actuellement, le PDP utilise des donnees generiques ou des placeholders (section "Science" avec de faux liens, "What It Does" avec des benefices derives des tags, etc.).

L'objectif est de :
1. Creer une Edge Function qui lit les PDFs, les envoie a un modele IA pour extraction structuree, et stocke les donnees enrichies en base
2. Mettre a jour le PDP pour afficher ces vraies donnees
3. Redesigner le PDP inspire du style epure de l'image de reference (layout spacieux, typographie audacieuse, hierarchie visuelle forte)

---

## Architecture

### Etape 1 : Table de donnees produit enrichies

Creer une table `product_enriched_data` avec les colonnes suivantes :

- `id` (uuid, PK)
- `shopify_product_title` (text, unique) -- pour matcher avec les produits Shopify
- `pdf_filename` (text) -- nom du PDF source
- `summary` (text) -- resume court du produit (2-3 phrases)
- `key_benefits` (jsonb) -- tableau de { title, description, icon_hint }
- `ingredients_detailed` (jsonb) -- tableau de { name, dosage, role, source }
- `suggested_use` (jsonb) -- { dosage, timing, with_food, notes }
- `science_data` (jsonb) -- { tldr, study_bullets: [], sources: [{ title, url, year }] }
- `safety_warnings` (jsonb) -- { contraindications: [], interactions: [], pregnancy_safe, allergens: [] }
- `best_for_tags` (text[]) -- ex: ["Athletes", "Stress Relief"]
- `quality_info` (jsonb) -- { certifications: [], manufacturing, testing }
- `faq` (jsonb) -- tableau de { question, answer }
- `coach_tip` (text) -- conseil personnalise du coach IA
- `created_at` / `updated_at` (timestamps)

RLS : lecture publique (les fiches sont visibles par tous), ecriture limitee au service_role.

### Etape 2 : Edge Function `parse-product-pdfs`

Une Edge Function qui :
1. Liste tous les PDFs du bucket `vitasyncdata/VitaSync_Product_Data/`
2. Pour chaque PDF, telecharge le contenu binaire
3. Envoie le contenu au modele IA (Gemini 2.5 Flash via Lovable AI) avec un prompt structure demandant d'extraire les informations dans le format JSON defini
4. Insere/met a jour la ligne dans `product_enriched_data`

Le matching PDF -> produit Shopify sera fait par le titre extrait du PDF (l'IA l'extraira du contenu) ou par le nom du fichier.

L'Edge Function sera invoquee manuellement (via un appel HTTP) et pourra traiter tous les PDFs en batch.

**Note importante** : Les PDFs binaires ne peuvent pas etre lus directement par du texte. L'Edge Function utilisera `pdf-parse` ou enverra le PDF en base64 a l'IA multimodale (Gemini) qui sait lire les PDFs.

### Etape 3 : Mise a jour du PDP

Le `ProductDetailMaster` chargera les donnees enrichies depuis `product_enriched_data` en plus des donnees Shopify. Chaque section sera mise a jour :

**Sections impactees :**

1. **WhatItDoes** : Remplacer les benefices generiques par `key_benefits` reels avec descriptions detaillees
2. **HowToTake** : Utiliser `suggested_use` structure (dosage precis, moment optimal, avec/sans nourriture)
3. **IngredientsLabel** : Afficher `ingredients_detailed` avec dosage et role de chaque ingredient
4. **ScienceSection** : Remplacer les placeholders par de vrais `study_bullets` et `sources` avec liens reels
5. **SafetyCautions** : Afficher les vraies `contraindications`, `interactions` et allergenes
6. **QualitySourcing** : Utiliser `quality_info` reelles (certifications, lieu de fabrication, tests)
7. **ProductFAQ** : Remplacer les FAQ generiques par les `faq` reelles extraites des PDFs
8. **QuickBenefitsStrip** : Utiliser `best_for_tags` reels
9. **ProductPurchaseBox** : Afficher le `summary` reel comme sous-titre

### Etape 4 : Redesign du PDP (inspire de l'image de reference)

En s'inspirant du design de reference (Speko shoes) :

- **Layout Hero** : Galerie d'images plus grande (8/12 colonnes au lieu de 7/12), avec la Purchase Box plus compacte et sticky
- **Typographie audacieuse** : Titre produit en tres grande taille (text-4xl lg:text-5xl), font-bold, avec un espacement serre
- **Fond neutre** : Sections alternees avec fond leger (bg-muted/10) et fond blanc pour creer un rythme visuel
- **Navigation numerotee** : Optionnel, un indicateur de section sur le cote droit (01, 02, 03...) comme dans le design de reference
- **Selecteur de variantes visuellement riche** : Pastilles couleur pour les saveurs au lieu de boutons texte
- **Sections plus aérées** : Plus d'espacement vertical (py-12 au lieu de py-8), max-w-4xl pour le texte
- **Barre d'annonce en haut** : "Livraison gratuite des 50EUR" (optionnel)

---

## Fichiers a creer

1. `supabase/functions/parse-product-pdfs/index.ts` -- Edge Function de parsing batch
2. Migration SQL pour la table `product_enriched_data`

## Fichiers a modifier

1. `src/components/dashboard/pdp/ProductDetailMaster.tsx` -- charger les donnees enrichies, nouveau layout
2. `src/components/dashboard/pdp/WhatItDoes.tsx` -- donnees reelles + redesign
3. `src/components/dashboard/pdp/HowToTake.tsx` -- donnees structurees reelles
4. `src/components/dashboard/pdp/IngredientsLabel.tsx` -- ingredients detailles
5. `src/components/dashboard/pdp/ScienceSection.tsx` -- vrais etudes et sources
6. `src/components/dashboard/pdp/SafetyCautions.tsx` -- vraies precautions
7. `src/components/dashboard/pdp/QualitySourcing.tsx` -- vraies certifications
8. `src/components/dashboard/pdp/ProductFAQ.tsx` -- vraies FAQ
9. `src/components/dashboard/pdp/QuickBenefitsStrip.tsx` -- vrais tags
10. `src/components/dashboard/pdp/ProductPurchaseBox.tsx` -- redesign + resume reel
11. `src/components/dashboard/pdp/ProductGallery.tsx` -- galerie agrandie
12. `src/components/dashboard/pdp/types.ts` -- nouveaux types pour les donnees enrichies

## Ordre d'execution

1. Creer la table `product_enriched_data` (migration SQL)
2. Creer l'Edge Function `parse-product-pdfs`
3. Deployer et executer l'Edge Function pour parser tous les PDFs
4. Modifier le `ProductDetailMaster` pour charger les donnees enrichies
5. Mettre a jour chaque section du PDP avec les donnees reelles
6. Appliquer le redesign sur toutes les sections
