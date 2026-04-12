import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightning, Plus, ShoppingCart } from '@phosphor-icons/react';
import { ShopifyProduct } from '@/lib/shopify';
import { useTranslation } from '@/hooks/useTranslation';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CrossSellSectionProps {
  products: ShopifyProduct[];
  currentProductId: string;
  currentProductTitle: string;
  onProductClick: (handle: string) => void;
}

export function CrossSellSection({ products, currentProductId, currentProductTitle, onProductClick }: CrossSellSectionProps) {
  const { t } = useTranslation();
  const addItem = useCartStore(state => state.addItem);

  // Pick complementary products (different category, exclude current)
  const frequentlyBought = useMemo(() => {
    const others = products.filter(p => p.node.id !== currentProductId);
    // Shuffle deterministically based on product title
    const seed = currentProductTitle.length;
    const shuffled = [...others].sort((a, b) => {
      const ha = (a.node.title.charCodeAt(0) + seed) % 100;
      const hb = (b.node.title.charCodeAt(0) + seed) % 100;
      return ha - hb;
    });
    return shuffled.slice(0, 2);
  }, [products, currentProductId, currentProductTitle]);

  const completeRoutine = useMemo(() => {
    const others = products.filter(p => p.node.id !== currentProductId && !frequentlyBought.some(fb => fb.node.id === p.node.id));
    const seed = currentProductTitle.length + 7;
    const shuffled = [...others].sort((a, b) => {
      const ha = (a.node.title.charCodeAt(0) + seed) % 100;
      const hb = (b.node.title.charCodeAt(0) + seed) % 100;
      return ha - hb;
    });
    return shuffled.slice(0, 4);
  }, [products, currentProductId, currentProductTitle, frequentlyBought]);

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    addItem({
      variantId: variant.id,
      title: product.node.title,
      price: parseFloat(variant.price.amount),
      quantity: 1,
      imageUrl: product.node.images.edges[0]?.node.url,
      handle: product.node.handle,
    });
    toast.success(t('pdp.addedToCart'));
  };

  if (frequentlyBought.length === 0 && completeRoutine.length === 0) return null;

  return (
    <div className="space-y-10 py-8">
      {/* Frequently Bought Together */}
      {frequentlyBought.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightning weight="duotone" className="w-5 h-5 text-primary" />
            {t('pdp.frequentlyBought')}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            {frequentlyBought.map((p, i) => (
              <div key={p.node.id} className="flex items-center gap-3">
                {i > 0 && <Plus weight="bold" className="w-4 h-4 text-foreground/30 flex-shrink-0" />}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-border/30 bg-background hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => onProductClick(p.node.handle)}
                >
                  {p.node.images.edges[0] && (
                    <img
                      src={p.node.images.edges[0].node.url}
                      alt={p.node.title}
                      className="w-14 h-14 object-contain rounded-xl bg-muted/20"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate max-w-[140px]">{p.node.title}</p>
                    <p className="text-xs text-foreground/50">
                      {parseFloat(p.node.priceRange.minVariantPrice.amount).toFixed(2)}€
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 ml-2"
              onClick={() => {
                frequentlyBought.forEach(p => handleAddToCart(p));
                toast.success(t('pdp.bundleAdded'));
              }}
            >
              <ShoppingCart weight="light" className="w-4 h-4" />
              {t('pdp.addBundle')}
            </Button>
          </div>
        </section>
      )}

      {/* Complete Your Routine */}
      {completeRoutine.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t('pdp.completeRoutine')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {completeRoutine.map((p) => {
              const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
              return (
                <motion.div
                  key={p.node.id}
                  whileHover={{ y: -3 }}
                  onClick={() => onProductClick(p.node.handle)}
                  className="group p-3 rounded-2xl border border-border/30 bg-background hover:border-primary/20 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="aspect-square rounded-xl bg-muted/10 mb-3 overflow-hidden">
                    {p.node.images.edges[0] && (
                      <img
                        src={p.node.images.edges[0].node.url}
                        alt={p.node.title}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">{p.node.title}</p>
                  <p className="text-xs text-foreground/50 mt-0.5">{price.toFixed(2)}€</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(p); }}
                    className="mt-2 w-full py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus weight="bold" className="w-3 h-3" />
                    {t('pdp.addToPack')}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
