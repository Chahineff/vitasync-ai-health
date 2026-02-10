import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCartSimple,
  Check,
  SpinnerGap,
  Plus,
  Repeat,
  ShieldCheck,
  Leaf,
  Flask,
  Truck,
} from '@phosphor-icons/react';
import { ProductDetail, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  
  const addItem = useCartStore(state => state.addItem);
  
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  const hasMultipleVariants = variants.length > 1;

  // Extract key benefits (first 3)
  const keyBenefits = parsedData?.benefits?.slice(0, 3) || [];

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
      toast.success(t('pdp.addedToCart'), {
        description: product.title,
        position: 'top-center',
      });
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      toast.error(t('shop.addError'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="lg:sticky lg:top-8 space-y-6">
      {/* Vendor & Title */}
      <div>
        {product.vendor && (
          <p className="text-sm text-primary font-medium uppercase tracking-wider mb-1">
            {product.vendor}
          </p>
        )}
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight tracking-tight">
          {product.title}
        </h1>
        {product.productType && (
          <Badge variant="secondary" className="mt-3">
            {product.productType}
          </Badge>
        )}
      </div>

      {/* Enriched Summary or first benefit */}
      {(enrichedSummary || parsedData?.benefits?.[0]) && (
        <p className="text-foreground/70 font-light leading-relaxed">
          {enrichedSummary || parsedData?.benefits?.[0]}
        </p>
      )}

      {/* Key Benefits */}
      {keyBenefits.length > 0 && (
        <ul className="space-y-2">
          {keyBenefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
              <Check weight="bold" className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="font-light">{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Flavor Selector (if multiple related products) */}
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
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 text-foreground/70 border-border/50 hover:border-primary/50"
                )}
              >
                {related.flavor}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Variant Selector (sizes within same product) */}
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
                    ? "bg-primary text-primary-foreground border-primary"
                    : variant.node.availableForSale
                    ? "bg-muted/30 text-foreground/70 border-border/50 hover:border-primary/50"
                    : "bg-muted/20 text-foreground/30 border-border/30 cursor-not-allowed line-through"
                )}
              >
                {variant.node.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">
          {parseFloat(price.amount).toFixed(2)} €
        </span>
        <span className="text-sm text-foreground/50">
          {selectedVariant?.availableForSale ? t('pdp.inStock') : t('pdp.outOfStock')}
        </span>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <motion.button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedVariant?.availableForSale}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-semibold transition-all shadow-lg",
            justAdded
              ? "bg-green-500/20 text-green-600 border border-green-500/30"
              : "bg-primary hover:bg-primary/90 text-primary-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isAdding ? (
            <SpinnerGap className="w-5 h-5 animate-spin" />
          ) : justAdded ? (
            <>
              <Check weight="bold" className="w-5 h-5" />
              {t('pdp.added')}
            </>
          ) : (
            <>
              <ShoppingCartSimple weight="bold" className="w-5 h-5" />
              {t('pdp.addToCart')}
            </>
          )}
        </motion.button>
        
        <button
          className="px-4 py-4 rounded-2xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
          title={t('pdp.addToStack')}
        >
          <Plus weight="bold" className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Subscription Placeholder */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Repeat weight="light" className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">{t('pdp.subscribeAndSave')}</span>
          </div>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            {t('pdp.comingSoon')}
          </Badge>
        </div>
        <p className="text-sm text-foreground/60 font-light mb-3">
          {t('pdp.subscriptionModule')}
        </p>
        <div className="flex items-center justify-between opacity-50">
          <div className="flex items-center gap-3">
            <Switch disabled />
            <span className="text-sm text-foreground/70">{t('pdp.recurringDelivery')}</span>
          </div>
          <span className="text-sm font-medium text-primary">-10%</span>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="grid grid-cols-2 gap-3">
        <TrustItem icon={ShieldCheck} label={t('pdp.testedQuality')} />
        <TrustItem icon={Leaf} label={t('pdp.transparentLabeling')} />
        <TrustItem icon={Flask} label={t('pdp.cleanFormula')} />
        <TrustItem icon={Truck} label={t('pdp.fastShipping')} />
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

function TrustItem({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string; weight?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30">
      <Icon weight="light" className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="text-xs text-foreground/70 font-light">{label}</span>
    </div>
  );
}
