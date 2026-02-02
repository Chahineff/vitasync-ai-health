

# Plan de correction : Intégration Shopify complète

## Problèmes identifiés

Après analyse des logs réseau, j'ai identifié les problèmes suivants :

1. **Token Storefront vide** : La requête Shopify échoue avec une erreur 400 car l'en-tête `X-Shopify-Storefront-Access-Token` est vide
2. **Limite de produits** : Le code charge seulement 50 produits au lieu de vos 73
3. **Variables d'environnement** : Le token `VITE_SHOPIFY_STOREFRONT_TOKEN` n'est pas correctement utilisé

## Solution proposée

### Étape 1 : Corriger la configuration du token Storefront

Modifier `src/lib/shopify.ts` pour utiliser le token Storefront correctement en récupérant la valeur directe au lieu de dépendre uniquement des variables d'environnement potentiellement mal configurées :

```text
Fichier: src/lib/shopify.ts
- Utiliser le token fourni par Lovable/Shopify intégré
- Ajouter une meilleure gestion des erreurs pour diagnostiquer les problèmes de token
```

### Étape 2 : Augmenter la limite de produits à 100

Modifier `src/components/dashboard/ShopSection.tsx` :
- Changer `fetchProducts(50)` en `fetchProducts(100)` pour charger tous vos 73 produits

### Étape 3 : Mettre à jour l'Edge Function AI-Coach

Modifier `supabase/functions/ai-coach/index.ts` :
- S'assurer que la fonction récupère les 100 produits pour que le Coach IA ait accès à l'intégralité du catalogue

## Résumé des modifications

| Fichier | Modification |
|---------|--------------|
| `src/lib/shopify.ts` | Utiliser le token Storefront correct avec fallback sécurisé |
| `src/components/dashboard/ShopSection.tsx` | Augmenter la limite de 50 à 100 produits |
| `supabase/functions/ai-coach/index.ts` | Confirmer la limite de 100 produits (déjà en place) |

## Résultat attendu

- Tous les 73 produits seront affichés dans la boutique
- La recherche et les filtres par catégorie fonctionneront
- Le Coach IA aura accès à l'intégralité du catalogue
- Ajout au panier et fiches produit fonctionnels

