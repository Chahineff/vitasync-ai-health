import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Check, SpinnerGap } from '@phosphor-icons/react';
import { useCartStore } from '@/stores/cartStore';
import { useSupplementTracking } from '@/hooks/useSupplementTracking';
import { fetchProductById } from '@/lib/shopify';
import { toast } from 'sonner';
import { 
  parseSubscriptionBlock, 
  ParsedSubscriptionBlock,
  SUBSCRIPTION_DISCOUNT_RATE 
} from '@/lib/subscription-calculator';
import { SubscriptionCard } from './SubscriptionCard';

export interface ProductRecommendation {
  productId: string;
  variantId: string;
  name: string;
  price: string;
}

interface ProductRecommendationCardProps {
  product: ProductRecommendation;
}

export function ProductRecommendationCard({ product }: ProductRecommendationCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToTracking, setIsAddingToTracking] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToTracking, setAddedToTracking] = useState(false);
  
  const addItem = useCartStore(state => state.addItem);
  const { addSupplement } = useSupplementTracking();

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      // Fetch full product from Shopify
      const fullProduct = await fetchProductById(product.productId);
      
      if (!fullProduct) {
        toast.error("Produit introuvable");
        return;
      }

      const variant = fullProduct.node.variants.edges[0]?.node;
      if (!variant) {
        toast.error("Variante non disponible");
        return;
      }

      await addItem({
        product: fullProduct,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || []
      });

      setAddedToCart(true);
      toast.success(`${product.name} ajouté au panier`);
      
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToTracking = async () => {
    setIsAddingToTracking(true);
    try {
      const { error } = await addSupplement({
        shopify_product_id: product.productId,
        product_name: product.name,
        dosage: null,
        time_of_day: 'morning',
        recommended_by_ai: true,
        active: true
      });

      if (error) {
        toast.error("Erreur lors de l'ajout au suivi");
        return;
      }

      setAddedToTracking(true);
      toast.success(`${product.name} ajouté au suivi`);
      
      setTimeout(() => setAddedToTracking(false), 2000);
    } catch (error) {
      console.error('Error adding to tracking:', error);
      toast.error("Erreur lors de l'ajout au suivi");
    } finally {
      setIsAddingToTracking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex flex-wrap items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 my-2"
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground text-sm">{product.name}</span>
        <span className="text-primary font-semibold text-sm">{product.price}</span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || addedToCart}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/20 text-secondary-foreground text-xs font-medium hover:bg-secondary/30 transition-colors disabled:opacity-70 border border-secondary/30"
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
    </motion.div>
  );
}

// Parse product tags from AI response
export function parseProductRecommendations(content: string): {
  text: string;
  products: ProductRecommendation[];
  subscription: ParsedSubscriptionBlock | null;
} {
  // First, check for subscription blocks
  const subscriptionResult = parseSubscriptionBlock(content);
  let textToProcess = subscriptionResult.text;
  
  // Format: [[PRODUCT:productId:variantId:nom:prix]]
  const regex = /\[\[PRODUCT:([^:]+):([^:]+):([^:]+):([^\]]+)\]\]/g;
  const products: ProductRecommendation[] = [];
  
  const text = textToProcess.replace(regex, (_, productId, variantId, name, price) => {
    products.push({ productId, variantId, name, price });
    return `__PRODUCT_${products.length - 1}__`; // Placeholder for React rendering
  });
  
  return { 
    text, 
    products,
    subscription: subscriptionResult.subscription
  };
}

// Export the SubscriptionCard for use in ChatInterface
export { SubscriptionCard } from './SubscriptionCard';
export type { ParsedSubscriptionBlock } from '@/lib/subscription-calculator';
