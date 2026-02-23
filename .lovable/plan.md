## Plan : Corriger le token Storefront + Integrer les abonnements Shopify natifs

### Probleme principal

L'API Shopify Storefront retourne **401 UNAUTHORIZED** pour toutes les requetes. Le token d'acces actuel (`5ec910af...`) a ete revoque quand tu as change d'application d'abonnement. Aucun produit ne peut s'afficher.

### Etape 1 : Regenerer le token Storefront

Le token doit etre regenere depuis l'admin Shopify :

1. Aller dans **Shopify Admin** (Settings > Apps and sales channels > Develop apps)
2. Ouvrir l'app existante (ou en creer une nouvelle) avec les scopes :
  - `unauthenticated_read_product_listings` (obligatoire)
  - `unauthenticated_read_selling_plans` (pour les abonnements)
3. Installer l'app et copier le nouveau **Storefront access token**

Je te demanderai de fournir ce nouveau token et je le configurerai comme secret securise dans le projet (au lieu du token en dur dans le code).

### Etape 2 : Utiliser un secret pour le token (plus securise)

Actuellement le token est en dur dans `src/lib/shopify.ts`. Je vais :

- Stocker le nouveau token comme secret backend
- Creer une edge function proxy qui fait les appels Shopify avec le token securise
- OU le stocker comme variable d'environnement securisee

### Etape 3 : Integrer les abonnements (Shopify Subscriptions natif)

L'application "Shopify Subscriptions" (gratuite, creee par Shopify) gere les selling plans. D'apres ton fichier Excel, 109 produits doivent avoir des abonnements en 30, 60 et 90 jours.

**Le code existant est deja pret** pour les abonnements :

- Les queries GraphQL incluent `sellingPlanGroups` 
- Le `ProductPurchaseBox` a deja le toggle One-time / Subscribe
- Le `ProductGroupCard` affiche deja le badge "Save X%"
- Le `cartStore` supporte deja `sellingPlanId`

Si le scope `unauthenticated_read_selling_plans` est actif dans le nouveau token, tout fonctionnera automatiquement.

### Etape 4 : Correction des images Supplement Facts

Deja en place avec la logique heuristique dans `IngredientsLabel.tsx` -- sera testable une fois les produits charges.

### Fichiers modifies


| Fichier              | Changement                                              |
| -------------------- | ------------------------------------------------------- |
| `src/lib/shopify.ts` | Mettre a jour le token Storefront avec le nouveau token |


### Ce dont j'ai besoin de toi

1. **Generer un nouveau token Storefront** depuis l'admin Shopify avec les scopes adequats (Le voici : unauthenticated_read_product_listings (2602fe4763e52cfd2bc82898b8bc59ec) )
2. Me le communiquer pour que je le configure dans le projet

### Resultat attendu

- Tous les produits s'affichent a nouveau dans la boutique
- Les abonnements (30/60/90 jours) apparaissent sur les fiches produits
- Le toggle Subscribe and Save fonctionne avec le checkout Shopify