import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartSimple,
  Check,
  SpinnerGap,
  ShieldCheck,
  Flask,
  Truck,
  ChatCircleDots,
  Repeat,
  CaretDown,
} from '@phosphor-icons/react';
import { ProductDetail, ShopifyProduct, getSellingPlans, calculateSubscriptionPrice, getDiscountPercentage, getDeliveryFrequency, SellingPlan } from '@/lib/shopify';
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
  const [purchaseMode, setPurchaseMode] = useState<'once' | 'subscribe'>('once');
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  
  const addItem = useCartStore(state => state.addItem);
  
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  const hasMultipleVariants = variants.length > 1;

  const sellingPlans = getSellingPlans(product);
  const hasSubscription = sellingPlans.length > 0;
  const selectedPlan = sellingPlans[selectedPlanIndex] || null;
  
  const basePrice = parseFloat(price.amount);
  const subscriptionPrice = selectedPlan ? calculateSubscriptionPrice(basePrice, selectedPlan) : basePrice;
  const discountPct = selectedPlan ? getDiscountPercentage(selectedPlan) : null;

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
        ...(purchaseMode === 'subscribe' && selectedPlan ? {
          sellingPlanId: selectedPlan.id,
          sellingPlanName: selectedPlan.name,
        } : {}),
      });
      
      setJustAdded(true);
      toast.success(
        purchaseMode === 'subscribe' ? 'Added to your monthly pack' : 'Added to cart',
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

      {/* ═══ Purchase Options ═══ */}
      <div className="space-y-3 pt-1">
        <p className="text-sm font-medium text-foreground/70 uppercase tracking-wider">Purchase options</p>
        
        {/* Buy Once */}
        <button
          onClick={() => setPurchaseMode('once')}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
            purchaseMode === 'once'
              ? "border-foreground bg-[#F8FAFC] dark:bg-muted/20"
              : "border-[#E2E8F0] dark:border-border/30 hover:border-foreground/30"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
              purchaseMode === 'once' ? "border-foreground" : "border-foreground/30"
            )}>
              {purchaseMode === 'once' && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
            </div>
            <span className="font-medium text-foreground">Buy once</span>
          </div>
          <span className="text-lg font-bold text-foreground">{basePrice.toFixed(2)} €</span>
        </button>

        {/* Subscribe & Save */}
        {hasSubscription && (
          <div>
            <button
              onClick={() => setPurchaseMode('subscribe')}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                purchaseMode === 'subscribe'
                  ? "border-primary bg-primary/5"
                  : "border-[#E2E8F0] dark:border-border/30 hover:border-primary/30",
                "rounded-b-none"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  purchaseMode === 'subscribe' ? "border-primary" : "border-foreground/30"
                )}>
                  {purchaseMode === 'subscribe' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div>
                  <span className="font-medium text-foreground">Subscribe & Save</span>
                  {discountPct && (
                    <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs">
                      -{discountPct}%
                    </Badge>
                  )}
                </div>
              </div>
              <span className="text-lg font-bold text-primary">{subscriptionPrice.toFixed(2)} €</span>
            </button>

            {/* Frequency selector (shown when subscribe is selected) */}
            {purchaseMode === 'subscribe' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-2 border-t-0 border-primary rounded-b-2xl bg-primary/5 p-4 space-y-3"
              >
                <p className="text-xs text-foreground/60 font-medium">Deliver every:</p>
                <div className="flex flex-wrap gap-2">
                  {sellingPlans.map((plan, index) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlanIndex(index)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm transition-all border",
                        selectedPlanIndex === index
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-[#E2E8F0] dark:border-border/50 text-foreground/70 hover:border-primary/50"
                      )}
                    >
                      {getDeliveryFrequency(plan)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-foreground/50 font-light flex items-center gap-1.5">
                  <Repeat weight="light" className="w-3.5 h-3.5" />
                  Free shipping • Cancel anytime
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* CTA Button */}
      <motion.button
        onClick={handleAddToCart}
        disabled={isAdding || !selectedVariant?.availableForSale}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-6 h-14 rounded-2xl text-base font-semibold transition-all",
          justAdded
            ? "bg-green-500/20 text-green-600 border border-green-500/30"
            : purchaseMode === 'subscribe'
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-[#0B1220] hover:bg-[#0B1220]/90 text-white dark:bg-foreground dark:text-background",
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
            Add to pack
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
