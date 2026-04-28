import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartSimple,
  Check,
  SpinnerGap,
  ChatCircleDots,
  Repeat,
  Minus,
  Plus,
  Star,
  Package,
  CheckCircle,
  ShieldCheck,
  Truck,
  CurrencyDollar,
  ArrowsClockwise,
  CalendarCheck,
  Pill,
  Clock,
  Timer,
} from '@phosphor-icons/react';
import { ProductDetail, ShopifyProduct, getSellingPlans, calculateSubscriptionPrice, getDiscountPercentage, getDeliveryFrequency } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn, formatPriceUSD } from '@/lib/utils';
import { ParsedProductData } from '@/lib/shopify-parser';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { addBusinessDays, format } from 'date-fns';
import { fr, enUS, es, ar, zhCN, pt } from 'date-fns/locale';

const dateFnsLocales: Record<string, typeof fr> = { fr, en: enUS, es, ar, zh: zhCN, pt };

interface ProductPurchaseBoxProps {
  product: ProductDetail;
  parsedData: ParsedProductData | null;
  relatedProducts?: Array<{ flavor: string; handle: string }>;
  onFlavorChange?: (handle: string) => void;
  enrichedSummary?: string | null;
  reviewRating?: number | null;
  reviewCount?: number | null;
  isInStack?: boolean;
}

