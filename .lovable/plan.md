
## Plan : Correction Boutique + Abonnements IA VitaSync

Ce plan corrige les 3 problèmes identifiés : affichage des produits, calcul d'abonnement par l'IA, et bouton de checkout.

---

### Problème 1 : Les produits ne s'affichent plus

**Cause racine :**
```
"Access denied for sellingPlanGroup field. Required access: 
`unauthenticated_read_selling_plans` access scope."
```

La query `PRODUCTS_QUERY` demande les `sellingPlanGroups` mais le token Storefront n'a pas cette permission. Résultat : la requête ENTIÈRE échoue et retourne `null` au lieu des produits.

**Solution :**
Retirer `sellingPlanGroups` de la query principale et la mettre dans une query séparée (optionnelle).

**Fichier : `src/lib/shopify.ts`**

| Avant | Après |
|-------|-------|
| Query unique avec sellingPlanGroups | Query produits SANS sellingPlanGroups + Query séparée optionnelle |
| Échec total si permission manquante | Fonctionne toujours, selling plans en bonus |

```typescript
// Query principale simplifiée (SANS sellingPlanGroups)
const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          productType
          vendor
          priceRange { ... }
          images(first: 5) { ... }
          variants(first: 10) { ... }
          options { ... }
          // RETIRER: sellingPlanGroups
        }
      }
    }
  }
`;
```

---

### Problème 2 : L'IA ne génère pas les abonnements correctement

**Cause :**
- L'IA a accès au catalogue (nom, prix, ID) mais pas aux quantités par pack
- Elle doit calculer les packs nécessaires et le prix avec remise 10%
- Elle doit générer les données exactes pour le checkout Shopify

**Solution :**
Enrichir le prompt IA avec :
1. Les quantités par pack par défaut (30 doses)
2. Le format exact de sortie avec les vrais variant IDs
3. La logique de calcul intégrée

**Fichier : `supabase/functions/ai-coach/index.ts`**

Modifications au `fetchShopifyCatalog()` et au prompt :

```typescript
// Enrichir le catalogue avec quantités estimées
const catalogLines = products.map((edge) => {
  const p = edge.node;
  const variant = p.variants.edges[0]?.node;
  const price = variant?.price?.amount || '0';
  const productId = p.id.split('/').pop();
  const variantId = variant?.id || '';
  
  // Estimer pack_units basé sur le type de produit
  let packUnits = 30; // Default
  const title = p.title.toLowerCase();
  if (title.includes('powder') || title.includes('poudre')) {
    packUnits = 30; // ~30 scoops
  } else if (title.includes('capsule') || title.includes('gummies')) {
    packUnits = 60; // Souvent 60 capsules
  }
  
  return `- ${p.title}
    ProductID: ${productId}
    VariantID: ${variantId}
    Prix: ${price}$
    Type: ${p.productType}
    Pack: ~${packUnits} doses
    Format: [[PRODUCT:${productId}:${variantId}:${p.title}:${price}$]]`;
});
```

**Nouveau playbook dans le prompt :**

```
PLAYBOOK ABONNEMENT - FORMAT EXACT
═══════════════════════════════════

Quand tu proposes un abonnement, tu DOIS:

1. Identifier les produits du catalogue avec leurs vrais IDs
2. Calculer: packs_needed = ceil(dose_par_jour * 30 / pack_units)
3. Appliquer remise: prix_final = prix_original * 0.90

FORMAT OBLIGATOIRE:

📦 TON ABONNEMENT MENSUEL (-10%)
[[SUBSCRIPTION_START]]
- Produit: Créatine | VariantID: gid://shopify/ProductVariant/123 | Dose: 1/jour | Packs: 1/mois | Prix: 26.99$ (-10%)
- Produit: Ashwagandha | VariantID: gid://shopify/ProductVariant/456 | Dose: 1/jour | Packs: 1/mois | Prix: 22.49$ (-10%)
[[SUBSCRIPTION_END]]

💰 TOTAL: 49.48$/mois (économie de 5.50$)

