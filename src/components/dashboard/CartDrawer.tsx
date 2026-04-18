import { useState, useEffect, ReactNode, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Minus, Plus, Trash, ShoppingCart, ArrowSquareOut, SpinnerGap, Repeat, Package, Sparkle, ShoppingBag, Lightning, Truck, PiggyBank
} from '@phosphor-icons/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/stores/cartStore';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { Confetti } from '@/components/ui/Confetti';

interface CartDrawerProps {
  children: ReactNode;
}

const FREE_SHIPPING_THRESHOLD = 59;
const SUBSCRIPTION_DISCOUNT = 0.15; // 15% subscription savings

export function CartDrawer({ children }: CartDrawerProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const previousFreeShippingRef = useRef(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currencyCode = items[0]?.price.currencyCode || 'USD';

  // Calculate subscription savings: for each subscribed line, the discounted price
  // is what's stored. Pre-discount price = price / (1 - 0.15). Savings = pre - price.
  const subscriptionSavings = items.reduce((sum, item) => {
    if (!item.sellingPlanId) return sum;
    const linePrice = parseFloat(item.price.amount) * item.quantity;
    const originalPrice = linePrice / (1 - SUBSCRIPTION_DISCOUNT);
    return sum + (originalPrice - linePrice);
  }, 0);
  const hasSubscription = items.some(item => item.sellingPlanId);

  const shippingProgress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - totalPrice, 0);
  const freeShipping = remaining <= 0;

  // Trigger confetti when crossing the free shipping threshold (only while drawer is open)
  useEffect(() => {
    if (isOpen && freeShipping && !previousFreeShippingRef.current && totalPrice > 0) {
      setShowConfetti(true);
    }
    previousFreeShippingRef.current = freeShipping;
  }, [freeShipping, isOpen, totalPrice]);

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) window.location.href = checkoutUrl;
  };

  const handleRemove = async (variantId: string) => {
    setRemovingId(variantId);
    await removeItem(variantId);
    setRemovingId(null);
  };

  return (
    <>
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent className="w-full sm:max-w-[440px] flex flex-col h-full p-0 bg-background border-l border-border/30 overflow-hidden">
        {/* Header with gradient accent */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle className="flex items-center justify-between text-foreground">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag weight="duotone" className="w-6 h-6 text-primary" />
                  {totalItems > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </div>
                <span className="text-lg font-semibold">{t('cart.title')}</span>
              </div>
              {totalItems > 0 && (
                <span className="text-xs text-foreground/50 font-light">
                  {totalItems} {totalItems > 1 ? t('cart.items') : t('cart.item')}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Free shipping progress */}
          {items.length > 0 && (
            <div className="px-6 pb-4">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl border transition-all duration-500 ${
                  freeShipping 
                    ? 'bg-primary/10 border-primary/20' 
                    : 'bg-muted/50 border-border/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {freeShipping ? (
                      <motion.div initial={{ rotate: -20 }} animate={{ rotate: 0 }}>
                        <Sparkle weight="fill" className="w-4 h-4 text-primary" />
                      </motion.div>
                    ) : (
                      <Truck weight="duotone" className="w-4 h-4 text-foreground/60" />
                    )}
                    <span className={`text-xs font-medium ${freeShipping ? 'text-primary' : 'text-foreground/70'}`}>
                      {freeShipping
                        ? t('cart.freeShippingUnlocked')
                        : `$${remaining.toFixed(2)} ${t('cart.freeShippingRemaining')}`
                      }
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full transition-colors duration-500 ${
                      freeShipping 
                        ? 'bg-gradient-to-r from-primary to-primary/80' 
                        : 'bg-gradient-to-r from-primary/40 to-primary/60'
                    }`}
                  />
                </div>
              </motion.div>
            </div>
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        </div>

        {/* Cart items */}
        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative mb-6"
              >
                <div className="w-24 h-24 rounded-3xl bg-muted/50 flex items-center justify-center">
                  <ShoppingBag weight="thin" className="w-12 h-12 text-foreground/15" />
                </div>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <Plus weight="bold" className="w-3.5 h-3.5 text-primary/60" />
                </motion.div>
              </motion.div>
              <p className="text-foreground/60 font-medium text-sm">{t('cart.empty')}</p>
              <p className="text-xs text-foreground/35 font-light mt-1.5 max-w-[200px]">{t('cart.emptySubtitle')}</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.variantId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 80, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`group relative flex gap-4 p-3.5 rounded-2xl border border-border/40 bg-muted/30 dark:bg-white/[0.03] hover:border-border/60 hover:bg-muted/50 dark:hover:bg-white/[0.06] transition-all duration-200 ${
                        removingId === item.variantId ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {/* Product image */}
                      <div className="w-[72px] h-[72px] rounded-xl bg-muted/50 dark:bg-white/5 overflow-hidden flex-shrink-0 ring-1 ring-border/30">
                        {item.product.node.images?.edges?.[0]?.node ? (
                          <motion.img 
                            src={item.product.node.images.edges[0].node.url} 
                            alt={item.product.node.title} 
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.2 }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package weight="thin" className="w-6 h-6 text-foreground/20" />
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="font-medium text-foreground text-sm leading-tight truncate pr-6">
                            {item.product.node.title}
                          </h4>
                          {item.variantTitle !== 'Default Title' && (
                            <p className="text-[11px] text-foreground/50 font-light mt-0.5">
                              {item.selectedOptions.map(o => o.value).join(' · ')}
                            </p>
                          )}
                          {item.sellingPlanName ? (
                            <Badge className="mt-1.5 bg-primary/10 text-primary border-primary/20 text-[10px] px-2 py-0.5 gap-1 font-medium">
                              <Repeat weight="bold" className="w-2.5 h-2.5" />
                              {item.sellingPlanName}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-1.5 text-[10px] px-2 py-0.5 text-foreground/40 border-foreground/10 font-light">
                              One-time
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-0.5 bg-muted/60 dark:bg-white/5 rounded-full p-0.5">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              disabled={isLoading}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors disabled:opacity-40"
                            >
                              <Minus weight="bold" className="w-3 h-3 text-foreground/70" />
                            </motion.button>
                            <motion.span 
                              key={item.quantity}
                              initial={{ scale: 1.3 }}
                              animate={{ scale: 1 }}
                              className="w-7 text-center text-sm font-semibold text-foreground"
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={isLoading}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors disabled:opacity-40"
                            >
                              <Plus weight="bold" className="w-3 h-3 text-foreground/70" />
                            </motion.button>
                          </div>

                          {/* Price */}
                          <motion.p 
                            key={`${item.variantId}-${item.quantity}`}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            className="text-sm font-bold text-foreground"
                          >
                            ${(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                          </motion.p>
                        </div>
                      </div>

                      {/* Delete button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemove(item.variantId)}
                        className="absolute top-3 right-3 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-foreground/30 hover:text-destructive transition-all duration-200"
                      >
                        <Trash weight="light" className="w-3.5 h-3.5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-border/30 bg-muted/20 dark:bg-white/[0.02]">
                <div className="px-6 py-5 space-y-4">
                  {/* Subscription savings recap */}
                  <AnimatePresence>
                    {hasSubscription && subscriptionSavings > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3.5"
                      >
                        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-primary/10 blur-2xl" />
                        <div className="relative flex items-center gap-3">
                          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                            <PiggyBank weight="duotone" className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-primary/80 uppercase tracking-wide">
                              {t('cart.subscriptionPerks')}
                            </p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">
                              {t('cart.savings')}{' '}
                              <motion.span
                                key={subscriptionSavings.toFixed(2)}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-primary font-bold"
                              >
                                ${subscriptionSavings.toFixed(2)}
                              </motion.span>
                              <span className="text-foreground/60 font-light"> {t('cart.savingsPerMonth')}</span>
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Subtotal */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/50 font-light">Subtotal</span>
                      <span className="text-sm text-foreground/70">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground/50 font-light">Shipping</span>
                      <span className={`text-sm font-medium ${freeShipping ? 'text-primary' : 'text-foreground/70'}`}>
                        {freeShipping ? 'Free' : 'Calculated at checkout'}
                      </span>
                    </div>
                    <div className="h-px bg-border/40 my-1" />
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium text-foreground">Total</span>
                      <motion.span
                        key={totalPrice}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-xl font-bold text-foreground"
                      >
                        ${totalPrice.toFixed(2)}
                      </motion.span>
                    </div>
                  </div>

                  {/* Checkout button */}
                  <motion.button
                    onClick={handleCheckout}
                    disabled={items.length === 0 || isLoading || isSyncing}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {isLoading || isSyncing ? (
                      <SpinnerGap className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Lightning weight="fill" className="w-5 h-5" />
                        <span className="text-[15px]">{t('cart.checkout')}</span>
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-[10px] text-foreground/35 font-light flex items-center justify-center gap-1">
                    🔒 {t('cart.secureCheckout')}
                  </p>
                </div>
              </div>
            </>
          )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
