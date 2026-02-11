import { ShoppingCartSimple, Check, SpinnerGap } from '@phosphor-icons/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductDetail, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MobileStickyCartProps {
  product: ProductDetail;
  selectedVariantIndex: number;
}

export function MobileStickyCart({ product, selectedVariantIndex }: MobileStickyCartProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  const addItem = useCartStore(state => state.addItem);
  
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;

  const handleAddToCart = async () => {
    if (!selectedVariant || isAdding) return;

    setIsAdding(true);
    try {
      const cartProduct: ShopifyProduct = {
        node: {
          id: product.id,
          title: product.title,
          description: product.description,
          handle: product.handle,
          productType: product.productType,
          vendor: product.vendor,
          priceRange: product.priceRange,
          images: product.images,
          variants: product.variants,
          options: product.options,
        }
      };

      await addItem({
        product: cartProduct,
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity: 1,
        selectedOptions: selectedVariant.selectedOptions || [],
      });
      
      setJustAdded(true);
      toast.success('Added to your monthly stack', {
        description: product.title,
        position: 'top-center',
      });
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-lg border-t border-border/50 lg:hidden z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center gap-4 h-full px-4 max-w-lg mx-auto">
        {/* Price */}
        <div className="flex-shrink-0">
          <p className="text-lg font-bold text-foreground">
            {parseFloat(price.amount).toFixed(2)} €
          </p>
        </div>

        {/* Add to pack CTA */}
        <motion.button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedVariant?.availableForSale}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all",
            justAdded
              ? "bg-green-500/20 text-green-600 border border-green-500/30"
              : "bg-secondary hover:bg-secondary/90 text-[#0B1220]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isAdding ? (
            <SpinnerGap className="w-4 h-4 animate-spin" />
          ) : justAdded ? (
            <>
              <Check weight="bold" className="w-4 h-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCartSimple weight="bold" className="w-4 h-4" />
              Add to pack
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
