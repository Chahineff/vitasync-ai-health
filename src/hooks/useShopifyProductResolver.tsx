import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';

interface ResolvedProduct {
  title: string;
  imageUrl: string | null;
  handle: string;
}

// Module-level cache shared across all hook instances
const productCache = new Map<string, ResolvedProduct>();
let allProductsFetched = false;
let allProductsPromise: Promise<ShopifyProduct[]> | null = null;

function ensureAllProducts(): Promise<ShopifyProduct[]> {
  if (!allProductsPromise) {
    allProductsPromise = fetchProducts(100).then(products => {
      products.forEach(p => {
        const gid = p.node.id;
        const numericId = gid.split('/').pop() || '';
        const resolved: ResolvedProduct = {
          title: p.node.title,
          imageUrl: p.node.images.edges[0]?.node.url || null,
          handle: p.node.handle,
        };
        productCache.set(gid, resolved);
        productCache.set(numericId, resolved);
        // Also map variant IDs
        p.node.variants.edges.forEach(v => {
          const variantGid = v.node.id;
          const variantNumId = variantGid.split('/').pop() || '';
          productCache.set(variantGid, resolved);
          productCache.set(variantNumId, resolved);
        });
      });
      allProductsFetched = true;
      return products;
    });
  }
  return allProductsPromise;
}

/**
 * Resolves Shopify product names and images from shopify_product_id references.
 * Uses a shared module-level cache to avoid redundant API calls.
 */
export function useShopifyProductResolver(shopifyIds: (string | null)[]) {
  const [resolved, setResolved] = useState<Map<string, ResolvedProduct>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const idsToResolve = shopifyIds.filter(Boolean) as string[];
    if (idsToResolve.length === 0) {
      setLoading(false);
      return;
    }

    // Check if all are already cached
    const allCached = idsToResolve.every(id => {
      const normalizedId = extractId(id);
      return productCache.has(normalizedId);
    });

    if (allCached) {
      const map = new Map<string, ResolvedProduct>();
      idsToResolve.forEach(id => {
        const normalizedId = extractId(id);
        const cached = productCache.get(normalizedId);
        if (cached) map.set(id, cached);
      });
      setResolved(map);
      setLoading(false);
      return;
    }

    // Fetch all products to populate cache
    setLoading(true);
    ensureAllProducts().then(() => {
      const map = new Map<string, ResolvedProduct>();
      idsToResolve.forEach(id => {
        const normalizedId = extractId(id);
        const cached = productCache.get(normalizedId);
        if (cached) map.set(id, cached);
      });
      setResolved(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [shopifyIds.join(',')]);

  const getProduct = useCallback((shopifyId: string | null): ResolvedProduct | null => {
    if (!shopifyId) return null;
    return resolved.get(shopifyId) || null;
  }, [resolved]);

  return { getProduct, loading, allProducts: resolved };
}

function extractId(rawId: string): string {
  // Handle various formats:
  // "gid://shopify/Product/123" -> "123"
  // "gid://shopify/ProductVariant/123" -> "123"
  // "//shopify/ProductVariant/123" -> "123"
  // "123" -> "123"
  const parts = rawId.split('/');
  return parts[parts.length - 1] || rawId;
}
