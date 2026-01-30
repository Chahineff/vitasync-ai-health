

## Plan : VitaSync Subscription Cart Builder (Shopify)

Ce plan implemente un assistant IA qui transforme un stack de supplements en abonnement mensuel Shopify.

---

### Architecture Overview

```text
+------------------------+     +-------------------------+     +------------------+
|   AI Coach (Prompt)    |---->| Subscription Calculator |---->| Shopify Cart API |
| Detects intent:        |     | - Pack size logic       |     | - Selling Plans  |
| "abonnement mensuel"   |     | - 10% discount          |     | - Checkout URL   |
+------------------------+     | - Cadence grouping      |     +------------------+
                               +-------------------------+
                                          |
                                          v
                               +-------------------------+
                               | Subscription Summary UI |
                               | - Price breakdown       |
                               | - Confirm/Adjust        |
                               +-------------------------+
```

---

### Phase 1 : Enrichir les Metafields Produits

**Objectif** : Récupérer les informations nécessaires pour calculer les quantités mensuelles.

**Fichier : `src/lib/shopify.ts`**

Enrichir la query produits pour récupérer les metafields de dose et de conditionnement :

| Metafield | Namespace | Key | Description |
|-----------|-----------|-----|-------------|
| `pack_units` | custom | pack_units | Nombre de doses/capsules par pack (ex: 90) |
| `unit_type` | custom | unit_type | Type d'unité (servings, capsules, gummies) |
| `default_dose` | custom | default_dose | Dose quotidienne par défaut (ex: 1, 2, 3) |
| `selling_plan_monthly` | custom | selling_plan_id | ID du selling plan mensuel |

```graphql
# Ajouter à PRODUCTS_QUERY
packUnitsMetafield: metafield(namespace: "custom", key: "pack_units") {
  value
  type
}
unitTypeMetafield: metafield(namespace: "custom", key: "unit_type") {
  value
  type
}
defaultDoseMetafield: metafield(namespace: "custom", key: "default_dose") {
  value
  type
}
```

**Note** : Si ces metafields ne sont pas configurés dans Shopify, le système utilisera des valeurs par défaut raisonnables.

---

### Phase 2 : Créer le Module de Calcul d'Abonnement

**Nouveau fichier : `src/lib/subscription-calculator.ts`**

Ce module contient la logique de calcul pour les abonnements mensuels :

```typescript
// Constantes
const SUBSCRIPTION_DISCOUNT_RATE = 0.10; // 10%
const DEFAULT_CYCLE_DAYS = 30;
const DEFAULT_PACK_UNITS = 30; // Conservative default

// Types
interface SubscriptionLineItem {
  productId: string;
  variantId: string;
  productName: string;
  dosePerDay: number;
  unitType: string;
  packUnits: number;
  cycleDays: number;
  packsNeeded: number;
  unitPrice: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotal: number;
  sellingPlanId: string | null;
}

interface SubscriptionSummary {
  lines: SubscriptionLineItem[];
  subtotalBeforeDiscount: number;
  totalDiscount: number;
  totalAfterDiscount: number;
  currencyCode: string;
  hasSellingPlans: boolean;
}

// Fonctions de calcul
function calculatePacksNeeded(
  dosePerDay: number,
  cycleDays: number,
  packUnits: number
): number {
  const totalUnitsNeeded = dosePerDay * cycleDays;
  return Math.ceil(totalUnitsNeeded / packUnits);
}

function calculateSubscriptionLine(
  product: ProductWithMeta,
  dosePerDay: number,
  cycleDays: number = DEFAULT_CYCLE_DAYS
): SubscriptionLineItem {
  const packUnits = product.packUnits || DEFAULT_PACK_UNITS;
  const packsNeeded = calculatePacksNeeded(dosePerDay, cycleDays, packUnits);
  const unitPrice = parseFloat(product.price);
  const lineSubtotal = packsNeeded * unitPrice;
  const lineDiscount = lineSubtotal * SUBSCRIPTION_DISCOUNT_RATE;
  const lineTotal = lineSubtotal - lineDiscount;
  
  return {
    productId: product.id,
    variantId: product.variantId,
    productName: product.title,
    dosePerDay,
    unitType: product.unitType || 'capsules',
    packUnits,
    cycleDays,
    packsNeeded,
    unitPrice,
    lineSubtotal,
    lineDiscount,
    lineTotal,
    sellingPlanId: product.sellingPlanId || null
  };
}
```

---

### Phase 3 : Requêtes GraphQL pour Selling Plans

**Fichier : `src/lib/shopify.ts`**

Ajouter le support des Selling Plans dans les queries et mutations du cart :

