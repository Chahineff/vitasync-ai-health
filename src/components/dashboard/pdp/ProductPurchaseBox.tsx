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
    } catch (error) {
      toast.error(t('shop.addError'));
    } finally {
      setIsAdding(false);
    }
  };

  // Dynamic trust strip items
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

      {/* Trust Strip — 3 items inline */}
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

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-[22px] lg:text-[28px] font-bold text-foreground">
          {parseFloat(price.amount).toFixed(2)} €
        </span>
        <span className="text-sm text-foreground/50">
          {selectedVariant?.availableForSale ? t('pdp.inStock') : t('pdp.outOfStock')}
        </span>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <div className="flex gap-3">
          {/* Primary: Add to pack */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isAdding || !selectedVariant?.availableForSale}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-6 h-12 rounded-xl text-base font-semibold transition-all",
              justAdded
                ? "bg-green-500/20 text-green-600 border border-green-500/30"
                : "bg-secondary hover:bg-secondary/90 text-[#0B1220]",
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
            ) : (
              <>
                <ShoppingCartSimple weight="bold" className="w-5 h-5" />
                Add to pack
              </>
            )}
          </motion.button>

          {/* Secondary: Buy once */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !selectedVariant?.availableForSale}
            className="px-5 h-12 rounded-xl border border-[#E2E8F0] dark:border-border/50 text-foreground text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            Buy once
          </button>
        </div>

        {/* Tertiary: Ask VitaSync */}
        <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          <ChatCircleDots weight="light" className="w-4 h-4" />
          Ask VitaSync about this
        </button>
      </div>

      {/* Subscribe & Save */}
      <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-muted/20 border border-[#E2E8F0] dark:border-border/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Repeat weight="light" className="w-5 h-5 text-secondary" />
            <span className="font-medium text-foreground text-sm">{t('pdp.subscribeAndSave')}</span>
          </div>
          <Badge variant="outline" className="text-xs border-secondary/30 text-secondary">
            {t('pdp.comingSoon')}
          </Badge>
        </div>
        <p className="text-xs text-foreground/50 font-light mb-3">
          Pause anytime • Free shipping • Save 10%
        </p>
        <div className="flex items-center justify-between opacity-50">
          <div className="flex items-center gap-3">
            <Switch disabled />
            <span className="text-sm text-foreground/70">{t('pdp.recurringDelivery')}</span>
          </div>
          <span className="text-sm font-medium text-secondary">-10%</span>
        </div>
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
