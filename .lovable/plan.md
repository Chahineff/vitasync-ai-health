

# Plan : Corrections Stack IA + Quiz centré + Checkout Shopify

## 1. Bouton "S'abonner" → Checkout Shopify direct

**Fichier : `src/components/dashboard/chat/AIStackPanel.tsx`**

Le `handleSubscribe` actuel ajoute les produits au cart store mais ne redirige pas vers le checkout. Modifier pour :
- Après avoir ajouté tous les items au cart via `addToCart()`, récupérer le `checkoutUrl` depuis `useCartStore`
- Ouvrir le checkout Shopify avec `window.open(checkoutUrl, '_blank')`
- Ne pas appeler `clearStack()` immédiatement (le cart sync s'en chargera au retour)

## 2. Quiz : centrer l'overlay verticalement

**Fichier : `src/components/dashboard/chat/ChatQuizBlock.tsx`**

L'overlay utilise déjà `flex items-center justify-center` sur le conteneur `fixed inset-0`, mais le contenu interne a `max-h-[75vh]` et `overflow-y-auto` sans centrage garanti quand le contenu est court. Ajuster :
- Ajouter `m-auto` sur le conteneur interne du quiz
- S'assurer que le scroll interne ne décale pas le centrage visuel (séparer le header sticky du body scrollable)

## 3. Bouton Stack IA plus visible et persistant en haut à droite

**Fichier : `src/components/dashboard/ChatInterface.tsx`**

Le bouton stack actuel (lignes 414-426) est petit et peu visible. Modifier pour :
- Élargir le bouton : au lieu d'un simple icône rond, afficher un bouton avec texte "Mon Stack IA" + badge compteur + fond gradient
- Le rendre plus large (`px-4 py-2`) avec le texte visible
- Garder la condition `stackItems.length > 0` pour ne l'afficher que quand il y a des items
- Ajouter une animation pulse/glow quand de nouveaux items sont ajoutés

## 4. Produits ajoutés au stack → aussi ajoutés au supplement tracker

**Fichier : `src/components/dashboard/chat/AIStackPanel.tsx`**

Quand l'utilisateur clique "S'abonner", en plus d'ajouter au panier Shopify, insérer les produits dans la table `supplement_tracking` via Supabase pour que le stack de l'utilisateur soit mis à jour côté tracking/dashboard.

---

## Fichiers impactés

| Fichier | Modification |
|---|---|
| `AIStackPanel.tsx` | Redirect checkout Shopify + ajout supplement_tracking |
| `ChatQuizBlock.tsx` | Centrage vertical de l'overlay |
| `ChatInterface.tsx` | Bouton stack élargi, visible, avec texte |

