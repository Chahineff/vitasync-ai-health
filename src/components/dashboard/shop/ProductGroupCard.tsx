import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartSimple, Star, Check, SpinnerGap, Repeat } from '@phosphor-icons/react';
import { ProductGroup, getFlavorFromTitle } from '@/hooks/useProductGroups';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { getBestSellingPlan, getSellingPlanDiscount } from '@/lib/shopify';

interface ProductGroupCardProps {
  group: ProductGroup;
  recommendedByAI?: boolean;
  onProductClick?: (handle: string) => void;
}

export function ProductGroupCard({ group, recommendedByAI = false, onProductClick }: ProductGroupCardProps) {
  const { t } = useTranslation();
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const { products, baseTitle, flavors } = group;
  const hasMultipleFlavors = flavors.length > 1;
  const displayIndex = hoveredIndex !== null ? hoveredIndex : selectedProductIndex;
  const displayProduct = products[displayIndex];
  const mainImage = displayProduct.node.images.edges[0]?.node;
  const selectedVariant = displayProduct.node.variants.edges[0]?.node;
  const price = selectedVariant?.price || displayProduct.node.priceRange.minVariantPrice;

  // Subscription data
  const sellingPlan = getBestSellingPlan(displayProduct);
  const discountPercent = sellingPlan ? getSellingPlanDiscount(sellingPlan) : 0;
  const subscriptionPrice = discountPercent > 0
    ? (parseFloat(price.amount) * (1 - discountPercent / 100)).toFixed(2)
    : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant || isAdding) return;

    setIsAdding(true);
    try {
      await addItem({
        product: displayProduct,
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity: 1,
        selectedOptions: selectedVariant.selectedOptions || [],
      });
      setJustAdded(true);
      toast.success(t('shop.productAdded'), {
        description: displayProduct.node.title,
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
    <div 
      onClick={() => onProductClick?.(displayProduct.node.handle)} 
      className={onProductClick ? "cursor-pointer" : ""}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {setIsHovered(false);}}
    >
      <motion.div
        whileHover={{ y: -4 }}
        className="glass-card rounded-2xl overflow-hidden border border-white/10 group h-full flex flex-col relative"
      >
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-white/5 to-white/10 overflow-hidden">
          <AnimatePresence mode="wait">
            {mainImage ? (
              <motion.img
                key={displayProduct.node.id}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                src={mainImage.url}
                alt={mainImage.altText || baseTitle}
                className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCartSimple weight="light" className="w-12 h-12 text-foreground/20" />
              </div>
            )}
          </AnimatePresence>

          {/* AI Badge */}
          {recommendedByAI && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium"
            >
              <Star weight="fill" className="w-3 h-3" />
              {t('shop.recommended')}
            </motion.div>
          )}

          {/* Subscription badge */}
          {sellingPlan && discountPercent > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/90 text-secondary-foreground text-xs font-semibold">
              <Repeat weight="bold" className="w-3 h-3" />
              Save {discountPercent}%
            </div>
          )}

          {hasMultipleFlavors && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
              {flavors.length} {t('shop.flavors')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-medium text-foreground line-clamp-2">{baseTitle}</h3>
            {displayProduct.node.productType && (
              <p className="text-xs text-foreground/50 mt-1">{displayProduct.node.productType}</p>
            )}
          </div>

          {/* Flavor Selector */}
          {hasMultipleFlavors && (
            <div 
              className="flex flex-wrap gap-1.5"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {products.slice(0, 4).map((product, index) => {
                const flavor = getFlavorFromTitle(product.node.title);
                return (
                  <button
                    key={product.node.id}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProductIndex(index); }}
                    onMouseEnter={(e) => { e.stopPropagation(); setHoveredIndex(index); }}
                    className={`px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs rounded-lg transition-colors min-h-[32px] md:min-h-0 ${
                      displayIndex === index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/5 text-foreground/60 hover:bg-white/10'
                    }`}
                  >
                    {flavor || 'Original'}
                  </button>
                );
              })}
              {products.length > 4 && (
                <span className="px-2 py-1 text-xs text-foreground/40">+{products.length - 4}</span>
              )}
            </div>
          )}

          {/* Price & Cart */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-foreground">
                {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
              </span>
              {subscriptionPrice && (
                <span className="text-xs text-secondary font-medium flex items-center gap-1">
                  <Repeat weight="bold" className="w-3 h-3" />
                  {subscriptionPrice} {price.currencyCode}/mo
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !selectedVariant?.availableForSale}
              className={`flex items-center gap-2 px-2 py-2 md:px-4 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                justAdded
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAdding ? (
                <SpinnerGap className="w-4 h-4 animate-spin" />
              ) : justAdded ? (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Check weight="bold" className="w-4 h-4" />
                  </motion.div>
                  <span className="hidden md:inline">{t('shop.added')}</span>
                </>
              ) : (
                <>
                  <ShoppingCartSimple weight="bold" className="w-4 h-4" />
                  <span className="hidden md:inline">{t('shop.addToCart')}</span>
                </>
              )}
            </button>
          </div>

          {!selectedVariant?.availableForSale && (
            <p className="text-xs text-destructive font-light">{t('shop.outOfStock')}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
