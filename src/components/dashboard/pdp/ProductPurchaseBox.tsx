import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartSimple,
  Check,
  SpinnerGap,
  Repeat,
  ShieldCheck,
  Flask,
  Truck,
  ChatCircleDots,
} from '@phosphor-icons/react';
import { ProductDetail, ShopifyProduct, getAllSellingPlans, getSellingPlanDiscount, SellingPlan } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ParsedProductData } from '@/lib/shopify-parser';
import { useTranslation } from '@/hooks/useTranslation';

interface ProductPurchaseBoxProps {
  product: ProductDetail;
  parsedData: ParsedProductData | null;
  relatedProducts?: Array<{ flavor: string; handle: string }>;
  onFlavorChange?: (handle: string) => void;
  enrichedSummary?: string | null;
}

export function ProductPurchaseBox({ 
  product, 
  parsedData, 
  relatedProducts,
  onFlavorChange,
  enrichedSummary,
}: ProductPurchaseBoxProps) {
  const { t } = useTranslation();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<'one-time' | 'subscribe'>('one-time');
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  
  const addItem = useCartStore(state => state.addItem);
  
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  const hasMultipleVariants = variants.length > 1;

  // Selling plans
  const sellingPlans = getAllSellingPlans(product);
  const hasSubscription = sellingPlans.length > 0;
  const selectedPlan: SellingPlan | null = hasSubscription ? sellingPlans[selectedPlanIndex] : null;
  const discountPercent = selectedPlan ? getSellingPlanDiscount(selectedPlan) : 0;
  const subscriptionPrice = discountPercent > 0
    ? (parseFloat(price.amount) * (1 - discountPercent / 100)).toFixed(2)
    : null;

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
        ...(purchaseMode === 'subscribe' && selectedPlan ? { sellingPlanId: selectedPlan.id } : {}),
      });
      
      setJustAdded(true);
      toast.success(
        purchaseMode === 'subscribe' ? 'Subscription added to cart' : 'Added to your stack',
        { description: product.title, position: 'top-center' }
      );
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      toast.error(t('shop.addError'));
    } finally {
      setIsAdding(false);
    }
  };

  const trustItems = [
    { icon: ShieldCheck, label: 'Lab-tested' },
    { icon: Flask, label: 'Clean formula' },
    { icon: Truck, label: 'Easy daily routine' },
  ];

  return (
    <div className="lg:sticky lg:top-24 space-y-5">
      {/* Vendor & Title */}
      <div>
        {product.vendor && (
          <p className="text-sm text-primary font-medium uppercase tracking-wider mb-1">
            {product.vendor?.replace(/vitasync\s*2/i, 'VitaSync') || product.vendor}
          </p>
        )}
        <h1 className="text-[34px] lg:text-[40px] font-semibold text-foreground leading-tight tracking-tight">
          {product.title}
        </h1>
        {product.productType && (
          <Badge variant="secondary" className="mt-3">
            {product.productType}
          </Badge>
        )}
      </div>

      {/* Enriched Summary */}
      {(enrichedSummary || parsedData?.benefits?.[0]) && (
        <p className="text-[16px] lg:text-[18px] text-[#475569] dark:text-foreground/70 font-light leading-relaxed">
          {enrichedSummary || parsedData?.benefits?.[0]}
        </p>
      )}

      {/* Trust Strip */}
      <div className="flex items-center gap-4 py-2 flex-wrap">
        {trustItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <item.icon weight="light" className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs text-foreground/60 font-light">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Flavor Selector */}
      {relatedProducts && relatedProducts.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm text-foreground/60 font-medium">{t('pdp.flavorVariant')}</p>
          <div className="flex flex-wrap gap-2">
            {relatedProducts.map((related) => (
              <button
                key={related.handle}
                onClick={() => onFlavorChange?.(related.handle)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm transition-all border",
                  related.handle === product.handle
                    ? "bg-[#0B1220] text-white border-[#0B1220] dark:bg-foreground dark:text-background dark:border-foreground"
                    : "bg-[#F1F5F9] dark:bg-muted/30 text-foreground/70 border-[#E2E8F0] dark:border-border/50 hover:border-foreground/30"
                )}
              >
                {related.flavor}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Variant Selector */}
      {hasMultipleVariants && (
        <div className="space-y-2">
          <p className="text-sm text-foreground/60 font-medium">
            {t('pdp.size')}: {selectedVariant?.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant, index) => (
              <button
                key={variant.node.id}
                onClick={() => setSelectedVariantIndex(index)}
                disabled={!variant.node.availableForSale}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm transition-all border",
                  selectedVariantIndex === index
                    ? "bg-[#0B1220] text-white border-[#0B1220] dark:bg-foreground dark:text-background dark:border-foreground"
                    : variant.node.availableForSale
                    ? "bg-[#F1F5F9] dark:bg-muted/30 text-foreground/70 border-[#E2E8F0] dark:border-border/50 hover:border-foreground/30"
                    : "bg-muted/20 text-foreground/30 border-border/30 cursor-not-allowed line-through"
                )}
              >
                {variant.node.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Mode Toggle (One-time vs Subscribe) */}
      {hasSubscription ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPurchaseMode('one-time')}
              className={cn(
                "p-3 rounded-xl border text-left transition-all",
                purchaseMode === 'one-time'
                  ? "border-foreground/30 bg-[#F8FAFC] dark:bg-muted/30 ring-1 ring-foreground/10"
                  : "border-[#E2E8F0] dark:border-border/30 hover:border-foreground/20"
              )}
            >
              <p className="text-sm font-medium text-foreground">One-time</p>
              <p className="text-lg font-bold text-foreground mt-1">
                {parseFloat(price.amount).toFixed(2)} €
              </p>
            </button>
            <button
              onClick={() => setPurchaseMode('subscribe')}
              className={cn(
                "p-3 rounded-xl border text-left transition-all relative overflow-hidden",
                purchaseMode === 'subscribe'
                  ? "border-secondary/50 bg-secondary/5 ring-1 ring-secondary/20"
                  : "border-[#E2E8F0] dark:border-border/30 hover:border-secondary/30"
              )}
            >
              {discountPercent > 0 && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-bold">
                  -{discountPercent}%
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <Repeat weight="bold" className="w-3.5 h-3.5 text-secondary" />
                <p className="text-sm font-medium text-foreground">Subscribe</p>
              </div>
              <p className="text-lg font-bold text-foreground mt-1">
                {subscriptionPrice || parseFloat(price.amount).toFixed(2)} €
                <span className="text-xs font-normal text-foreground/50">/mo</span>
              </p>
            </button>
          </div>

          {/* Plan selector when subscribe is active */}
          {purchaseMode === 'subscribe' && sellingPlans.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {sellingPlans.map((plan, idx) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanIndex(idx)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs border transition-all",
                    selectedPlanIndex === idx
                      ? "bg-secondary/10 border-secondary/40 text-secondary font-medium"
                      : "border-[#E2E8F0] dark:border-border/30 text-foreground/60 hover:border-secondary/30"
                  )}
                >
                  {plan.name}
                </button>
              ))}
            </div>
          )}

          {purchaseMode === 'subscribe' && selectedPlan && (
            <p className="text-xs text-foreground/50 font-light flex items-center gap-1.5">
              <Repeat weight="light" className="w-3.5 h-3.5" />
              {selectedPlan.name} • Pause or cancel anytime • Free shipping
            </p>
          )}
        </div>
      ) : (
        /* No subscription available — just show price */
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] lg:text-[28px] font-bold text-foreground">
            {parseFloat(price.amount).toFixed(2)} €
          </span>
          <span className="text-sm text-foreground/50">
            {selectedVariant?.availableForSale ? t('pdp.inStock') : t('pdp.outOfStock')}
          </span>
        </div>
      )}

      {/* Stock indicator when subscription mode */}
      {hasSubscription && (
        <span className="text-sm text-foreground/50">
          {selectedVariant?.availableForSale ? t('pdp.inStock') : t('pdp.outOfStock')}
        </span>
      )}

      {/* CTAs */}
      <div className="space-y-3">
        <motion.button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedVariant?.availableForSale}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-6 h-12 rounded-xl text-base font-semibold transition-all",
            justAdded
              ? "bg-green-500/20 text-green-600 border border-green-500/30"
              : purchaseMode === 'subscribe'
              ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              : "bg-primary hover:bg-primary/90 text-primary-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isAdding ? (
            <SpinnerGap className="w-5 h-5 animate-spin" />
          ) : justAdded ? (
            <>
              <Check weight="bold" className="w-5 h-5" />
              Added!
            </>
          ) : purchaseMode === 'subscribe' ? (
            <>
              <Repeat weight="bold" className="w-5 h-5" />
              Subscribe & Save
            </>
          ) : (
            <>
              <ShoppingCartSimple weight="bold" className="w-5 h-5" />
              Add to cart
            </>
          )}
        </motion.button>

        {/* Ask VitaSync */}
        <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          <ChatCircleDots weight="light" className="w-4 h-4" />
          Ask VitaSync about this
        </button>
      </div>

      {/* Certifications */}
      {parsedData && parsedData.certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {parsedData.certifications.map((cert) => (
            <Badge key={cert} variant="outline" className="text-xs">
              {cert}
            </Badge>
          ))}
        </div>
      )}

      {/* Micro Disclaimer */}
      <p className="text-xs text-foreground/40 text-center font-light">
        {t('pdp.disclaimer')}
      </p>
    </div>
  );
}