👉 Clique sur "Créer mon abonnement" pour finaliser !
```

---

### Problème 3 : Bouton Abonnement → Checkout Shopify

**Cause :**
Le `SubscriptionCard` affiche un toast informatif au lieu de créer un vrai panier Shopify.

**Solution :**
Modifier le composant pour :
1. Parser les variant IDs depuis la réponse IA
2. Créer un cart Shopify avec les quantités calculées
3. Rediriger vers le checkout avec la remise appliquée

**Fichier : `src/components/dashboard/SubscriptionCard.tsx`**

```typescript
const handleCreateSubscription = async () => {
  setIsCreating(true);
  try {
    // Créer le panier Shopify avec les produits
    const items = subscription.items.map(item => ({
      variantId: item.variantId, // Récupéré depuis la réponse IA
      quantity: item.packsPerMonth,
    }));

    const result = await createShopifyCart(items);
    
    if (result?.checkoutUrl) {
      // Ouvrir le checkout dans un nouvel onglet
      window.open(result.checkoutUrl, '_blank');
      toast.success("Panier créé ! Finalise ton achat.");
    }
  } catch (error) {
    toast.error("Erreur lors de la création du panier");
  } finally {
    setIsCreating(false);
  }
};
```

**Fichier : `src/lib/subscription-calculator.ts`**

Ajouter le parsing du VariantID :

```typescript
export interface ParsedSubscriptionItem {
  productName: string;
  variantId: string; // NOUVEAU
  dosePerDay: number;
  packsPerMonth: number;
  priceAfterDiscount: number;
  originalPrice: number;
}

// Nouveau regex pour capturer VariantID
const lineRegex = /Produit:\s*([^|]+)\s*\|\s*VariantID:\s*([^|]+)\s*\|\s*Dose:\s*(\d+)\/jour\s*\|\s*Packs:\s*(\d+)\/mois\s*\|\s*Prix:\s*([\d.]+)\$/gi;
```

---

### Récapitulatif des Fichiers

| Action | Fichier | Priorité |
|--------|---------|----------|
| Modifier | `src/lib/shopify.ts` | **Critique** (produits invisibles) |
| Modifier | `supabase/functions/ai-coach/index.ts` | Haute |
| Modifier | `src/lib/subscription-calculator.ts` | Haute |
| Modifier | `src/components/dashboard/SubscriptionCard.tsx` | Haute |

---

### Flow Utilisateur Final

```text
1. Utilisateur: "Je veux un stack énergie + sommeil en abonnement"

2. AI Coach:
   - Identifie les produits recommandés (Créatine, Ashwagandha, Magnésium)
   - Récupère les vrais IDs variants du catalogue
   - Calcule: 1 dose/jour × 30 jours ÷ 30 doses/pack = 1 pack/mois
   - Applique -10%: 29.99$ × 0.90 = 26.99$
   - Génère le bloc [[SUBSCRIPTION_START]]...[[SUBSCRIPTION_END]]

3. Interface:
   - Parse la réponse et affiche SubscriptionCard
   - Montre le récapitulatif avec prix barrés et remise
   - Gros bouton "Créer mon abonnement"

4. Clic sur bouton:
   - Crée cart Shopify avec les variant IDs
   - Ouvre checkout URL dans nouvel onglet
   - Utilisateur finalise le paiement
```

---

### Ordre d'Implémentation

1. **Correction critique** : Retirer `sellingPlanGroups` de PRODUCTS_QUERY → les produits s'affichent
2. **Enrichir le catalogue IA** : Ajouter variant IDs + pack units au prompt
3. **Parser VariantID** : Mettre à jour `parseSubscriptionBlock()`
4. **Bouton Checkout** : Créer le cart Shopify avec redirection
5. **Test end-to-end** : Demander un abonnement et vérifier le checkout

---

### Note Importante

**Remise 10% :** Shopify n'a pas de Selling Plans configurés (d'où l'erreur de permission). La remise sera affichée côté IA mais pas appliquée automatiquement au checkout Shopify. Options futures :
- Configurer les Selling Plans dans Shopify Admin
- Créer un code promo "ABONNEMENT10" à appliquer au checkout
- Utiliser une app d'abonnement (Recharge, Bold, Appstle)

Pour l'instant, le système créera un panier normal et l'IA mentionnera la remise comme "économie estimée".
