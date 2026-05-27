import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ═══════════════ Selling Plan Types ═══════════════

export interface SellingPlanPriceAdjustment {
  adjustmentValue: {
    adjustmentPercentage?: number;
    adjustmentAmount?: { amount: string; currencyCode: string };
  };
}

export interface SellingPlan {
  id: string;
  name: string;
  options: Array<{ name: string; value: string }>;
  priceAdjustments: SellingPlanPriceAdjustment[];
  deliveryPolicy?: {
    interval?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | string;
    intervalCount?: number;
  } | null;
}

export interface SellingPlanGroup {
  name: string;
  sellingPlans: {
    edges: Array<{ node: SellingPlan }>;
  };
}

// ═══════════════ Product Types ═══════════════

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    productType: string;
    vendor: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
    sellingPlanGroups?: {
      edges: Array<{ node: SellingPlanGroup }>;
    };
  };
}

export interface ProductDetail {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  handle: string;
  productType: string;
  vendor: string;
  tags: string[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
  options: Array<{
    name: string;
    values: string[];
  }>;
  sellingPlanGroups?: {
    edges: Array<{ node: SellingPlanGroup }>;
  };
  benefitsMetafield: { value: string; type: string } | null;
  ingredientsMetafield: { value: string; type: string } | null;
  reviewRating: { value: string; type: string } | null;
  reviewCount: { value: string; type: string } | null;
}

export interface ProductGroup {
  baseTitle: string;
  products: ShopifyProduct[];
  variants: Array<{
    flavor: string;
    product: ShopifyProduct;
  }>;
}

// ═══════════════ API Helper ═══════════════

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke('shopify-storefront-proxy', {
    body: { query, variables },
  });

  if (error) {
    console.error('Shopify proxy error:', error);
    throw new Error(`Shopify proxy error: ${error.message}`);
  }