export function ProductPurchaseBox({ 
  product, 
  parsedData, 
  relatedProducts,
  onFlavorChange,
  enrichedSummary,
  reviewRating,
  reviewCount,
  isInStack,
}: ProductPurchaseBoxProps) {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<'once' | 'subscribe'>('subscribe');
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
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
  const effectiveMode = hasSubscription ? purchaseMode : 'once';

  // Estimated delivery dates
  const deliveryStart = addBusinessDays(new Date(), 3);
  const deliveryEnd = addBusinessDays(new Date(), 5);
  const dateFnsLocale = dateFnsLocales[locale] || enUS;
  const deliveryText = `${format(deliveryStart, 'EEE d', { locale: dateFnsLocale })} - ${format(deliveryEnd, 'EEE d MMM', { locale: dateFnsLocale })}`;

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
        quantity: quantity,
        selectedOptions: selectedVariant.selectedOptions || [],
        ...(effectiveMode === 'subscribe' && selectedPlan ? {
          sellingPlanId: selectedPlan.id,
          sellingPlanName: selectedPlan.name,
        } : {}),
      });
      setJustAdded(true);
      toast.success(
        effectiveMode === 'subscribe' ? t('pdp.addedToRoutine') : t('pdp.addedToCartToast'),
        { description: product.title, position: 'top-center' }
      );
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      toast.error(t('shop.addError'));
    } finally {
      setIsAdding(false);
    }
  };

  const scrollToReviews = () => {
    const el = document.getElementById('product-reviews');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Vendor & Title */}
      <div>
        {product.vendor && (
          <p className="text-sm text-primary font-medium uppercase tracking-wider mb-1">
            {product.vendor?.replace(/vitasync\s*2/i, 'VitaSync') || product.vendor}
          </p>
        )}
        <h1 className="text-[30px] lg:text-[36px] font-semibold text-foreground leading-tight tracking-tight">
          {product.title}
        </h1>

        {/* Star Rating */}
        {reviewRating && reviewRating > 0 && (
          <button onClick={scrollToReviews} className="flex items-center gap-2 mt-2 group">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  weight="fill"
                  className={cn(
                    'w-4 h-4',
                    i <= Math.round(reviewRating) ? 'text-amber-400' : 'text-foreground/15'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-foreground/50 group-hover:text-foreground/70 transition-colors">
              {reviewRating.toFixed(1)} {reviewCount ? `· ${reviewCount} ${t('pdp.reviews')}` : ''}
            </span>
          </button>
        )}

        {/* Stack indicator */}
        {isInStack !== undefined && (
          <div className={cn(
            "flex items-center gap-1.5 mt-2 text-sm font-medium",
            isInStack ? "text-green-600 dark:text-green-400" : "text-foreground/40"
          )}>
            {isInStack ? (
              <>
                <CheckCircle weight="fill" className="w-4 h-4" />
                {t('pdp.inYourRoutine')}
              </>
            ) : (
              <span className="text-xs font-light">{t('pdp.notInYourRoutine')}</span>
            )}
          </div>
        )}

        {product.productType && (
          <Badge variant="secondary" className="mt-3">
            {product.productType}
          </Badge>
        )}
      </div>

      {/* Enriched Summary */}
      {(enrichedSummary || parsedData?.benefits?.[0]) && (
        <p className="text-[15px] lg:text-[16px] text-foreground/60 font-light leading-relaxed">
          {enrichedSummary || parsedData?.benefits?.[0]}
        </p>
      )}

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
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted/30 text-foreground/70 border-border/50 hover:border-foreground/30"
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
                    ? "bg-foreground text-background border-foreground"
                    : variant.node.availableForSale
                    ? "bg-muted/30 text-foreground/70 border-border/50 hover:border-foreground/30"
                    : "bg-muted/20 text-foreground/30 border-border/30 cursor-not-allowed line-through"
                )}
              >
                {variant.node.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Options */}
      <div className="space-y-3">
        {hasSubscription && (
          <button
            onClick={() => setPurchaseMode('subscribe')}
            className={cn(
              "w-full text-left rounded-2xl border-2 transition-all overflow-hidden",
              effectiveMode === 'subscribe'
                ? "border-primary bg-primary/5"
                : "border-border/30 hover:border-primary/30"
            )}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                  effectiveMode === 'subscribe' ? "border-primary" : "border-foreground/30"
                )}>
                  {effectiveMode === 'subscribe' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div>
                  <span className="font-semibold text-foreground">
                    {selectedPlan ? `${t('pdp.subscription')} — ${getDeliveryFrequency(selectedPlan)}` : t('pdp.subscription')}
                  </span>
                  {discountPct && (
                    <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                      -{discountPct}%
                    </Badge>
                  )}
                </div>
              </div>
              <span className="text-lg font-bold text-primary">{formatPriceUSD(subscriptionPrice)}</span>
            </div>
            {effectiveMode === 'subscribe' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-4 pb-4 space-y-3"
              >
                <p className="text-sm text-foreground/60 font-light pl-8">
                  {t('pdp.subscriptionDesc')}
                </p>
                {sellingPlans.length > 1 && (
                  <div className="flex flex-wrap gap-2 pl-8">
                    {sellingPlans.map((plan, index) => (
                      <span
                        key={plan.id}
                        role="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedPlanIndex(index); }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all border cursor-pointer",
                          selectedPlanIndex === index
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border/50 text-foreground/70 hover:border-primary/50"
                        )}
                      >
                        {getDeliveryFrequency(plan)}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </button>
        )}

        <button
          onClick={() => setPurchaseMode('once')}
          className="w-full flex items-center justify-between py-3 px-1 text-left group"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
              effectiveMode === 'once' ? "border-foreground/60" : "border-foreground/20"
            )}>
              {effectiveMode === 'once' && <div className="w-2 h-2 rounded-full bg-foreground/60" />}
            </div>
            <span className="text-sm text-foreground/50 font-light group-hover:text-foreground/70 transition-colors">
              {t('pdp.oneTime')}
            </span>
          </div>
          <span className="text-sm text-foreground/50 font-light">{formatPriceUSD(basePrice)}</span>
        </button>
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground/60 font-medium">{t('pdp.quantity')}</span>
        <div className="flex items-center gap-3 border border-border/50 rounded-xl px-2 py-1">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground">
            <Minus weight="bold" className="w-4 h-4" />
          </button>
          <span className="text-base font-semibold text-foreground w-8 text-center">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground">
            <Plus weight="bold" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Annual savings callout */}
      {hasSubscription && effectiveMode === 'subscribe' && discountPct && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20"
        >
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 text-center">
            💰 {t('pdp.annualSavings')}: {formatPriceUSD((basePrice - subscriptionPrice) * 12)}/{t('pdp.perYear')}
          </p>
        </motion.div>
      )}

      {/* CTA */}
      <motion.button
        onClick={handleAddToCart}
        disabled={isAdding || !selectedVariant?.availableForSale}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full flex items-center justify-center gap-2 px-6 h-14 rounded-2xl text-base font-semibold transition-all",
          justAdded
            ? "bg-green-500/20 text-green-600 border border-green-500/30"
            : effectiveMode === 'subscribe'
              ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              : "bg-foreground hover:bg-foreground/90 text-background",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isAdding ? (
          <SpinnerGap className="w-5 h-5 animate-spin" />
        ) : justAdded ? (
          <><Check weight="bold" className="w-5 h-5" /> {t('pdp.added')}</>
        ) : effectiveMode === 'subscribe' ? (
          <><Repeat weight="bold" className="w-5 h-5" /> {t('pdp.startMyRoutine')}</>
        ) : (
          <><ShoppingCartSimple weight="bold" className="w-5 h-5" /> {t('pdp.addToCart')}</>
        )}
      </motion.button>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Truck, label: t('pdp.trustFreeShipping') },
          { icon: ShieldCheck, label: t('pdp.trustSecurePayment') },
          { icon: CheckCircle, label: t('pdp.trustSatisfaction') },
        ].map((badge, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl bg-muted/40 border border-border/30">
            <badge.icon weight="duotone" className="w-5 h-5 text-primary/70" />
            <span className="text-[10px] text-foreground/50 font-medium text-center leading-tight">{badge.label}</span>
          </div>
        ))}
      </div>

      {/* Estimated Delivery */}
      <div className="flex items-center gap-2 justify-center text-sm text-foreground/50 font-light">
        <Truck weight="duotone" className="w-4 h-4 text-primary/60" />
        {t('pdp.estimatedDelivery')} {deliveryText}
      </div>

      {/* Dosage / Supply Info */}
      {parsedData?.suggestedUse && (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/20">
            <Pill weight="duotone" className="w-4 h-4 text-primary/60 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">{t('pdp.dosageLabel')}</p>
              <p className="text-sm font-semibold text-foreground">{parsedData.suggestedUse}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/20">
            <Timer weight="duotone" className="w-4 h-4 text-primary/60 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-wider">{t('pdp.supplyDuration')}</p>
              <p className="text-sm font-semibold text-foreground">{selectedVariant?.title || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Why Subscribe Block — 2x2 grid */}
      {hasSubscription && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/3 to-secondary/5 border border-primary/10">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Repeat weight="bold" className="w-4 h-4 text-primary" />
            {t('pdp.whySubscribe')}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: CurrencyDollar, text: t('pdp.whySub1') },
              { icon: ArrowsClockwise, text: t('pdp.whySub2') },
              { icon: CalendarCheck, text: t('pdp.whySub3') },
              { icon: CheckCircle, text: t('pdp.whySub4') },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-background/60 border border-border/20">
                <item.icon weight="duotone" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs text-foreground/60 leading-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ask VitaSync */}
      <button
        onClick={() => {
          const question = t('pdp.askVitaSyncQuestion').replace('{product}', product.title);
          navigate('/dashboard', { state: { activeTab: 'coach', prefillMessage: question } });
        }}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <ChatCircleDots weight="light" className="w-4 h-4" />
        {t('pdp.askVitaSync')}
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

      <p className="text-xs text-foreground/40 text-center font-light">
        {t('pdp.disclaimer')}
      </p>
    </div>
  );
}
