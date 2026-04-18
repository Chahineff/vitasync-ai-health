import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartSimple, Star, Check, SpinnerGap, Repeat, Eye, Heart, Tag } from '@phosphor-icons/react';
import { ProductGroup, getFlavorFromTitle } from '@/hooks/useProductGroups';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { getFirstSellingPlan, calculateSubscriptionPrice, getDiscountPercentage, getDeliveryFrequency } from '@/lib/shopify';

interface ProductGroupCardProps {
  group: ProductGroup;
  recommendedByAI?: boolean;
  onProductClick?: (handle: string) => void;
  onQuickView?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function StarRating() {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" style={{ color: 'hsl(43, 96%, 56%)' }} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-muted-foreground ml-1">5.0</span>
    </div>
  );
}

export function ProductGroupCard({ group, recommendedByAI = false, onProductClick, onQuickView, isFavorite = false, onToggleFavorite }: ProductGroupCardProps) {
  const { t } = useTranslation();
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [addingMode, setAddingMode] = useState<'sub' | 'once' | null>(null);
  const [justAdded, setJustAdded] = useState<'sub' | 'once' | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<'sub' | 'once' | null>(null);
  const addItem = useCartStore(state => state.addItem);

  const { products, baseTitle, flavors } = group;
  const hasMultipleFlavors = flavors.length > 1;
  const displayIndex = hoveredIndex !== null ? hoveredIndex : selectedProductIndex;
  const displayProduct = products[displayIndex];
  const mainImage = displayProduct.node.images.edges[0]?.node;
  const selectedVariant = displayProduct.node.variants.edges[0]?.node;
  const price = selectedVariant?.price || displayProduct.node.priceRange.minVariantPrice;

  // Subscription info
  const plan = getFirstSellingPlan(displayProduct);
  const subPrice = plan ? calculateSubscriptionPrice(parseFloat(price.amount), plan) : null;
  const pct = plan ? getDiscountPercentage(plan) : null;

  const handleAddToCart = async (e: React.MouseEvent, mode: 'sub' | 'once') => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant || addingMode) return;
    if (mode === 'sub' && !plan) return;

    setAddingMode(mode);
    try {
      const finalPrice = mode === 'sub' && subPrice
        ? { amount: subPrice.toFixed(2), currencyCode: price.currencyCode }
        : selectedVariant.price;

      await addItem({
        product: displayProduct,
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: finalPrice,
        quantity: 1,
        selectedOptions: selectedVariant.selectedOptions || [],
        ...(mode === 'sub' && plan ? {
          sellingPlanId: plan.id,
          sellingPlanName: plan.name || t('shop.monthlySubscription'),
        } : {}),
      });
      setJustAdded(mode);
      toast.success(t('shop.productAdded'), {
        description: `${displayProduct.node.title}${mode === 'sub' ? ' · ' + t('shop.monthlySubscription') : ''}`,
        position: 'top-center',
      });
      setTimeout(() => setJustAdded(null), 2000);
    } catch {
      toast.error(t('shop.addError'));
    } finally {
      setAddingMode(null);
    }
  };

  return (
    <div onClick={() => onProductClick?.(displayProduct.node.handle)} className={onProductClick ? 'cursor-pointer' : ''}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 group h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-2xl" style={{ aspectRatio: '3/4' }}>
          <div className="absolute inset-0 dark:bg-white/5" style={{ background: "radial-gradient(circle at 50% 40%, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)" }} />
          <AnimatePresence mode="wait">
            {mainImage ? (
              <motion.img
                key={displayProduct.node.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                src={mainImage.url}
                alt={mainImage.altText || baseTitle}
                className="relative w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.10))" }}
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <ShoppingCartSimple weight="light" className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
          </AnimatePresence>

          {/* Overlay actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite?.(); }}
              className={`p-2 rounded-full backdrop-blur-sm border transition-colors ${
                isFavorite 
                  ? 'bg-destructive/10 border-destructive/30 text-destructive' 
                  : 'bg-background/80 border-border text-foreground/60 hover:text-destructive'
              }`}
            >
              <Heart weight={isFavorite ? 'fill' : 'regular'} className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(); }}
              className="p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border text-foreground/60 hover:text-foreground transition-colors"
            >
              <Eye weight="regular" className="w-4 h-4" />
            </button>
          </div>

          {/* Save badge */}
          {pct && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
              className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md"
            >
              <Tag weight="fill" className="w-3 h-3" />
              -{pct}%
            </motion.div>
          )}

          {/* AI Badge */}
          {recommendedByAI && !pct && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-md"
            >
              <Star weight="fill" className="w-3 h-3" />
              {t('shop.recommended')}
            </motion.div>
          )}

          {hasMultipleFlavors && !recommendedByAI && !pct && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
              {flavors.length} {t('shop.flavors')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col gap-2">
          <StarRating />
          <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug">{baseTitle}</h3>
          {displayProduct.node.productType && (
            <p className="text-xs text-muted-foreground line-clamp-1">{displayProduct.node.productType}</p>
          )}

          {/* Flavor Selector */}
          {hasMultipleFlavors && (
            <div className="flex flex-wrap gap-1.5 mt-1" onMouseLeave={() => setHoveredIndex(null)}>
              {products.slice(0, 4).map((product, index) => {
                const flavor = getFlavorFromTitle(product.node.title);
                return (
                  <button
                    key={product.node.id}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProductIndex(index); }}
                    onMouseEnter={(e) => { e.stopPropagation(); setHoveredIndex(index); }}
                    className={`px-2 py-1 text-[11px] rounded-lg transition-colors ${
                      displayIndex === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent/20'
                    }`}
                  >
                    {flavor || 'Original'}
                  </button>
                );
              })}
              {products.length > 4 && <span className="px-2 py-1 text-xs text-muted-foreground">+{products.length - 4}</span>}
            </div>
          )}

          <div className="flex-1" />

          {/* Pricing Section — dynamic emphasis based on hovered button */}
          <div className="space-y-1.5 pt-1 min-h-[3rem]">
            <div className="flex items-baseline gap-2 transition-all duration-300">
              {subPrice ? (
                <>
                  {/* Subscription price (primary by default, dimmed on Buy Once hover) */}
                  <motion.span
                    animate={{
                      scale: hoveredBtn === 'once' ? 0.9 : 1,
                      opacity: hoveredBtn === 'once' ? 0.45 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`text-xl font-bold origin-left ${
                      hoveredBtn === 'once'
                        ? 'text-foreground/50 line-through text-base'
                        : 'text-primary'
                    }`}
                  >
                    {subPrice.toFixed(2)}&nbsp;{price.currencyCode}
                  </motion.span>
                  {/* Once price (struck-through by default, highlighted on its hover) */}
                  <motion.span
                    animate={{
                      scale: hoveredBtn === 'once' ? 1.05 : 1,
                      opacity: hoveredBtn === 'once' ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`font-bold origin-left ${
                      hoveredBtn === 'once'
                        ? 'text-xl text-foreground'
                        : 'text-base text-foreground/40 line-through'
                    }`}
                  >
                    {parseFloat(price.amount).toFixed(2)}&nbsp;{price.currencyCode}
                  </motion.span>
                </>
              ) : (
                <span className="text-xl font-bold text-foreground">
                  {parseFloat(price.amount).toFixed(2)}&nbsp;{price.currencyCode}
                </span>
              )}
            </div>
            {/* Subscribe hint */}
            <AnimatePresence mode="wait">
              {subPrice && hoveredBtn !== 'once' && (
                <motion.div
                  key="sub-hint"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15"
                >
                  <Repeat weight="bold" className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    {pct ? `${t('shop.saveWithSub')} · -${pct}%` : t('shop.saveWithSub')}
                  </span>
                </motion.div>
              )}
              {subPrice && hoveredBtn === 'once' && (
                <motion.div
                  key="once-hint"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-muted"
                >
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {t('shop.oneTimePurchase')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons — Subscribe (primary, large) + Buy Once (compact) */}
          {subPrice && plan ? (
            <div className="flex gap-1.5">
              <motion.button
                onClick={(e) => handleAddToCart(e, 'sub')}
                onMouseEnter={() => setHoveredBtn('sub')}
                onMouseLeave={() => setHoveredBtn(null)}
                disabled={!!addingMode || !selectedVariant?.availableForSale}
                whileTap={{ scale: 0.97 }}
                className={`flex-1 relative overflow-hidden flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  justAdded === 'sub'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {/* Shimmer on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 hover:translate-x-full" />
                {addingMode === 'sub' ? (
                  <SpinnerGap className="w-4 h-4 animate-spin" />
                ) : justAdded === 'sub' ? (
                  <>
                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.5 }}>
                      <Check weight="bold" className="w-4 h-4" />
                    </motion.div>
                    {t('shop.added')}
                  </>
                ) : (
                  <>
                    <Repeat weight="bold" className="w-4 h-4" />
                    <span className="truncate">{t('shop.subscribeMonthly')}</span>
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={(e) => handleAddToCart(e, 'once')}
                onMouseEnter={() => setHoveredBtn('once')}
                onMouseLeave={() => setHoveredBtn(null)}
                disabled={!!addingMode || !selectedVariant?.availableForSale}
                whileTap={{ scale: 0.97 }}
                title={t('shop.buyOnce')}
                aria-label={t('shop.buyOnce')}
                className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                  justAdded === 'once'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-background text-foreground/80 border-border hover:bg-muted hover:text-foreground'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {addingMode === 'once' ? (
                  <SpinnerGap className="w-4 h-4 animate-spin" />
                ) : justAdded === 'once' ? (
                  <Check weight="bold" className="w-4 h-4" />
                ) : (
                  <>
                    <ShoppingCartSimple weight="bold" className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('shop.buyOnce')}</span>
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            <button
              onClick={(e) => handleAddToCart(e, 'once')}
              disabled={!!addingMode || !selectedVariant?.availableForSale}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                justAdded === 'once'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {addingMode === 'once' ? (
                <SpinnerGap className="w-4 h-4 animate-spin" />
              ) : justAdded === 'once' ? (
                <>
                  <Check weight="bold" className="w-4 h-4" />
                  {t('shop.added')}
                </>
              ) : (
                <>
                  <ShoppingCartSimple weight="bold" className="w-4 h-4" />
                  {t('shop.addToCart')}
                </>
              )}
            </button>
          )}

          {!selectedVariant?.availableForSale && <p className="text-xs text-destructive text-center">{t('shop.outOfStock')}</p>}
        </div>
      </motion.div>
    </div>
  );
}
