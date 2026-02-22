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

type PurchaseMode = 'subscribe' | 'once';

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
  const [purchaseMode, setPurchaseMode] = useState<PurchaseMode>('subscribe');
  
  const addItem = useCartStore(state => state.addItem);
  
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  const hasMultipleVariants = variants.length > 1;

  const originalPrice = parseFloat(price.amount);
  const subscribedPrice = +(originalPrice * 0.85).toFixed(2);

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
      toast.success(purchaseMode === 'subscribe' ? 'Abonnement ajouté' : 'Produit ajouté', {
        description: product.title,
        position: 'top-center',
      });
      setTimeout(() => setJustAdded(false), 1500);
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
        <p className="text-[16px] lg:text-[18px] text-muted-foreground font-light leading-relaxed">
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
                  "px-4 py-2 rounded-btn text-sm transition-all duration-150 border",
                  related.handle === product.handle
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted/40 text-foreground/70 border-border hover:border-foreground/30"
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
                  "px-4 py-2 rounded-btn text-sm transition-all duration-150 border",
                  selectedVariantIndex === index
                    ? "bg-foreground text-background border-foreground"
                    : variant.node.availableForSale
                    ? "bg-muted/40 text-foreground/70 border-border hover:border-foreground/30"
                    : "bg-muted/20 text-foreground/30 border-border/30 cursor-not-allowed line-through"
                )}
              >
                {variant.node.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Purchase Mode Cards */}
      <div className="space-y-3">
        {/* Card 1: Subscribe — Dominant */}
        <button
          onClick={() => setPurchaseMode('subscribe')}
          className={cn(
            "w-full text-left rounded-card p-5 transition-all duration-150 ease-in-out relative overflow-hidden",
            purchaseMode === 'subscribe'
              ? "border-2 border-primary bg-primary/10"
              : "border-2 border-border bg-transparent hover:border-primary/40"
          )}
        >
          {/* Badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              Recommandé · -15%
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150",
              purchaseMode === 'subscribe' ? "border-primary bg-primary" : "border-border"
            )}>
              {purchaseMode === 'subscribe' && <Check weight="bold" className="w-3 h-3 text-primary-foreground" />}
            </div>
            <div className="flex items-center gap-2">
              <Repeat weight="duotone" className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Abonnement mensuel</span>
            </div>
          </div>

          <div className="ml-8">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-foreground">{subscribedPrice.toFixed(2)} €</span>
              <span className="text-sm text-muted-foreground line-through">{originalPrice.toFixed(2)} €</span>
              <span className="text-xs font-medium text-primary">/mois</span>
            </div>
            <p className="text-xs text-muted-foreground font-light">
              Pause ou annulation à tout moment · Livraison offerte
            </p>
          </div>
        </button>

        {/* Card 2: One-time — Neutral */}
        <button
          onClick={() => setPurchaseMode('once')}
          className={cn(
            "w-full text-left rounded-card p-5 transition-all duration-150 ease-in-out",
            purchaseMode === 'once'
              ? "border-2 border-primary bg-primary/10"
              : "border-2 border-border bg-transparent hover:border-primary/40"
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-150",
              purchaseMode === 'once' ? "border-primary bg-primary" : "border-border"
            )}>
              {purchaseMode === 'once' && <Check weight="bold" className="w-3 h-3 text-primary-foreground" />}
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCartSimple weight="duotone" className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">Achat unique</span>
            </div>
          </div>

          <div className="ml-8">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{originalPrice.toFixed(2)} €</span>
            </div>
          </div>
        </button>
      </div>

      {/* CTA — Full Width */}
      <motion.button
        onClick={handleAddToCart}
        disabled={isAdding || !selectedVariant?.availableForSale}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full flex items-center justify-center gap-2 h-14 rounded-btn text-base font-semibold transition-all duration-200",
          justAdded
            ? "bg-emerald-600 text-white border border-emerald-700"
            : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm",
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
        ) : (
          <>
            <ShoppingCartSimple weight="bold" className="w-5 h-5" />
            Démarrer ma routine
          </>
        )}
      </motion.button>

      {/* Ask VitaSync */}
      <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors mx-auto">
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
