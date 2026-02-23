

## Plan : Corriger l'affichage des produits (erreur 401 Storefront API)

### Diagnostic

Le token Storefront (`5ec910af19d9aa3b391d303a0e2e8891`) retourne une erreur **401 Unauthorized** sur toutes les requetes. La boutique Shopify est protegee par mot de passe, ce qui bloque l'API Storefront cote client. En revanche, l'API Admin (via le secret `SHOPIFY_ACCESS_TOKEN` stocke cote serveur) fonctionne parfaitement -- les 100 produits sont accessibles.

### Solution : Proxy via une fonction backend

Creer une fonction backend `shopify-storefront-proxy` qui recoit les requetes GraphQL du frontend et les transmet a l'API **Admin** de Shopify (qui n'est pas bloquee). Le frontend appellera cette fonction au lieu de contacter Shopify directement.

```text
Frontend  -->  Edge Function (shopify-storefront-proxy)  -->  Shopify Admin API
                  (utilise SHOPIFY_ACCESS_TOKEN)                (fonctionne)
```

### Fichiers a modifier/creer

**1. Creer `supabase/functions/shopify-storefront-proxy/index.ts`**

- Accepte un body JSON contenant `{ query, variables }`
- Transmet la requete a l'API Admin GraphQL de Shopify (`https://vitasync2.myshopify.com/admin/api/2025-07/graphql.json`)
- Utilise le header `X-Shopify-Access-Token` avec le secret `SHOPIFY_ACCESS_TOKEN`
- Retourne la reponse JSON de Shopify au frontend
- Gestion CORS incluse

**2. Modifier `src/lib/shopify.ts`**

- Modifier la fonction `storefrontApiRequest` pour envoyer les requetes via la fonction backend au lieu de contacter Shopify directement
- L'URL cible devient l'endpoint de la fonction backend
- Le token Storefront n'est plus envoye cote client (securite amelioree)
- Le reste du code (queries GraphQL, pagination, fonctions utilitaires) reste inchange

**3. Mettre a jour `supabase/functions/ai-shop-recommendations/index.ts`**

- Utiliser aussi l'API Admin au lieu de l'API Storefront pour eviter le meme probleme 401

### Details techniques

- L'API Admin GraphQL de Shopify utilise le meme schema que l'API Storefront pour les queries de lecture (products, variants, images) -- les queries existantes fonctionneront sans modification
- Le secret `SHOPIFY_ACCESS_TOKEN` est deja configure dans le projet
- La pagination par curseur deja implementee restera fonctionnelle
- Les 100 produits seront tous recuperes grace a la pagination existante (250 par batch)

### Securite

- Le token Admin n'est jamais expose cote client
- La fonction backend agit comme un proxy securise
- Pas de modification de la base de donnees ni des politiques RLS

### Resultat attendu

- Les 100 produits de la boutique s'affichent correctement dans la section Boutique
- Les fiches produits (PDP) fonctionnent
- Le Coach IA peut acceder au catalogue pour ses recommandations
- Aucun changement visible pour l'utilisateur final

