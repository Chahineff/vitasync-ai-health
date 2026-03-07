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
} from '@phosphor-icons/react';
import { ProductDetail, ShopifyProduct, getSellingPlans, calculateSubscriptionPrice, getDiscountPercentage, getDeliveryFrequency } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ParsedProductData } from '@/lib/shopify-parser';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

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

  // Default to 'subscribe' only if subscription is available
  const effectiveMode = hasSubscription ? purchaseMode : 'once';

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
        effectiveMode === 'subscribe' ? 'Ajouté à votre routine' : 'Ajouté au panier',
        { description: product.title, position: 'top-center' }
      );
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      toast.error(t('shop.addError'));
    } finally {
      setIsAdding(false);
    }
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

      {/* ═══ Purchase Options — Subscribe favored ═══ */}
      <div className="space-y-3">
        {/* Subscribe & Save — HIGHLIGHTED */}
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
                  <span className="font-semibold text-foreground">Abonnement Mensuel</span>
                  {discountPct && (
                    <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                      -{discountPct}%
                    </Badge>
                  )}
                </div>
              </div>
              <span className="text-lg font-bold text-primary">{subscriptionPrice.toFixed(2)} €</span>
            </div>

            {effectiveMode === 'subscribe' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-4 pb-4 space-y-3"
              >
                <p className="text-sm text-foreground/60 font-light pl-8">
                  Livraison gratuite, ajustable à tout moment avec l'IA.
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

        {/* Buy Once — neutral & understated */}
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
              Achat unique
            </span>
          </div>
          <span className="text-sm text-foreground/50 font-light">{basePrice.toFixed(2)} €</span>
        </button>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground/60 font-medium">Quantité</span>
        <div className="flex items-center gap-3 border border-border/50 rounded-xl px-2 py-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground"
          >
            <Minus weight="bold" className="w-4 h-4" />
          </button>
          <span className="text-base font-semibold text-foreground w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground"
          >
            <Plus weight="bold" className="w-4 h-4" />
          </button>
        </div>
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
            : effectiveMode === 'subscribe'
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-foreground hover:bg-foreground/90 text-background",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isAdding ? (
          <SpinnerGap className="w-5 h-5 animate-spin" />
        ) : justAdded ? (
          <>
            <Check weight="bold" className="w-5 h-5" />
            Ajouté !
          </>
        ) : effectiveMode === 'subscribe' ? (
          <>
            <Repeat weight="bold" className="w-5 h-5" />
            Démarrer ma routine
          </>
        ) : (
          <>
            <ShoppingCartSimple weight="bold" className="w-5 h-5" />
            Ajouter au panier
          </>
        )}
      </motion.button>

      {/* Ask VitaSync */}
      <button
        onClick={() => {
          const question = `Que penses-tu de ${product.title} pour moi ? Est-ce adapté à mon profil et mes objectifs ?`;
          navigate('/dashboard', { state: { activeTab: 'coach', prefillMessage: question } });
        }}
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <ChatCircleDots weight="light" className="w-4 h-4" />
        Demander à VitaSync
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
