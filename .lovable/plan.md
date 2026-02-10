

# Enrichir le Coach IA avec le Suivi des Complements et les Donnees Scientifiques PDF

## Objectif

Donner au Coach IA (Orbita) acces a deux sources de donnees supplementaires pour des conseils ultra-personnalises :

1. **Suivi des complements** (`supplement_tracking`) -- ce que l'utilisateur prend actuellement, ses dosages, ses horaires
2. **Donnees scientifiques enrichies** (`product_enriched_data`) -- les 92 fiches PDF parsees (ingredients, dosages, etudes, interactions, FAQ, etc.)

## Ce qui change pour l'utilisateur

- L'IA saura exactement quels complements vous prenez deja et pourra eviter les doublons ou interactions
- L'IA pourra citer des donnees scientifiques reelles (etudes, dosages recommandes, contre-indications) au lieu de reponses generiques
- Les recommandations seront plus precises et contextualisees

## Plan technique

### 1. Recuperer le suivi des complements de l'utilisateur

Dans la Edge Function `ai-coach`, ajouter une requete vers `supplement_tracking` pour recuperer les complements actifs de l'utilisateur (nom, dosage, moment de prise, recommande par l'IA ou non).

### 2. Recuperer les donnees enrichies des produits (PDFs)

Ajouter une requete vers `product_enriched_data` pour charger un resume des donnees scientifiques de chaque produit du catalogue (bienfaits, ingredients detailles, contre-indications, interactions, conseils de prise).

### 3. Injecter ces donnees dans le System Prompt

Ajouter deux nouvelles sections au prompt systeme :

- **"COMPLEMENTS ACTUELS DE L'UTILISATEUR"** -- liste des complements suivis avec dosage et horaire
- **"BASE DE CONNAISSANCES SCIENTIFIQUES"** -- pour chaque produit enrichi : resume, ingredients cles, interactions, contre-indications, conseils de prise

### 4. Mettre a jour les instructions du prompt

Ajouter des directives pour que l'IA :
- Verifie les interactions entre les complements actuels et tout nouveau produit recommande
- Cite les donnees scientifiques reelles (etudes, dosages) quand elle parle d'un produit
- Evite de recommander des produits que l'utilisateur prend deja
- Alerte sur les contre-indications en fonction du profil (allergies, grossesse, etc.)

### 5. Optimisation de la taille du contexte

Les 92 fiches enrichies sont volumineuses. Pour rester dans les limites du contexte :
- Charger un format condense (titre, resume, ingredients principaux, interactions, contre-indications) plutot que l'integralite des donnees
- Limiter a environ 50-80 tokens par produit dans le prompt
- Les FAQ et etudes detaillees seront disponibles a la demande si l'utilisateur pose une question specifique sur un produit

### Fichiers modifies

| Fichier | Modification |
|---|---|
| `supabase/functions/ai-coach/index.ts` | Ajout de `fetchUserSupplements()` et `fetchEnrichedProductData()`, injection dans `buildEnrichedSystemPrompt()`, nouvelles directives dans le prompt |

