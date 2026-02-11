import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Check, SpinnerGap, Package } from '@phosphor-icons/react';
import { useCartStore } from '@/stores/cartStore';
import { useSupplementTracking } from '@/hooks/useSupplementTracking';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { toast } from 'sonner';
import { 
  parseSubscriptionBlock, 
  ParsedSubscriptionBlock,
  SUBSCRIPTION_DISCOUNT_RATE 
} from '@/lib/subscription-calculator';
import { inferTimeOfDay } from '@/lib/infer-time-of-day';
import { SubscriptionCard } from './SubscriptionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ProductRecommendation {
  productId: string;
  variantId: string;
  name: string;
  price: string;
}

interface ProductData {
  imageUrl: string;
  title: string;
  price: string;
  currency: string;
  variantId: string;
  fullProduct: ShopifyProduct;
}

interface ProductRecommendationCardProps {
  product: ProductRecommendation;
}

// Skeleton loading state
function ProductCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm my-3">
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Error state
function ProductCardError() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 my-3">
      <Package weight="duotone" className="w-8 h-8 text-destructive/60" />
      <span className="text-sm text-muted-foreground">Produit non disponible</span>
    </div>
  );
}

// Module-level cache for all products (shared across instances)
let allProductsCache: ShopifyProduct[] | null = null;
let allProductsPromise: Promise<ShopifyProduct[]> | null = null;

function ensureAllProducts(): Promise<ShopifyProduct[]> {
  if (!allProductsPromise) {
    allProductsPromise = fetchProducts(100).then(products => {
      allProductsCache = products;
      return products;
    });
  }
  return allProductsPromise;
}

function findProductInCache(productId: string, productName: string): ShopifyProduct | null {
  if (!allProductsCache) return null;
  const numericId = productId.split('/').pop() || productId;
  
  // Try match by numeric ID
  for (const p of allProductsCache) {
    const pNumId = p.node.id.split('/').pop() || '';
    if (pNumId === numericId) return p;
    // Also check variant IDs
    for (const v of p.node.variants.edges) {
      const vNumId = v.node.id.split('/').pop() || '';
      if (vNumId === numericId) return p;
    }
  }
  
  // Fallback: fuzzy match by product name
  const normalizedName = productName.toLowerCase().trim();
  for (const p of allProductsCache) {
    if (p.node.title.toLowerCase().trim() === normalizedName) return p;
  }
  // Partial match
  for (const p of allProductsCache) {
    if (p.node.title.toLowerCase().includes(normalizedName) || normalizedName.includes(p.node.title.toLowerCase())) return p;
  }
  
  return null;
}

