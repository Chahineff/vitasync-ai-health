import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Minus, 
  Plus, 
  Trash, 
  ShoppingCart, 
  ArrowSquareOut,
  SpinnerGap,
  Repeat,
} from '@phosphor-icons/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cartStore';
import { Badge } from '@/components/ui/badge';

interface CartDrawerProps {
  children: ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currencyCode = items[0]?.price.currencyCode || 'EUR';

  // Sync cart when drawer opens
  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full bg-background/95 backdrop-blur-xl border-l border-border/50">
        <SheetHeader className="flex-shrink-0 pb-4 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart weight="light" className="w-5 h-5" />
            Panier
            {totalItems > 0 && (
              <span className="text-sm text-foreground/60 font-light">
                ({totalItems} article{totalItems > 1 ? 's' : ''})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0 pt-4">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart weight="light" className="w-16 h-16 text-foreground/20 mb-4" />
              <p className="text-foreground/60 font-light">Votre panier est vide</p>
              <p className="text-sm text-foreground/40 font-light mt-1">
                Ajoutez des produits pour commencer
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.variantId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-3 rounded-xl bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg bg-muted/50 dark:bg-white/5 overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {item.product.node.title}
                        </h4>
                        {item.variantTitle !== 'Default Title' && (
                          <p className="text-xs text-foreground/60 font-light">
                            {item.selectedOptions.map(o => o.value).join(' • ')}
                          </p>
                        )}
                        {item.sellingPlanName ? (
                          <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 gap-1">
                            <Repeat weight="bold" className="w-2.5 h-2.5" />
                            {item.sellingPlanName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 text-foreground/40 border-foreground/10">
                            One-time
                          </Badge>
                        )}
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {parseFloat(item.price.amount).toFixed(2)} {item.price.currencyCode}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="p-1 rounded-lg hover:bg-white/10 text-foreground/40 hover:text-destructive transition-colors"
                        >
                          <Trash weight="light" className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={isLoading}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                          >
                            <Minus weight="bold" className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            disabled={isLoading}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
                          >
                            <Plus weight="bold" className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 pt-4 mt-4 border-t border-border/50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-foreground/60 font-light">Total</span>
                  <span className="text-xl font-semibold text-foreground">
                    {totalPrice.toFixed(2)} {currencyCode}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0 || isLoading || isSyncing}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading || isSyncing ? (
                    <SpinnerGap className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ArrowSquareOut weight="bold" className="w-5 h-5" />
                      Passer commande
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
