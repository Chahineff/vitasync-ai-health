

# Refonte du Suivi des Complements

## Problemes identifies

1. **Noms de produits incorrects** : La table `supplement_tracking` stocke parfois des references Shopify brutes (ex: `//shopify/ProductVariant/53169275704`) au lieu du vrai nom du produit. Il faut resoudre ce probleme a l'affichage en fetching le nom reel depuis Shopify via le `shopify_product_id`.

2. **Pas d'images produit** : La checklist actuelle n'affiche que du texte, sans miniature du produit.

3. **Pas de gestion manuelle** : Le bouton "+" en haut a droite ne fait rien. Il n'y a pas de modale pour ajouter manuellement un complement, ni de bouton pour supprimer.

4. **Widget trop petit** : Le tracker est dans une grille `grid-cols-2` avec le ProgressChart sur la page home. Sur la page "supplements", il est limite a `max-w-2xl`.

5. **Pas d'analyse IA** : Aucun panneau d'insights IA sur la regularite et l'utilite des complements.

---

## Solution proposee

### 1. Affichage correct des noms + images produit

**Fichier : `src/components/dashboard/SupplementTrackerEnhanced.tsx`**

- Chaque `SupplementItem` recoit le `shopify_product_id` en plus du `product_name`
- Au montage du composant, on fetch les details produit depuis Shopify (`fetchProductById`) pour recuperer :
  - Le **vrai titre** du produit (remplace les references cassees)
  - La **miniature** (premiere image)
- Un cache local (Map) evite de refetch a chaque render
- L'image s'affiche en 32x32px arrondies a gauche de la checkbox

### 2. Ajout/Suppression manuelle de complements

**Fichier : `src/components/dashboard/SupplementTrackerEnhanced.tsx`** (+ nouveau composant)

- **Bouton "+"** : ouvre une modale/sheet permettant de :
  - Chercher un produit dans le catalogue Shopify (champ de recherche)
  - Choisir le moment de prise (matin/soir)
  - Optionnellement saisir un dosage
  - Confirmer l'ajout via `addSupplement()`
- **Bouton supprimer** : un swipe ou un petit bouton "X" sur chaque `SupplementItem` pour appeler `removeSupplement(id)`
- Un nouveau composant `AddSupplementModal.tsx` sera cree

### 3. Layout elargi avec panneau IA

**Fichier : `src/pages/Dashboard.tsx`**

- Section "supplements" : retirer le `max-w-2xl`, utiliser toute la largeur disponible
- Layout en deux colonnes sur desktop :
  - **Gauche (~60%)** : Le tracker existant (checklist + tabs jour/semaine/mois)
  - **Droite (~40%)** : Nouveau panneau "Analyse IA" avec les insights

**Page Home** : Le tracker reste dans la grille 2 colonnes mais sans le panneau IA (trop compact).

### 4. Panneau d'insights IA (Gemini 3 Pro)

**Nouveau fichier : `src/components/dashboard/SupplementAIInsights.tsx`**

- Affiche l'analyse de l'IA sur :
  - La regularite de prise des complements (basee sur les logs des 7-30 derniers jours)
  - L'utilite de chaque complement par rapport au profil de sante
  - Des recommandations d'ajustement
- Appel a une **nouvelle edge function** `supplement-insights`
- Cache d'un jour via `localStorage` (cle `supplement-insights-date`)
- Bouton "Rafraichir" desactive si deja genere aujourd'hui

**Nouveau fichier : `supabase/functions/supplement-insights/index.ts`**

- Modele : `google/gemini-3-pro-preview`
- Donnees injectees dans le prompt :
  - Profil de sante utilisateur (`user_health_profiles`)
  - Complements suivis actifs (`supplement_tracking`)
  - Logs de prise des 30 derniers jours (`supplement_logs`)
  - Check-ins quotidiens des 7 derniers jours (`daily_checkins`)
  - Derniers echanges avec le Coach IA (10 derniers messages)
- Reponse structuree via tool calling :
  - `regularity_score` (0-100)
  - `regularity_comment` (texte court)
  - `supplement_reviews` (pour chaque complement : utilite, commentaire)
  - `recommendations` (texte general)

---

## Details techniques

### Fichiers crees
1. `src/components/dashboard/AddSupplementModal.tsx` -- Modale d'ajout manuel de complement
2. `src/components/dashboard/SupplementAIInsights.tsx` -- Panneau d'analyse IA
3. `supabase/functions/supplement-insights/index.ts` -- Edge function pour les insights IA

### Fichiers modifies
1. `src/components/dashboard/SupplementTrackerEnhanced.tsx` -- Images, noms corrects, bouton supprimer, bouton "+" fonctionnel
2. `src/pages/Dashboard.tsx` -- Layout elargi pour la section supplements (2 colonnes)
3. `supabase/config.toml` -- Ajout de la config pour `supplement-insights`

### Pas de changement de schema de base de donnees requis
La table `supplement_tracking` a deja toutes les colonnes necessaires (`shopify_product_id`, `product_name`, `dosage`, `time_of_day`, `active`).

