

# Plan d'amélioration UX/UI de la Boutique et des Fiches Produit

## Objectif
Transformer la boutique et les pages produit en une expérience e-commerce premium qui maximise la conversion, en s'inspirant des meilleures pratiques (Apple Store, Ritual, AG1, Myprotein).

---

## 1. Boutique (ShopSection) — Refonte Hero + Grille

**Header immersif :**
- Remplacer le header basique par un hero compact avec gradient de marque, titre accrocheur ("Your Personalized Supplement Store"), et barre de recherche intégrée en plein centre
- Ajouter une barre de progression "Livraison gratuite" (ex: "Plus que 15€ pour la livraison offerte") connectée au panier

**Grille produit améliorée :**
- Ajouter une section "Bestsellers" ou "Trending Now" en haut (carousel horizontal) avant la grille principale
- Badge "Bestseller" / "Nouveau" sur les cartes concernées

**Fichiers modifiés :** `src/components/dashboard/ShopSection.tsx`

---

## 2. Carte Produit (ProductGroupCard) — Conversion maximale

**Améliorations visuelles :**
- Afficher le prix d'abonnement barré/remisé directement sur la carte (comme dans le widget AI Recommendations), pas juste un hint discret
- Ajouter un badge "Économisez X%" bien visible en vert sur les produits avec abonnement
- Bouton "Ajouter" plus grand et plus contrasté, avec texte complet visible même sur mobile (pas de `hidden sm:inline`)
- Micro-animation de confetti ou pulse sur le bouton après ajout

**Social proof renforcé :**
- Afficher "X personnes regardent ce produit" (simulé) ou "Ajouté X fois cette semaine"

**Fichiers modifiés :** `src/components/dashboard/shop/ProductGroupCard.tsx`

---

## 3. Fiche Produit (PDP) — Expérience immersive

**Zone d'achat (ProductPurchaseBox) :**
- Mettre en avant l'abonnement de manière plus agressive : card premium avec bordure accent, comparaison visuelle côte-à-côte "Achat unique vs Abonnement" avec les économies annuelles calculées
- Ajouter une barre de confiance sous le bouton d'achat : icônes "Livraison gratuite", "Satisfait ou remboursé", "Paiement sécurisé"
- Urgence subtile : "X en stock" ou "Commandez avant 14h pour une expédition aujourd'hui"

**Section "Pourquoi s'abonner" :**
- Ajouter un bloc visuel listant les avantages de l'abonnement (économies, pas de rupture, annulation facile)

**Fichiers modifiés :** `src/components/dashboard/pdp/ProductPurchaseBox.tsx`, `src/components/dashboard/pdp/ProductDetailMaster.tsx`

---

## 4. Panier (CartDrawer) — Incitation au checkout

**Améliorations :**
- Ajouter une barre de progression "Livraison gratuite" en haut du panier
- Section "Vous pourriez aussi aimer" avec 2-3 produits IA en bas du panier (cross-sell)
- Bouton checkout plus imposant avec animation pulse et mention "Paiement sécurisé"

**Fichiers modifiés :** `src/components/dashboard/CartDrawer.tsx`

---

## 5. Traductions

- Ajouter toutes les nouvelles clés i18n dans les 6 langues (FR, EN, ES, AR, ZH, PT)

**Fichiers modifiés :** `src/lib/i18n.ts`

---

## Résumé technique

| Fichier | Action |
|---|---|
| `ShopSection.tsx` | Hero compact, barre livraison gratuite, section trending |
| `ProductGroupCard.tsx` | Prix abo visible, badge économie, bouton amélioré |
| `ProductPurchaseBox.tsx` | Comparaison abo vs unique, barre de confiance, urgence |
| `ProductDetailMaster.tsx` | Bloc "Pourquoi s'abonner" |
| `CartDrawer.tsx` | Barre livraison, cross-sell, bouton checkout premium |
| `i18n.ts` | Nouvelles clés de traduction (6 langues) |

