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
    // Each product is its own group — no merging
    const groups: ProductGroup[] = products.map(product => {
      const price = parseFloat(product.node.priceRange.minVariantPrice.amount);
      return {
        baseTitle: product.node.title,
        products: [product],
        primaryProduct: product,
        flavors: [],
        minPrice: price,
        maxPrice: price,
        productType: product.node.productType || '',
      };
    });

    // Sort by title
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