```graphql
# Query pour récupérer les selling plans d'un produit
query GetProductSellingPlans($id: ID!) {
  product(id: $id) {
    sellingPlanGroups(first: 5) {
      edges {
        node {
          name
          sellingPlans(first: 10) {
            edges {
              node {
                id
                name
                description
                recurringDeliveries
                options {
                  name
                  value
                }
                priceAdjustments {
                  adjustmentValue {
                    ... on SellingPlanPercentagePriceAdjustment {
                      adjustmentPercentage
                    }
                    ... on SellingPlanFixedPriceAdjustment {
                      price { amount currencyCode }
                    }
                  }
                  orderCount
                }
              }
            }
          }
        }
      }
    }
  }
}

# Mutation pour créer un cart avec selling plan
mutation cartCreateWithSellingPlan($input: CartInput!) {
  cartCreate(input: $input) {
    cart {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            merchandise {
              ... on ProductVariant { id }
            }
            sellingPlanAllocation {
              sellingPlan { id name }
            }
          }
        }
      }
    }
    userErrors { field message }
  }
}
```

**Ajouter les fonctions helpers :**

```typescript
// Créer un cart d'abonnement
async function createSubscriptionCart(
  items: Array<{
    variantId: string;
    quantity: number;
    sellingPlanId?: string;
  }>
): Promise<{ cartId: string; checkoutUrl: string } | null> {
  const lines = items.map(item => ({
    quantity: item.quantity,
    merchandiseId: item.variantId,
    ...(item.sellingPlanId && { sellingPlanId: item.sellingPlanId })
  }));

  const data = await storefrontApiRequest(CART_CREATE_WITH_SELLING_PLAN_MUTATION, {
    input: { lines }
  });

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  return {
    cartId: cart.id,
    checkoutUrl: formatCheckoutUrl(cart.checkoutUrl)
  };
}
```

---

### Phase 4 : Nouveau Composant SubscriptionBuilder

**Nouveau fichier : `src/components/dashboard/SubscriptionBuilder.tsx`**

Interface utilisateur pour afficher et gérer l'abonnement proposé par l'IA :

```typescript
interface SubscriptionBuilderProps {
  summary: SubscriptionSummary;
  onConfirm: () => void;
  onAdjust: (productId: string, newDose: number) => void;
  onRemove: (productId: string) => void;
}

// Structure du composant :
// - Header avec "Votre Abonnement Mensuel"
// - Liste des produits avec:
//   - Nom, dose/jour, packs/mois, prix
//   - Bouton +/- pour ajuster la dose
//   - Bouton supprimer
// - Section totaux:
//   - Sous-total (avant remise)
//   - Remise 10% (en vert)
//   - Total mensuel
// - Footer avec:
//   - Bouton "Ajuster"
//   - Bouton "Valider et payer" -> ouvre checkout URL
```

**Design UI :**
- Carte avec fond glass-card
- Badge "10% de remise" en primary
- Indicateur de cadence (30 jours)
- Avertissement si un produit n'a pas de selling plan

---

### Phase 5 : Enrichir le Prompt AI Coach

**Fichier : `supabase/functions/ai-coach/index.ts`**

Ajouter un nouveau playbook pour la création d'abonnements :

```typescript
// Ajouter au baseSystemPrompt

PLAYBOOK ABONNEMENT MENSUEL
═══════════════════════════════════════════════════════════════

Quand l'utilisateur demande un "abonnement", "pack mensuel", ou "livraison automatique":

1. COLLECTER LE STACK
   - Identifier les produits recommandés ou dans le suivi
   - Pour chaque produit, déterminer la dose/jour

2. CALCULER LES QUANTITÉS MENSUELLES
   - Utilise la formule: packs_needed = ceil(dose_per_day * 30 / pack_units)
   - Applique 10% de remise abonnement

3. AFFICHER LE RÉCAPITULATIF
   Format obligatoire:
   
   📦 TON ABONNEMENT MENSUEL
   ──────────────────────────
   [[SUBSCRIPTION_START]]
   - Produit: [Nom]
     Dose: [X]/jour | Packs: [N]/mois | Prix: [XX]$ (-10%)
   ...
   [[SUBSCRIPTION_END]]
   
   💰 TOTAL: [XXX]$/mois (économie de [YY]$)

4. DEMANDER CONFIRMATION
   - "Tu veux que je crée ce panier récurrent ?"
   - "Tu préfères ajuster les doses ou produits avant ?"

5. REDIRIGER VERS CHECKOUT
   Jamais d'achat automatique, toujours lien vers checkout Shopify.

RÈGLES SPÉCIFIQUES:
- Livraison USA uniquement
- Si stock épuisé → proposer alternative ou exclure
- Si dose anormalement haute (>6 packs/mois) → demander confirmation
- Si produit sans selling plan → mentionner "achat unique"
```

---

### Phase 6 : Parser les Recommandations d'Abonnement

