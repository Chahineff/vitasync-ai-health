

# Corrections IA : Recommandations Shop + Coach

## Probleme 1 : AI Recommendations dans la Boutique

### Constat actuel
- La grille est figee a 3 colonnes (`grid-cols-3`), meme si l'IA renvoie 2 ou 4 produits
- Le catalogue de produits est **code en dur** dans l'edge function (15 produits statiques avec des handles fictifs) au lieu d'utiliser le vrai catalogue Shopify
- Le modele utilise est `gemini-3-flash-preview` au lieu de `gemini-3-pro-preview`
- Le bouton Refresh permet de generer de nouvelles recommandations a volonte, sans respecter la limite d'1 par jour
- Aucune analyse de l'historique de conversation avec le Coach IA

### Corrections prevues

**Edge Function `ai-shop-recommendations/index.ts`** :
- Remplacer le catalogue statique par un appel reel a l'API Shopify Storefront (meme logique que dans `ai-coach/index.ts`) pour recuperer titres, descriptions, types, tags, prix et disponibilite
- Changer le modele de `google/gemini-3-flash-preview` a `google/gemini-3-pro-preview`
- Modifier le prompt pour demander entre 2 et 4 produits (au lieu de toujours 3), en laissant l'IA decider du nombre optimal selon le profil
- Ajouter la recuperation des dernieres conversations avec le Coach IA (5 derniers messages) pour enrichir le contexte de recommandation
- Le format de reponse JSON passe de `{"recommendations": [...]}` a `{"recommendations": [...]}` mais sans limitation forcee a 3

**Widget `AIRecommendationsWidget.tsx`** :
- Rendre la grille responsive : `grid-cols-2` pour 2 produits, `grid-cols-3` pour 3, `grid-cols-4` (ou `grid-cols-2 md:grid-cols-4`) pour 4
- Supprimer le fallback aleatoire quand l'IA ne renvoie pas assez de produits (ne pas remplir avec des produits random)
- **Desactiver le bouton Refresh** : une fois le cache du jour rempli, le bouton ne declenche plus de nouvel appel IA. Il affiche un toast "Recommandations deja generees aujourd'hui"
- Accepter 2 a 4 produits au lieu de forcer 3

## Probleme 2 : AI Coach - Changement de modele

### Constat actuel
Le mapping des modeles est **deja correctement implemente** :
- VitaSync 2.0 Flash = `google/gemini-3-flash-preview`
- VitaSync 2.0 Pro = `google/gemini-3-pro-preview`
- VitaSync 1.0 Flash = `google/gemini-2.5-flash`
- VitaSync 1.0 Pro = `google/gemini-2.5-pro`

Le frontend envoie bien `selectedModel.model` dans le body de la requete, et l'edge function le valide contre la liste `ALLOWED_MODELS` avant de l'utiliser. **Aucune modification necessaire** pour cette partie, ca fonctionne deja reellement.

## Details techniques

### Fichiers modifies

1. **`supabase/functions/ai-shop-recommendations/index.ts`** -- Refonte majeure :
   - Ajout de `fetchShopifyCatalog()` (reutilisation de la logique de `ai-coach`)
   - Ajout de la recuperation des conversations recentes de l'utilisateur
   - Changement du modele vers `google/gemini-3-pro-preview`
   - Prompt enrichi avec descriptions completes des produits + historique coach
   - Reponse IA flexible (2-4 produits)

2. **`src/components/dashboard/shop/AIRecommendationsWidget.tsx`** :
   - Grille adaptative selon le nombre de produits
   - Suppression du remplissage aleatoire
   - Bouton Refresh bloque si cache du jour valide (affiche un toast)
   - Accepte entre 2 et 4 produits

### Aucun changement de schema de base de donnees requis
