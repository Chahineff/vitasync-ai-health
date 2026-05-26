import { useMemo } from 'react';
import { ShopifyProduct } from '@/lib/shopify';

export interface ProductGroup {
  baseTitle: string;
  products: ShopifyProduct[];
  primaryProduct: ShopifyProduct;
  flavors: string[];
  minPrice: number;
  maxPrice: number;
  productType: string;
}

// Extract base title and flavor from product title
function parseProductTitle(title: string): { baseTitle: string; flavor: string | null } {
  // Pattern 1: "Name (Flavor)"
  const parenMatch = title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    return { baseTitle: parenMatch[1].trim(), flavor: parenMatch[2].trim() };
  }

  // Pattern 2: "Name - Flavor" (only if after dash looks like a flavor)
  // Skip if the part before dash is too short (e.g. "5-HTP" is not "5" + flavor "HTP")
  const dashMatch = title.match(/^(.+?)\s*-\s*(.+)$/);
  if (dashMatch) {
    const basePart = dashMatch[1].trim();
    const potentialFlavor = dashMatch[2].trim();
    // Don't split if base is very short (likely a compound name like "5-HTP", "N-Acetyl")
    if (basePart.length >= 3) {
      const flavorWords = ['chocolate', 'vanilla', 'strawberry', 'berry', 'fruit', 'punch', 'mango', 'lemon', 'lime', 'orange', 'grape', 'mint', 'peach', 'cherry', 'apple', 'banana', 'coconut', 'caramel', 'coffee', 'mocha', 'unflavored', 'natural', 'original', 'tropical', 'watermelon', 'blueberry', 'raspberry', 'shortcake', 'lemonade', 'litchi', 'gummy'];
      const isLikelyFlavor = flavorWords.some(word => potentialFlavor.toLowerCase().includes(word)) || potentialFlavor.split(' ').length <= 3;
      
      if (isLikelyFlavor) {
        return { baseTitle: basePart, flavor: potentialFlavor };
      }
    }
  }

  return { baseTitle: title, flavor: null };
}

export function useProductGroups(products: ShopifyProduct[]): ProductGroup[] {
  return useMemo(() => {
    // Group flavor variants of the same base product into a single card.
    // Detection: same parsed base title (parenthesized/dashed flavor stripped)
    // OR shared product-handle prefix before the trailing flavor segment.
    // NOTE: long-term fix is real Shopify variants — this is a rendering-layer
    // dedupe so the catalog isn't visually duplicated.
    const norm = (s: string) =>
      s.toLowerCase().replace(/[\s\-_]+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();

    const handleBase = (handle: string): string => {
      // Drop trailing flavor-ish segment from handle, e.g. "focus-powder-sour-grape"
      // → "focus-powder". Only strip if the last 1-3 tokens look like a flavor.
      const parts = handle.split('-').filter(Boolean);
      if (parts.length <= 2) return handle;
      const flavorWords = new Set(['chocolate','vanilla','strawberry','berry','fruit','punch','mango','lemon','lime','orange','grape','mint','peach','cherry','apple','banana','coconut','caramel','coffee','mocha','unflavored','natural','original','tropical','watermelon','blueberry','raspberry','shortcake','lemonade','litchi','gummy','gummi','worm','candy','sour','yuzu','citrus','vanille','chocolat','fraise','framboise']);
      // Try stripping last 1, 2, then 3 tokens if any of them are flavor words.
      for (const drop of [3, 2, 1]) {
        if (parts.length - drop < 2) continue;
        const tail = parts.slice(-drop);
        if (tail.some(t => flavorWords.has(t))) {
          return parts.slice(0, -drop).join('-');
        }
      }
      return handle;
    };

    const groupMap = new Map<string, ShopifyProduct[]>();
    const groupKeyToBaseTitle = new Map<string, string>();

    for (const product of products) {
      const { baseTitle } = parseProductTitle(product.node.title);
      const handle = product.node.handle || '';
      const baseHandle = handleBase(handle);
      // Key by (productType, normalized base title OR base handle) so unrelated
      // products with similar names don't collapse.
      const type = (product.node.productType || '').toLowerCase();
      const key = `${type}::${norm(baseTitle)}::${baseHandle}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
        groupKeyToBaseTitle.set(key, baseTitle);
      }
      groupMap.get(key)!.push(product);
    }

    const groups: ProductGroup[] = [];
    for (const [key, items] of groupMap) {
      const prices = items.map(p => parseFloat(p.node.priceRange.minVariantPrice.amount));
      const flavors = items
        .map(p => getFlavorFromTitle(p.node.title))
        .filter((f): f is string => !!f);
      // Primary = product with the shortest title (usually the cleanest), then
      // the one with an image, otherwise first.
      const primary = [...items].sort((a, b) => {
        const aImg = a.node.images?.edges?.length ? 0 : 1;
        const bImg = b.node.images?.edges?.length ? 0 : 1;
        if (aImg !== bImg) return aImg - bImg;
        return a.node.title.length - b.node.title.length;
      })[0];
      groups.push({
        baseTitle: groupKeyToBaseTitle.get(key) || primary.node.title,
        products: items,
        primaryProduct: primary,
        flavors,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        productType: primary.node.productType || '',
      });
    }

    groups.sort((a, b) => a.baseTitle.localeCompare(b.baseTitle));
    return groups;
  }, [products]);
}

// Get flavor from a product title
export function getFlavorFromTitle(title: string): string | null {
  const { flavor } = parseProductTitle(title);
  return flavor;
}

// Get base title from a product title
export function getBaseTitleFromProduct(title: string): string {
  const { baseTitle } = parseProductTitle(title);
  return baseTitle;
}
