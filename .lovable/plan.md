

# Plan : MyStack -- Banniere plein ecran + gestion paiement/adresse depuis VitaSync

## Objectif

1. La banniere "Connectez votre compte Shopify" occupe tout l'espace quand l'utilisateur n'est pas connecte -- seul le selecteur de coaching IA reste visible en dessous.
2. Une fois connecte, tout le reste s'affiche (abonnement, stack, historique, parametres).
3. L'adresse de livraison est modifiable directement depuis VitaSync (deja fait via AddressModal, a verifier).
4. Pour le moyen de paiement : l'API Shopify Customer Account ne permet PAS de gerer les moyens de paiement (c'est reserve a l'Admin API dans un environnement PCI-compliant). On redirigera donc vers la page de compte Shopify du client, mais avec un message clair et un bouton bien integre.

---

## Modifications prevues

### 1. MyStackSection -- Layout conditionnel

Quand `!isConnected && !isLoading` :
- Afficher la ShopifyConnectBanner en version **plein ecran** (grande, centree, avec illustration)
- Afficher **uniquement** CoachingTierSelector en dessous
- Masquer NextDeliveryHero, CurrentStackList, OrderHistory, SettingsDangerZone

Quand `isConnected` :
- Masquer la banniere
- Afficher tous les composants normalement

### 2. ShopifyConnectBanner -- Version plein ecran

Transformer la banniere actuelle en un composant plus imposant :
- Icone plus grande, centree
- Titre plus grand et descriptif
- Liste de benefices (gerer vos abonnements, suivre vos commandes, modifier vos adresses)
- Bouton CTA proéminent au centre
- Prend toute la largeur avec plus de padding vertical

### 3. SettingsDangerZone -- Moyen de paiement

Le moyen de paiement reste un **lien externe** vers la page de compte Shopify car :
- L'API Customer Account ne supporte pas la gestion des moyens de paiement
- L'Admin API necessite un environnement PCI-compliant et des scopes specifiques (`write_customer_payment_methods`)
- C'est la pratique standard de Shopify Headless

On ameliore le bouton avec un message clair : "Gerer sur Shopify" avec une icone de lien externe.

### 4. AddressModal -- Verification du fonctionnement

Le composant AddressModal utilise deja la mutation `customerAddressCreate` via le proxy `shopify-customer-api`. Il envoie bien les donnees a Shopify. On s'assure que :
- La mutation utilise les bons champs (`address1`, `city`, `zip`, `territoryCode`)
- Le `defaultAddress: true` est bien passe pour definir comme adresse par defaut
- Le callback `onSuccess` rafraichit les donnees apres la sauvegarde

---

## Details techniques

**Fichiers modifies :**
- `src/components/dashboard/mystack/MyStackSection.tsx` -- layout conditionnel (banner + coaching seuls quand deconnecte)
- `src/components/dashboard/mystack/ShopifyConnectBanner.tsx` -- version plein ecran avec avantages listes
- `src/components/dashboard/mystack/SettingsDangerZone.tsx` -- ameliorer le bouton de paiement avec icone externe

**Aucune edge function ou migration necessaire.** Le proxy `shopify-customer-api` gere deja les mutations d'adresse et les queries de commandes.

**Limitation technique :** La gestion des moyens de paiement directement depuis VitaSync n'est techniquement pas possible avec l'API Customer Account de Shopify. C'est une limitation de Shopify, pas de l'implementation. Le lien vers la page de compte Shopify est la solution standard pour les storefronts headless.