**Fichier : `src/components/dashboard/ProductRecommendationCard.tsx`**

Ajouter un parser pour les blocs d'abonnement générés par l'IA :

```typescript
// Nouveau format de parsing
// [[SUBSCRIPTION_START]]
// - Produit: Créatine
//   Dose: 1/jour | Packs: 1/mois | Prix: 29.99$ (-10%)
// [[SUBSCRIPTION_END]]

interface SubscriptionBlock {
  items: Array<{
    productName: string;
    dosePerDay: number;
    packsPerMonth: number;
    priceAfterDiscount: number;
  }>;
  total: number;
  savings: number;
}

function parseSubscriptionBlock(content: string): {
  text: string;
  subscription: SubscriptionBlock | null;
} {
  const regex = /\[\[SUBSCRIPTION_START\]\]([\s\S]*?)\[\[SUBSCRIPTION_END\]\]/;
  const match = content.match(regex);
  
  if (!match) return { text: content, subscription: null };
  
  // Parse les lignes d'abonnement
  // Retourner la structure parsée
}
```

---

### Phase 7 : Composant SubscriptionCard dans le Chat

**Nouveau fichier : `src/components/dashboard/SubscriptionCard.tsx`**

Une carte interactive qui s'affiche dans le chat quand l'IA propose un abonnement :

```typescript
interface SubscriptionCardProps {
  subscription: SubscriptionBlock;
  onConfirm: () => Promise<void>;
  onModify: () => void;
}

// Affichage:
// - Récapitulatif visuel du panier
// - Badge "10% d'économie"
// - Bouton "Créer mon abonnement" (primary)
// - Bouton "Modifier" (secondary)
// - Lien "En savoir plus sur les abonnements"
```

---

### Phase 8 : Gestion des Cadences Multiples

**Dans : `src/lib/subscription-calculator.ts`**

Logique pour gérer différentes cadences (30, 60, 90 jours) :

```typescript
interface CadenceGroup {
  cadenceDays: number;
  items: SubscriptionLineItem[];
  subtotal: number;
}

function groupByCadence(items: SubscriptionLineItem[]): CadenceGroup[] {
  // Grouper les items par cadence
  // Si un produit dure naturellement 60 jours, proposer options:
  // A) Inclure en mensuel (livraison partielle)
  // B) Séparer en abonnement 60 jours
}

// Note: Shopify ne supporte pas les cadences mixtes dans un cart
// Solution: Créer plusieurs carts si nécessaire
```

---

### Récapitulatif des Fichiers

| Action | Fichier | Priorité |
|--------|---------|----------|
| Modifier | `src/lib/shopify.ts` | Haute |
| Créer | `src/lib/subscription-calculator.ts` | Haute |
| Créer | `src/components/dashboard/SubscriptionBuilder.tsx` | Haute |
| Créer | `src/components/dashboard/SubscriptionCard.tsx` | Haute |
| Modifier | `supabase/functions/ai-coach/index.ts` | Haute |
| Modifier | `src/components/dashboard/ProductRecommendationCard.tsx` | Moyenne |
| Modifier | `src/components/dashboard/ChatInterface.tsx` | Moyenne |

---

### Dépendances Shopify Requises

Pour que les abonnements fonctionnent, le store Shopify doit avoir :

1. **App d'abonnement installée** (ex: Recharge, Bold, Appstle)
2. **Selling Plans configurés** pour chaque produit
3. **Metafields configurés** (optionnel mais recommandé) :
   - `custom.pack_units` (nombre de doses par pack)
   - `custom.unit_type` (type d'unité)
   - `custom.default_dose` (dose quotidienne par défaut)

**Note importante** : Si les selling plans ne sont pas configurés dans Shopify, le système créera un cart one-time avec un message indiquant que l'abonnement n'est pas disponible pour ces produits.

---

### Flow Utilisateur Final

```text
1. Utilisateur: "Je veux un abonnement mensuel avec mon stack"
   
2. AI Coach:
   - Récupère les produits du suivi + profil
   - Calcule les quantités mensuelles
   - Affiche le récapitulatif avec prix
   - Demande confirmation

3. Interface:
   - Affiche SubscriptionCard dans le chat
   - Permet d'ajuster doses/produits
   - Bouton "Créer mon abonnement"

4. Checkout:
   - Crée le cart Shopify avec selling plans
   - Ouvre le checkout URL dans nouvel onglet
   - Utilisateur finalise le paiement sur Shopify
```

---

### Ordre d'Implémentation

1. **Shopify Queries** - Metafields + Selling Plans
2. **Calculator Module** - Logique de calcul
3. **AI Prompt** - Playbook abonnement
4. **SubscriptionCard** - Affichage dans le chat
5. **Cart Creation** - Mutation avec selling plans
6. **Testing** - Validation du flow complet

