import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash, ShoppingCart, Package, ArrowRight } from '@phosphor-icons/react';
import { useAIStackStore, AIStackItem } from '@/stores/aiStackStore';
import { useCartStore } from '@/stores/cartStore';
import { fetchProducts } from '@/lib/shopify';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

// Resolve product images from Shopify
function useResolveImages(items: AIStackItem[]) {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (items.length === 0) return;

    const resolve = async () => {
      try {
        const products = await fetchProducts(100);
        const map: Record<string, string> = {};
        for (const item of items) {
          const match = products.find(p => {
            const pid = p.node.id.split('/').pop();
            return pid === item.productId;
          });
          if (match?.node.images.edges[0]?.node.url) {
            map[item.productId] = match.node.images.edges[0].node.url;
          }
        }
        setImages(map);
      } catch (e) {
        console.error('Failed to resolve stack images:', e);
      }
    };

    resolve();
  }, [items.map(i => i.productId).join(',')]);

  return images;
}

export function AIStackPanel() {
  const { items, isOpen, removeItem, updateQuantity, clearStack, setOpen } = useAIStackStore();
  const addToCart = useCartStore(s => s.addItem);
  const { t } = useTranslation();
  const images = useResolveImages(items);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const totalMonthly = items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    return sum + price * item.quantity;
  }, 0);

  const discountedTotal = totalMonthly * 0.85; // 15% subscription discount
  const savings = totalMonthly - discountedTotal;

  const handleSubscribe = async () => {
    if (items.length === 0) return;
    setIsSubscribing(true);

    try {
      // Add all items to cart with subscription
      for (const item of items) {
        const gid = item.variantId.startsWith('gid://') 
          ? item.variantId 
          : `gid://shopify/ProductVariant/${item.variantId}`;
        
        await addToCart({
          variantId: gid,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: images[item.productId] || '',
        });
      }

      toast.success('Stack ajouté au panier !', {
        description: `${items.length} produits ajoutés. Finalisez votre commande.`,
      });
      clearStack();
    } catch (e) {
      console.error('Failed to subscribe:', e);
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isOpen || items.length === 0) return null;

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-[340px] flex-shrink-0 border-l border-border/50 bg-background/80 backdrop-blur-xl flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <Package weight="fill" className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Ton Stack Mensuel</h3>
              <p className="text-xs text-muted-foreground">{items.length} produit{items.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X weight="bold" className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 50 }}
              transition={{ duration: 0.2 }}
              className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 group"
            >
              {/* Image */}
              <div className="w-12 h-12 rounded-lg bg-muted/50 flex-shrink-0 overflow-hidden">
                {images[item.productId] ? (
                  <img
                    src={images[item.productId]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package weight="light" className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {parseFloat(item.price).toFixed(2)}$ × {item.quantity}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-6 h-6 rounded-md bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <Minus weight="bold" className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-medium w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-6 h-6 rounded-md bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <Plus weight="bold" className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="w-6 h-6 rounded-md hover:bg-destructive/10 flex items-center justify-center transition-colors ml-auto opacity-0 group-hover:opacity-100"
                  >
                    <Trash weight="bold" className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer with pricing + CTA */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {/* Price breakdown */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Sous-total</span>
            <span className="line-through">{totalMonthly.toFixed(2)}$</span>
          </div>
          <div className="flex justify-between text-xs text-secondary">
            <span>Remise abonnement (-15%)</span>
            <span>-{savings.toFixed(2)}$</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border/30">
            <span>Total / mois</span>
            <span className="text-primary">{discountedTotal.toFixed(2)}$</span>
          </div>
        </div>

        {/* Subscribe button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubscribe}
          disabled={isSubscribing}
          className={cn(
            "w-full py-3 px-4 rounded-xl font-medium text-sm",
            "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
            "hover:shadow-lg hover:shadow-primary/20 transition-shadow",
            "flex items-center justify-center gap-2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubscribing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
            />
          ) : (
            <>
              <ShoppingCart weight="fill" className="w-4 h-4" />
              S'abonner — {discountedTotal.toFixed(2)}$/mois
              <ArrowRight weight="bold" className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {/* Clear stack */}
        <button
          onClick={clearStack}
          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
        >
          Vider le stack
        </button>
      </div>
    </motion.div>
  );
}
