import { ShoppingCartSimple, Check, SpinnerGap, Repeat } from '@phosphor-icons/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductDetail, ShopifyProduct, getSellingPlans, calculateSubscriptionPrice } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { cn, formatPriceUSD } from '@/lib/utils';

interface MobileStickyCartProps {
  product: ProductDetail;
  selectedVariantIndex: number;
  purchaseMode?: 'once' | 'subscribe';
  subscriptionPrice?: number;
}

export function MobileStickyCart({ product, selectedVariantIndex, purchaseMode = 'subscribe', subscriptionPrice }: MobileStickyCartProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  const addItem = useCartStore(state => state.addItem);
  
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const basePrice = selectedVariant?.price || product.priceRange.minVariantPrice;

  const sellingPlans = getSellingPlans(product);
  const selectedPlan = sellingPlans[0] || null;
  const effectiveMode = sellingPlans.length > 0 ? purchaseMode : 'once';
  
  const displayPrice = effectiveMode === 'subscribe' && subscriptionPrice
    ? subscriptionPrice
    : effectiveMode === 'subscribe' && selectedPlan
    ? calculateSubscriptionPrice(parseFloat(basePrice.amount), selectedPlan)
    : parseFloat(basePrice.amount);

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
        ...(effectiveMode === 'subscribe' && selectedPlan ? {
          sellingPlanId: selectedPlan.id,
          sellingPlanName: selectedPlan.name,
        } : {}),
      });
      setJustAdded(true);
      toast.success(t('pdp.addedToRoutine'), {
        description: product.title,
        position: 'top-center',
      });
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      toast.error(t('pdp.addFailed'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/50 lg:hidden z-40 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center gap-3 h-16 px-4 max-w-lg mx-auto">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{product.title}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-foreground">{formatPriceUSD(displayPrice)}</span>
            {effectiveMode === 'subscribe' && (
              <span className="text-[10px] text-primary font-medium">{t('pdp.perMonth')}</span>
            )}
          </div>
        </div>

        <motion.button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedVariant?.availableForSale}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold transition-all flex-shrink-0",
            justAdded
              ? "bg-green-500/20 text-green-600 border border-green-500/30"
              : effectiveMode === 'subscribe'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isAdding ? (
            <SpinnerGap className="w-4 h-4 animate-spin" />
          ) : justAdded ? (
            <><Check weight="bold" className="w-4 h-4" /> OK</>
          ) : effectiveMode === 'subscribe' ? (
            <><Repeat weight="bold" className="w-4 h-4" /> {t('pdp.subscribe')}</>
          ) : (
            <><ShoppingCartSimple weight="bold" className="w-4 h-4" /> {t('pdp.add')}</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}