  if (data?.errors) {
    throw new Error(`Error calling Shopify: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

// ═══════════════ Selling Plan Fragment ═══════════════

const SELLING_PLAN_FRAGMENT = `
  sellingPlanGroups(first: 3) {
    edges {
      node {
        name
        sellingPlans(first: 10) {
          edges {
            node {
              id
              name
              options { name value }
              deliveryPolicy {
                ... on SellingPlanRecurringDeliveryPolicy {
                  interval
                  intervalCount
                }
              }
              priceAdjustments {
                adjustmentValue {
                  ... on SellingPlanPercentagePriceAdjustment { adjustmentPercentage }
                  ... on SellingPlanFixedAmountPriceAdjustment { adjustmentAmount { amount currencyCode } }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// ═══════════════ GraphQL Queries ═══════════════

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String, $after: String) {
    products(first: $first, query: $query, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          description
          handle
          productType
          vendor
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
          ${SELLING_PLAN_FRAGMENT}
        }
      }
    }
  }
`;

// Fallback without selling plans (in case of permission issues)
const PRODUCTS_QUERY_FALLBACK = `
  query GetProducts($first: Int!, $query: String, $after: String) {
    products(first: $first, query: $query, after: $after) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title description handle productType vendor
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 5) { edges { node { url altText } } }
          variants(first: 10) { edges { node { id title price { amount currencyCode } availableForSale selectedOptions { name value } } } }
          options { name values }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      descriptionHtml
      handle
      productType
      vendor
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 20) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
      ${SELLING_PLAN_FRAGMENT}
      benefitsMetafield: metafield(namespace: "custom", key: "benefits") {
        value
        type
      }
      ingredientsMetafield: metafield(namespace: "custom", key: "ingredients") {
        value
        type
      }
      reviewRating: metafield(namespace: "reviews", key: "rating") {
        value
        type
      }
      reviewCount: metafield(namespace: "reviews", key: "rating_count") {
        value
        type
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY_FALLBACK = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id title description descriptionHtml handle productType vendor tags
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 20) { edges { node { url altText } } }
      variants(first: 20) { edges { node { id title price { amount currencyCode } availableForSale selectedOptions { name value } } } }
      options { name values }
      benefitsMetafield: metafield(namespace: "custom", key: "benefits") { value type }
      ingredientsMetafield: metafield(namespace: "custom", key: "ingredients") { value type }
      reviewRating: metafield(namespace: "reviews", key: "rating") { value type }
      reviewCount: metafield(namespace: "reviews", key: "rating_count") { value type }
    }
  }
`;

const PRODUCT_BY_ID_QUERY = `
  query GetProductById($id: ID!) {
    node(id: $id) {
      ... on Product {
        id
        title
        description
        handle
        productType
        vendor
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 5) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
        options {
          name
          values
        }
        ${SELLING_PLAN_FRAGMENT}
      }
    }
  }
`;

// ═══════════════ Data Fetching ═══════════════

export async function fetchProducts(first: number = 50, query?: string): Promise<ShopifyProduct[]> {
  const allProducts: ShopifyProduct[] = [];
  let hasNextPage = true;
  let afterCursor: string | null = null;
  const pageSize = Math.min(first, 250);
  let useFallback = false;

  while (hasNextPage) {
    const remaining = first - allProducts.length;
    const batchSize = Math.min(pageSize, remaining);
    if (batchSize <= 0) break;

    const variables: Record<string, unknown> = { first: batchSize, query };
    if (afterCursor) variables.after = afterCursor;

    try {
      const activeQuery = useFallback ? PRODUCTS_QUERY_FALLBACK : PRODUCTS_QUERY;
      const data = await storefrontApiRequest(activeQuery, variables);
      const edges = data?.data?.products?.edges || [];
      const pageInfo = data?.data?.products?.pageInfo;

      allProducts.push(...edges);
      hasNextPage = pageInfo?.hasNextPage === true && allProducts.length < first;
      afterCursor = pageInfo?.endCursor || null;
    } catch (error) {
      if (!useFallback) {
        console.warn('Selling plans query failed, retrying without:', error);
        useFallback = true;
        continue;
      }
      throw error;
    }
  }

  return allProducts;
}

export async function fetchProductByHandle(handle: string): Promise<ProductDetail | null> {
  try {
    const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
    return data?.data?.productByHandle || null;
  } catch (error) {
    console.warn('Product query with selling plans failed, retrying without:', error);
    const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY_FALLBACK, { handle });
    return data?.data?.productByHandle || null;
  }
}

export async function fetchProductById(productId: string): Promise<ShopifyProduct | null> {
  const fullId = productId.startsWith('gid://') 
    ? productId 
    : `gid://shopify/Product/${productId}`;
  
  const data = await storefrontApiRequest(PRODUCT_BY_ID_QUERY, { id: fullId });
  const product = data?.data?.node;
  
  if (!product) return null;
  return { node: product };
}

// Group products by base name
export function groupProductsByBaseName(products: ShopifyProduct[]): ProductGroup[] {
  const groups: Map<string, ProductGroup> = new Map();
  const flavorPatterns = [
    /\s*\(([^)]+)\)\s*$/,
    /\s*-\s*([^-]+)\s*$/,
  ];
  
  for (const product of products) {
    let baseTitle = product.node.title;
    let flavor = 'Default';
    
    for (const pattern of flavorPatterns) {
      const match = product.node.title.match(pattern);
      if (match) {
        flavor = match[1].trim();
        baseTitle = product.node.title.replace(pattern, '').trim();
        break;
      }
    }
    
    if (!groups.has(baseTitle)) {
      groups.set(baseTitle, { baseTitle, products: [], variants: [] });
    }
    
    const group = groups.get(baseTitle)!;
    group.products.push(product);
    group.variants.push({ flavor, product });
  }
  
  return Array.from(groups.values());
}

// ═══════════════ Selling Plan Helpers ═══════════════

/**
 * Returns the single cadence the product is configured with on Shopify.
 * If multiple selling-plan groups are attached, prefers the most specific
 * non-monthly one (i.e. anything that isn't `MONTH` x 1). Each VitaSync
 * product has its own Shopify cadence — never hardcode "monthly".
 */
export function getFirstSellingPlan(product: ShopifyProduct | ProductDetail): SellingPlan | null {
  const plans = getSellingPlans(product);
  if (!plans.length) {
    const handle = 'node' in product ? product.node.handle : product.handle;
    if (typeof console !== 'undefined') {
      console.warn(`[shopify] No selling plan group attached to product "${handle}" — subscribe option will be hidden.`);
    }
    return null;
  }
  const isMonthly = (p: SellingPlan) =>
    p.deliveryPolicy?.interval === 'MONTH' && (p.deliveryPolicy?.intervalCount ?? 1) === 1;
  return plans.find((p) => !isMonthly(p)) || plans[0];
}

export function getSellingPlans(product: ShopifyProduct | ProductDetail): SellingPlan[] {
  const groups = 'node' in product
    ? (product as ShopifyProduct).node.sellingPlanGroups?.edges
    : (product as ProductDetail).sellingPlanGroups?.edges;
  if (!groups?.length) return [];
  const plans: SellingPlan[] = [];
  for (const group of groups) {
    for (const edge of group.node.sellingPlans.edges) {
      plans.push(edge.node);
    }
  }
  return plans;
}

export function calculateSubscriptionPrice(basePrice: number, plan: SellingPlan): number {
  if (!plan.priceAdjustments?.length) return basePrice;
  const adj = plan.priceAdjustments[0].adjustmentValue;
  if (adj.adjustmentPercentage != null) {
    return basePrice * (1 - adj.adjustmentPercentage / 100);
  }
  if (adj.adjustmentAmount?.amount != null) {
    return basePrice - parseFloat(adj.adjustmentAmount.amount);
  }
  return basePrice;
}

export function getDiscountPercentage(plan: SellingPlan): number | null {
  if (!plan.priceAdjustments?.length) return null;
  const adj = plan.priceAdjustments[0].adjustmentValue;
  if (adj.adjustmentPercentage != null) return adj.adjustmentPercentage;
  return null;
}

/**
 * Human-readable cadence built from Shopify's `deliveryPolicy` (interval +
 * intervalCount) — the source of truth. Falls back to parsing option/name
 * strings only when deliveryPolicy is absent.
 */
export function getPlanCadenceLabel(plan: SellingPlan): string {
  const dp = plan.deliveryPolicy;
  if (dp?.interval) {
    const n = Math.max(1, dp.intervalCount ?? 1);
    const unit = dp.interval.toUpperCase();
    const singularPlural = (singular: string, plural: string) => (n === 1 ? singular : `${n} ${plural}`);
    switch (unit) {
      case 'DAY':   return `every ${singularPlural('day', 'days')}`;
      case 'WEEK':  return `every ${singularPlural('week', 'weeks')}`;
      case 'MONTH': return `every ${singularPlural('month', 'months')}`;
      case 'YEAR':  return `every ${singularPlural('year', 'years')}`;
    }
  }
  return getDeliveryFrequency(plan);
}

export function getDeliveryFrequency(plan: SellingPlan): string {
  // Prefer live deliveryPolicy when available
  if (plan.deliveryPolicy?.interval) {
    return getPlanCadenceLabel(plan);
  }
  const opt = plan.options?.find(o => o.name.toLowerCase().includes('delivery') || o.name.toLowerCase().includes('frequency') || o.name.toLowerCase().includes('billing'));
  const raw = opt?.value || plan.name || '';
  
  // Parse day-based patterns like "30 Day(s)", "60 Day(s)", "90 Day(s)"
  const dayMatch = raw.match(/(\d+)\s*day/i);
  if (dayMatch) {
    const days = parseInt(dayMatch[1], 10);
    if (days <= 30) return `${Math.round(days / 30) || 1} month`;
    if (days <= 60) return `2 months`;
    if (days <= 90) return `3 months`;
    return `${Math.round(days / 30)} months`;
  }
  
  // Parse week-based patterns
  const weekMatch = raw.match(/(\d+)\s*week/i);
  if (weekMatch) {
    const weeks = parseInt(weekMatch[1], 10);
    if (weeks <= 4) return '1 month';
    return `${Math.round(weeks / 4)} months`;
  }
  
  // Parse month-based patterns
  const monthMatch = raw.match(/(\d+)\s*month/i);
  if (monthMatch) {
    const months = parseInt(monthMatch[1], 10);
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  // Clean up labels like "Daily LV", "Daily LV Treatment" — fallback to plan name
  if (/daily\s*lv/i.test(raw) || /treatment/i.test(raw)) {
    // Try to extract from plan name instead
    const nameMatch = plan.name?.match(/(\d+)\s*(day|week|month)/i);
    if (nameMatch) return getDeliveryFrequency({ ...plan, options: [{ name: 'frequency', value: nameMatch[0] }] });
    return plan.name || raw;
  }
  
  return raw;
}

// ═══════════════ Cart ═══════════════

export const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity }
  }
`;

export const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set('channel', 'online_store');
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

function isCartNotFoundError(userErrors: Array<{ field: string[] | null; message: string }>): boolean {
  return userErrors.some(e => e.message.toLowerCase().includes('cart not found') || e.message.toLowerCase().includes('does not exist'));
}

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
  sellingPlanId?: string;
  sellingPlanName?: string;
}

export async function createShopifyCart(item: CartItem): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  const line: Record<string, unknown> = { quantity: item.quantity, merchandiseId: item.variantId };
  if (item.sellingPlanId) line.sellingPlanId = item.sellingPlanId;

  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines: [line] },
  });

  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error('Cart creation failed:', data.data.cartCreate.userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;

  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}

export async function addLineToShopifyCart(cartId: string, item: CartItem): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  const line: Record<string, unknown> = { quantity: item.quantity, merchandiseId: item.variantId };
  if (item.sellingPlanId) line.sellingPlanId = item.sellingPlanId;

  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [line],
  });

  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Add line failed:', userErrors);
    return { success: false };
  }

  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find((l: { node: { id: string; merchandise: { id: string } } }) => l.node.merchandise.id === item.variantId);
  return { success: true, lineId: newLine?.node?.id };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Update line failed:', userErrors);
    return { success: false };
  }
  return { success: true };
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<{ success: boolean; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length > 0) {
    console.error('Remove line failed:', userErrors);
    return { success: false };
  }
  return { success: true };
}

// Create a subscription cart with selling plans (legacy compat)
export interface SubscriptionCartItem {
  variantId: string;
  quantity: number;
  sellingPlanId?: string;
}

export async function createSubscriptionCart(
  items: SubscriptionCartItem[]
): Promise<{ cartId: string; checkoutUrl: string } | null> {
  const lines = items.map(item => ({
    quantity: item.quantity,
    merchandiseId: item.variantId,
    ...(item.sellingPlanId && { sellingPlanId: item.sellingPlanId })
  }));

  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: { lines }
  });

  if (data?.data?.cartCreate?.userErrors?.length > 0) {
    console.error('Subscription cart creation failed:', data.data.cartCreate.userErrors);
    return null;
  }

  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;

  return {
    cartId: cart.id,
    checkoutUrl: formatCheckoutUrl(cart.checkoutUrl)
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Stack data-flow states (single source of truth for which items are in play)
// ─────────────────────────────────────────────────────────────────────────────
// 1. RECOMMENDATION PREVIEW — AI Coach suggestions shown to the user. Read-only,
//    never sent to Shopify. Lives in chat state (AIStackPanel / parsed blocks).
// 2. CART DRAFT — items the user added ad-hoc while browsing (Add to cart, PDP,
//    onboarding). Persisted in `useCartStore` (Shopify cart id + lines). Used
//    ONLY for one-off Shopify cart drawer checkout.
// 3. CONFIRMED MONTHLY STACK — the final, user-validated subscription stack
//    (from SubscriptionBuilder / SubscriptionCard). MUST be checked out via a
//    FRESH Shopify cart that contains ONLY these lines — never reuse the draft.
// 4. DAILY SUPPLEMENT TRACKING — separate table, append-only, unrelated to
//    checkout (see useSupplementTracking).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a checkout for the CONFIRMED monthly stack.
 *
 * Guarantees:
 *  - Creates a brand-new Shopify cart with exactly the provided line items.
 *  - Does NOT inherit any item from the draft cart (`useCartStore`).
 *  - Clears the local draft cart so the user is not confused by stale lines
 *    after returning from Shopify checkout.
 */
export async function checkoutConfirmedStack(
  items: SubscriptionCartItem[],
  options?: { clearDraftCart?: () => void }
): Promise<{ cartId: string; checkoutUrl: string } | null> {
  if (!items || items.length === 0) return null;
  const result = await createSubscriptionCart(items);
  if (result?.checkoutUrl) {
    // Drop the ad-hoc draft cart so confirmed-stack checkout is the only
    // source of truth for what the user is about to pay for.
    try { options?.clearDraftCart?.(); } catch (e) { console.warn('clearDraftCart failed', e); }
  }
  return result;
}
