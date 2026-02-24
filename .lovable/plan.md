

# Plan : MyStack -- Afficher les vraies donnees Shopify (zero faux contenu)

## Probleme actuel

Plusieurs composants de la page "Mon Stack" affichent des donnees fictives en fallback au lieu de refléter la réalité de l'utilisateur :

| Composant | Donnee fictive | Correction |
|---|---|---|
| NextDeliveryHero | "15 Novembre", statut "Actif" | Afficher "Aucun abonnement actif" si pas de contrat |
| CurrentStackList | Charge des produits Storefront meme sans abonnement | Afficher un etat vide "Votre box est vide" |
| SettingsDangerZone | Adresse "12 Rue de la Sante, 75013 Paris" + VISA 4242 | Afficher "Non defini" avec bouton "Ajouter" |
| CoachingTierSelector | "Go AI" code en dur comme plan actuel | "Gratuit" comme plan par defaut |

---

## Modifications prevues

### 1. NextDeliveryHero -- etat vide realiste

- Si aucun abonnement actif (`subscriptions` vide ou pas de contrat ACTIVE) :
  - Titre : "Aucun abonnement actif"
  - Badge : "Plan gratuit"
  - Desactiver les boutons "Repousser" et "Mettre en pause"
  - Ajouter un CTA "Decouvrir nos formules" qui redirige vers le Shop
- Supprimer le fallback "15 Novembre"

### 2. CurrentStackList -- etat vide sans faux produits

- Quand l'utilisateur n'est pas connecte a Shopify OU n'a pas d'abonnement :
  - Ne plus charger les produits Storefront en fallback
  - Afficher un etat vide : "Votre prochaine box est vide. Explorez notre boutique pour constituer votre stack."
  - Bouton "Parcourir la boutique"
- Les produits ne s'affichent que si l'utilisateur est connecte ET a de vraies commandes/abonnements

### 3. SettingsDangerZone -- pas de fausses donnees

**Moyen de paiement :**
- Si pas de donnees de paiement : afficher "Aucun moyen de paiement enregistre" avec un bouton "Ajouter"
- Supprimer le fallback "VISA 4242"

**Adresse de livraison :**
- Si `customerData?.defaultAddress` est null : afficher "Aucune adresse enregistree" avec un bouton "Ajouter"
- Supprimer le fallback "12 Rue de la Sante"

### 4. CoachingTierSelector -- plan gratuit par defaut

- Changer `isCurrent` pour que "Basic" (Gratuit) soit le plan actuel par defaut
- "Go AI" et "Premium AI" apparaissent comme options de mise a niveau
- A terme, ce sera connecte au vrai statut d'abonnement de l'utilisateur

---

## Details techniques

**Fichiers modifies :**
- `src/components/dashboard/mystack/NextDeliveryHero.tsx`
- `src/components/dashboard/mystack/CurrentStackList.tsx`
- `src/components/dashboard/mystack/SettingsDangerZone.tsx`
- `src/components/dashboard/mystack/CoachingTierSelector.tsx`

**Aucune modification de base de donnees ou d'edge function requise.** Ce sont uniquement des corrections de logique d'affichage frontend.

