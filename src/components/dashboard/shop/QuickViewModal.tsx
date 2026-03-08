import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCartSimple, SpinnerGap, Check, Repeat, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { ProductGroup, getFlavorFromTitle } from '@/hooks/useProductGroups';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { getFirstSellingPlan, calculateSubscriptionPrice, getDiscountPercentage, getDeliveryFrequency } from '@/lib/shopify';

interface QuickViewModalProps {
  group: ProductGroup | null;
  onClose: () => void;
  onViewFull?: (handle: string) => void;
}

export function QuickViewModal({ group, onClose, onViewFull }: QuickViewModalProps) {
  const { t } = useTranslation();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [imageIdx, setImageIdx] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  if (!group) return null;

  const product = group.products[selectedIdx];
  const images = product.node.images.edges;
  const variant = product.node.variants.edges[0]?.node;
  const price = variant?.price || product.node.priceRange.minVariantPrice;

  const handleAdd = async () => {
    if (!variant || isAdding) return;
    setIsAdding(true);
    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });
      setJustAdded(true);
      toast.success(t('shop.productAdded'), { description: product.node.title, position: 'top-center' });
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      toast.error(t('shop.addError'));
    } finally {
      setIsAdding(false);
    }
  };

  const plan = getFirstSellingPlan(product);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-background border border-border rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Image gallery */}
            <div className="relative md:w-1/2 aspect-square bg-muted/30">
              <AnimatePresence mode="wait">
                {images[imageIdx]?.node && (
                  <motion.img
                    key={imageIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={images[imageIdx].node.url}
                    alt={images[imageIdx].node.altText || group.baseTitle}
                    className="w-full h-full object-cover"
                  />
                )}
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIdx((imageIdx - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 border border-border"
                  >
                    <CaretLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setImageIdx((imageIdx + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 border border-border"
                  >
                    <CaretRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Info */}
            <div className="md:w-1/2 p-6 flex flex-col gap-3">
              <h3 className="text-xl font-bold text-foreground">{group.baseTitle}</h3>
              {product.node.productType && (
                <p className="text-sm text-muted-foreground">{product.node.productType}</p>
              )}
              <p className="text-sm text-foreground/70 line-clamp-4 font-light">{product.node.description}</p>

              {/* Flavors */}
              {group.flavors.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {group.products.map((p, i) => (
                    <button
                      key={p.node.id}
                      onClick={() => { setSelectedIdx(i); setImageIdx(0); }}
                      className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                        selectedIdx === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent/20'
                      }`}
                    >
                      {getFlavorFromTitle(p.node.title) || 'Original'}
                    </button>
                  ))}
                </div>
              )}

              {/* Sub hint */}
              {plan && (() => {
                const subPrice = calculateSubscriptionPrice(parseFloat(price.amount), plan);
                const pct = getDiscountPercentage(plan);
                const freq = getDeliveryFrequency(plan);
                return (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                    <Repeat weight="bold" className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium text-secondary">{subPrice.toFixed(2)} {price.currencyCode}</span>
                    <span className="text-xs text-muted-foreground">/{freq.toLowerCase().replace('every ', '').replace('deliver ', '')}</span>
                    {pct && <span className="text-xs font-semibold text-secondary">-{pct}%</span>}
                  </div>
                );
              })()}

              {/* Price */}
              <div className="text-2xl font-bold text-foreground">
                {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-auto pt-4">
                <button
                  onClick={handleAdd}
                  disabled={isAdding || !variant?.availableForSale}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    justAdded
                      ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  } disabled:opacity-40`}
                >
                  {isAdding ? <SpinnerGap className="w-5 h-5 animate-spin" /> : justAdded ? (
                    <><Check weight="bold" className="w-5 h-5" />{t('shop.added')}</>
                  ) : (
                    <><ShoppingCartSimple weight="bold" className="w-5 h-5" />{t('shop.addToCart')}</>
                  )}
                </button>
                <button
                  onClick={() => onViewFull?.(product.node.handle)}
                  className="px-4 py-3 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {t('shop.viewDetails')}
                </button>
              </div>

              {!variant?.availableForSale && (
                <p className="text-xs text-destructive">{t('shop.outOfStock')}</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
