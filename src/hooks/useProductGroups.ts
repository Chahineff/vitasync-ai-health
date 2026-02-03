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
  const dashMatch = title.match(/^(.+?)\s*-\s*(.+)$/);
  if (dashMatch) {
    const potentialFlavor = dashMatch[2].trim();
    // Check if it looks like a flavor (contains common flavor words or is short)
    const flavorWords = ['chocolate', 'vanilla', 'strawberry', 'berry', 'fruit', 'punch', 'mango', 'lemon', 'lime', 'orange', 'grape', 'mint', 'peach', 'cherry', 'apple', 'banana', 'coconut', 'caramel', 'coffee', 'mocha', 'unflavored', 'natural', 'original', 'tropical', 'watermelon', 'blueberry', 'raspberry', 'shortcake', 'lemonade', 'litchi', 'gummy'];
    const isLikelyFlavor = flavorWords.some(word => potentialFlavor.toLowerCase().includes(word)) || potentialFlavor.split(' ').length <= 3;
    
    if (isLikelyFlavor) {
      return { baseTitle: dashMatch[1].trim(), flavor: potentialFlavor };
    }
  }

  return { baseTitle: title, flavor: null };
}

export function useProductGroups(products: ShopifyProduct[]): ProductGroup[] {
  return useMemo(() => {
    const groupMap = new Map<string, ShopifyProduct[]>();

    // Group products by base title
    products.forEach(product => {
      const { baseTitle } = parseProductTitle(product.node.title);
      const normalizedBase = baseTitle.toLowerCase().trim();
      
      if (!groupMap.has(normalizedBase)) {
        groupMap.set(normalizedBase, []);
      }
      groupMap.get(normalizedBase)!.push(product);
    });

    // Convert to ProductGroup array
    const groups: ProductGroup[] = [];

    groupMap.forEach((groupProducts, _baseKey) => {
      // Sort by title to get consistent ordering
      groupProducts.sort((a, b) => a.node.title.localeCompare(b.node.title));

      const primaryProduct = groupProducts[0];
      const { baseTitle } = parseProductTitle(primaryProduct.node.title);

      // Extract flavors
      const flavors = groupProducts
        .map(p => parseProductTitle(p.node.title).flavor)
        .filter((f): f is string => f !== null);

      // Calculate price range
      const prices = groupProducts.map(p => 
        parseFloat(p.node.priceRange.minVariantPrice.amount)
      );
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      groups.push({
        baseTitle,
        products: groupProducts,
        primaryProduct,
        flavors,
        minPrice,
        maxPrice,
        productType: primaryProduct.node.productType || '',
      });
    });

    // Sort groups by title
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