export function ProductRecommendationCard({ product }: ProductRecommendationCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToTracking, setIsAddingToTracking] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToTracking, setAddedToTracking] = useState(false);
  
  const addItem = useCartStore(state => state.addItem);
  const { addSupplement } = useSupplementTracking();

  // Resolve product from shared cache
  useEffect(() => {
    setIsLoading(true);
    setError(false);
    
    ensureAllProducts().then(() => {
      const found = findProductInCache(product.productId, product.name);
      if (found) {
        setProductData({
          imageUrl: found.node.images.edges[0]?.node.url || '',
          title: found.node.title,
          price: found.node.priceRange.minVariantPrice.amount,
          currency: found.node.priceRange.minVariantPrice.currencyCode,
          variantId: found.node.variants.edges[0]?.node.id || product.variantId,
          fullProduct: found,
        });
      } else {
        console.warn(`Product not found in cache: ID=${product.productId}, Name=${product.name}`);
        setError(true);
      }
      setIsLoading(false);
    }).catch(() => {
      setError(true);
      setIsLoading(false);
    });
  }, [product.productId, product.name]);

  const handleAddToCart = async () => {
    if (!productData) return;
    
    setIsAddingToCart(true);
    try {
      const variant = productData.fullProduct.node.variants.edges[0]?.node;
      if (!variant) {
        toast.error("Variante non disponible");
        return;
      }

      await addItem({
        product: productData.fullProduct,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || []
      });

      setAddedToCart(true);
      toast.success(`${productData.title} ajouté au panier`);
      
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToTracking = async () => {
    if (!productData) return;
    
    setIsAddingToTracking(true);
    try {
      const bestTime = inferTimeOfDay(
        productData.title,
        productData.fullProduct.node.description || ''
      );
      const { error } = await addSupplement({
        shopify_product_id: product.productId,
        product_name: productData.title,
        dosage: null,
        time_of_day: bestTime,
        recommended_by_ai: true,
        active: true
      });

      if (error) {
        toast.error("Erreur lors de l'ajout au suivi");
        return;
      }

      setAddedToTracking(true);
      toast.success(`${productData.title} ajouté au suivi`);
      
      setTimeout(() => setAddedToTracking(false), 2000);
    } catch (error) {
      console.error('Error adding to tracking:', error);
      toast.error("Erreur lors de l'ajout au suivi");
    } finally {
      setIsAddingToTracking(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <ProductCardSkeleton />;
  }

  // Error state
  if (error || !productData) {
    return <ProductCardError />;
  }

  // Format price
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: productData.currency,
  }).format(parseFloat(productData.price));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 backdrop-blur-sm my-3 hover:border-primary/40 transition-all duration-300"
    >
      {/* Gradient glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Product Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
        {productData.imageUrl ? (
          <img 
            src={productData.imageUrl} 
            alt={productData.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package weight="duotone" className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
            {productData.title}
          </h4>
          <p className="text-primary font-bold text-base mt-1">
            {formattedPrice}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || addedToCart}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              addedToCart 
                ? "bg-secondary/20 text-secondary border border-secondary/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isAddingToCart ? (
              <SpinnerGap weight="bold" className="w-3.5 h-3.5 animate-spin" />
            ) : addedToCart ? (
              <Check weight="bold" className="w-3.5 h-3.5" />
            ) : (
              <ShoppingCart weight="bold" className="w-3.5 h-3.5" />
            )}
            {addedToCart ? 'Ajouté' : 'Panier'}
          </button>
          
          <button
            onClick={handleAddToTracking}
            disabled={isAddingToTracking || addedToTracking}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
              addedToTracking 
                ? "bg-secondary/20 text-secondary border-secondary/30"
                : "bg-white/5 text-foreground/80 hover:bg-white/10 border-white/20"
            )}
          >
            {isAddingToTracking ? (
              <SpinnerGap weight="bold" className="w-3.5 h-3.5 animate-spin" />
            ) : addedToTracking ? (
              <Check weight="bold" className="w-3.5 h-3.5" />
            ) : (
              <Plus weight="bold" className="w-3.5 h-3.5" />
            )}
            {addedToTracking ? 'Ajouté' : 'Suivi'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Parse product tags from AI response - improved to handle edge cases
export function parseProductRecommendations(content: string): {
  text: string;
  products: ProductRecommendation[];
  subscription: ParsedSubscriptionBlock | null;
} {
  // First, check for subscription blocks
  const subscriptionResult = parseSubscriptionBlock(content);
  let textToProcess = subscriptionResult.text;
  
  // Format: [[PRODUCT:productId:variantId:nom:prix]]
  // Support both numeric IDs and GIDs (gid://shopify/...) which contain colons
  const regex = /\[\[PRODUCT:((?:gid:\/\/[^:\]]+\/[^:\]]+\/[^:\]]+|[^:\]]+)):((?:gid:\/\/[^:\]]+\/[^:\]]+\/[^:\]]+|[^:\]]+)):([^:\]]+):([^\]]+)\]\]/g;
  const products: ProductRecommendation[] = [];
  
  // Replace product tags with placeholders
  const text = textToProcess.replace(regex, (match, productId, variantId, name, price) => {
    if (productId && variantId && name && price) {
      products.push({ 
        productId: productId.trim(), 
        variantId: variantId.trim(), 
        name: name.trim(), 
        price: price.trim() 
      });
      return `__PRODUCT_${products.length - 1}__`;
    }
    return '';
  });
  
  // Clean up any remaining malformed product tags and orphan text
  const cleanedText = text
    .replace(/\[\[PRODUCT:[^\]]*\]\]/g, '')   // Remove remaining malformed closed tags
    .replace(/\[\[PRODUCT:[^\]]*$/gm, '')     // Remove unclosed tags at end
    .replace(/\[\[PROD[^\]]*$/gm, '')         // Remove partial tag starts
    .replace(/\[\[P[^\]]*$/gm, '')            // Remove very early partial tags
    .replace(/\[\[[^\]]*$/gm, '')             // Remove any unclosed [[ at end of line
    .replace(/\bproduit\s*:\s*$/gim, '')      // Remove orphan "produit:" at end
    .replace(/\bproduit\s*:\s*\n/gi, '\n')    // Remove orphan "produit:" mid-text
    .replace(/\bproduit\s*:\s*(?=\s|$)/gim, '') // Remove standalone "produit:" anywhere
    .replace(/^\s*\n/gm, '\n')               // Clean up extra blank lines
    .trim();
  
  return { 
    text: cleanedText, 
    products,
    subscription: subscriptionResult.subscription
  };
}

// Export the SubscriptionCard for use in ChatInterface
export { SubscriptionCard } from './SubscriptionCard';
export type { ParsedSubscriptionBlock } from '@/lib/subscription-calculator';
