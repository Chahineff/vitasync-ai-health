

## Améliorations proposées pour la Boutique

### A. Améliorations de Design

1. **Skeleton Loading Premium**
   - Remplacer les 3 dots animés par des cartes skeleton (shimmer effect) qui imitent la grille de produits. Donne une perception de chargement plus rapide et professionnelle.

2. **Quick View Modal (aperçu rapide)**
   - Au survol ou clic sur un icone oeil, afficher un modal/drawer avec l'image large, la description, le sélecteur de variantes et le bouton "Ajouter au panier" — sans quitter la grille. Réduit la friction d'achat.

3. **Compteur de résultats + badge actif sur les filtres**
   - Afficher le nombre de produits trouvés à côté du titre "Boutique". Ajouter un badge numérique sur chaque catégorie pill montrant le nombre de produits dans cette catégorie.

4. **Back to Top flottant**
   - Ajouter un bouton flottant "Retour en haut" qui apparaît quand l'utilisateur scrolle au-delà de la première page de résultats. Améliore la navigation sur les longues listes.

5. **Empty state plus engageant**
   - Remplacer le simple icone panier + texte par une illustration animée avec un CTA "Explorer toutes les catégories" qui reset les filtres.

6. **Amélioration du CartDrawer**
   - Ajouter une barre de progression "Livraison gratuite à partir de X€" en haut du drawer. Ajouter des suggestions de produits complémentaires ("Vous pourriez aussi aimer") en bas quand le panier a des articles.

### B. Améliorations Fonctionnelles

7. **Filtre par fourchette de prix (slider intégré)**
   - Le composant `ShopFilters` a déjà un slider de prix mais il n'est pas utilisé dans `ShopSection.tsx`. L'intégrer directement dans la barre de filtres secondaires avec un bouton toggle, pas dans un composant séparé.

8. **Favoris / Wishlist**
   - Ajouter un coeur sur chaque carte produit pour sauvegarder en favoris (localStorage ou table Supabase `wishlists`). Ajouter un filtre "Mes favoris" dans les catégories.

9. **Tri par popularité / nouveautés**
   - Ajouter des options de tri "Nouveautés" (basé sur `createdAt`) et "Populaires" au dropdown de tri existant.

10. **Recherche améliorée avec suggestions populaires**
    - Quand le champ de recherche est ouvert et vide, afficher des tags de recherches populaires ("Whey", "Créatine", "Oméga-3") pour guider l'utilisateur.

### C. Plan d'implémentation

**Fichiers impactés :**
- `src/components/dashboard/ShopSection.tsx` — Skeleton loading, compteur résultats, back to top, price slider intégré
- `src/components/dashboard/shop/ProductGroupCard.tsx` — Icone favoris, bouton quick view
- `src/components/dashboard/shop/SearchOverlay.tsx` — Tags de recherches populaires
- `src/components/dashboard/CartDrawer.tsx` — Barre livraison gratuite, suggestions complémentaires, i18n
- `src/components/dashboard/shop/Pagination.tsx` — Scroll behavior amélioré
- `src/lib/i18n.ts` — Nouvelles clés de traduction
- Potentiellement un nouveau composant `QuickViewModal.tsx`

**Priorité suggérée :**
1. Skeleton loading + compteur résultats + empty state (quick wins visuels)
2. Price slider intégré + tri nouveautés/populaires (filtres fonctionnels)
3. CartDrawer amélioré (barre livraison gratuite + suggestions)
4. Quick View Modal (réduction friction d'achat)
5. Favoris / Wishlist (engagement utilisateur)
6. Recherche avec suggestions populaires
7. Back to top flottant

