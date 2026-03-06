import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Check, SpinnerGap, Package, Clock, Sun, Moon, CloudSun, Coffee, Repeat, X } from '@phosphor-icons/react';
import { useCartStore } from '@/stores/cartStore';
import { useSupplementTracking } from '@/hooks/useSupplementTracking';
import { fetchProducts, ShopifyProduct, getFirstSellingPlan, calculateSubscriptionPrice, getDiscountPercentage } from '@/lib/shopify';
import { toast } from 'sonner';
import { 
  parseSubscriptionBlock, 
  ParsedSubscriptionBlock,
  SUBSCRIPTION_DISCOUNT_RATE 
} from '@/lib/subscription-calculator';
import { inferTimeOfDay } from '@/lib/infer-time-of-day';
import { SubscriptionCard } from './SubscriptionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface ProductRecommendation {
  productId: string;
  variantId: string;
  name: string;
  price: string;
  aiTimeOfDay?: string;
  aiDosage?: string;
  aiMealTiming?: string;
}

interface ProductData {
  imageUrl: string;
  title: string;
  price: string;
  currency: string;
  variantId: string;
  fullProduct: ShopifyProduct;
}

interface ProductRecommendationCardProps {
  product: ProductRecommendation;
}

// Skeleton loading state
function ProductCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm my-3">
      <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Error state
function ProductCardError() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 my-3">
      <Package weight="duotone" className="w-8 h-8 text-destructive/60" />
      <span className="text-sm text-muted-foreground">Produit non disponible</span>
    </div>
  );
}

// Module-level cache for all products (shared across instances)
let allProductsCache: ShopifyProduct[] | null = null;
let allProductsPromise: Promise<ShopifyProduct[]> | null = null;

function ensureAllProducts(): Promise<ShopifyProduct[]> {
  if (!allProductsPromise) {
    allProductsPromise = fetchProducts(250).then(products => {
      allProductsCache = products;
      return products;
    });
  }
  return allProductsPromise;
}

function findProductInCache(productId: string, productName: string): ShopifyProduct | null {
  if (!allProductsCache) return null;
  const numericId = productId.split('/').pop() || productId;
  
  for (const p of allProductsCache) {
    const pNumId = p.node.id.split('/').pop() || '';
    if (pNumId === numericId) return p;
    for (const v of p.node.variants.edges) {
      const vNumId = v.node.id.split('/').pop() || '';
      if (vNumId === numericId) return p;
    }
  }
  
  const normalizedName = productName.toLowerCase().trim();
  for (const p of allProductsCache) {
    if (p.node.title.toLowerCase().trim() === normalizedName) return p;
  }
  for (const p of allProductsCache) {
    if (p.node.title.toLowerCase().includes(normalizedName) || normalizedName.includes(p.node.title.toLowerCase())) return p;
  }
  
  return null;
}

const TIME_OPTIONS = [
  { value: 'morning', label: 'Matin', icon: Sun },
  { value: 'noon', label: 'Midi', icon: CloudSun },
  { value: 'afternoon', label: 'Après-midi', icon: Coffee },
  { value: 'evening', label: 'Soir', icon: Moon },
];

const MEAL_OPTIONS = [
  { value: 'before', label: 'Avant le repas' },
  { value: 'during', label: 'Pendant le repas' },
  { value: 'after', label: 'Après le repas' },
  { value: 'none', label: 'Indifférent' },
];

export function ProductRecommendationCard({ product }: ProductRecommendationCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToTracking, setIsAddingToTracking] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToTracking, setAddedToTracking] = useState(false);
  const [purchaseMode, setPurchaseMode] = useState<'subscription' | 'onetime'>('subscription');
  const [trackingPopoverOpen, setTrackingPopoverOpen] = useState(false);
  
  // Tracking config state
  const [selectedTime, setSelectedTime] = useState('morning');
  const [customTime, setCustomTime] = useState('');
  const [mealTiming, setMealTiming] = useState('none');
  const [dosage, setDosage] = useState('');
  
  const addItem = useCartStore(state => state.addItem);
  const { addSupplement } = useSupplementTracking();

  // Resolve product from shared cache
  useEffect(() => {
    setIsLoading(true);
    setError(false);
    
    ensureAllProducts().then(() => {
      const found = findProductInCache(product.productId, product.name);
      if (found) {
        // Use AI-provided time if available, otherwise infer from product
        const timeOfDay = product.aiTimeOfDay || inferTimeOfDay(found.node.title, found.node.description || '');
        setSelectedTime(timeOfDay);
        
        // Use AI-provided dosage if available
        if (product.aiDosage) setDosage(product.aiDosage);
        
        // Use AI-provided meal timing if available
        if (product.aiMealTiming) setMealTiming(product.aiMealTiming);
        
        setProductData({
          imageUrl: found.node.images.edges[0]?.node.url || '',
          title: found.node.title,
          price: found.node.priceRange.minVariantPrice.amount,
          currency: found.node.priceRange.minVariantPrice.currencyCode,
          variantId: found.node.variants.edges[0]?.node.id || product.variantId,
          fullProduct: found,
        });
      } else {
        console.warn(`Product not found in cache: ID=${product.productId}, Name=${product.name}`);
        setError(true);
      }
      setIsLoading(false);
    }).catch(() => {
      setError(true);
      setIsLoading(false);
    });
  }, [product.productId, product.name]);

  const sellingPlan = productData ? getFirstSellingPlan(productData.fullProduct) : null;
  const basePrice = productData ? parseFloat(productData.price) : 0;
  const subscriptionPrice = sellingPlan ? calculateSubscriptionPrice(basePrice, sellingPlan) : basePrice * 0.85;
  const discountPct = sellingPlan ? (getDiscountPercentage(sellingPlan) || 15) : 15;

  const handleAddToCart = async () => {
    if (!productData) return;
    
    setIsAddingToCart(true);
    try {
      const variant = productData.fullProduct.node.variants.edges[0]?.node;
      if (!variant) {
        toast.error("Variante non disponible");
        return;
      }

      await addItem({
        product: productData.fullProduct,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
        ...(purchaseMode === 'subscription' && sellingPlan ? {
          sellingPlanId: sellingPlan.id,
          sellingPlanName: sellingPlan.name,
        } : {}),
      });

      setAddedToCart(true);
      const modeLabel = purchaseMode === 'subscription' ? 'abonnement' : 'achat unique';
      toast.success(`${productData.title} ajouté (${modeLabel})`, { position: 'top-center' });
      
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleConfirmTracking = async () => {
    if (!productData) return;
    
    setIsAddingToTracking(true);
    try {
      const timeOfDay = selectedTime === 'custom' && customTime 
        ? `custom:${customTime}` 
        : selectedTime;
      
      const mealPrefix = mealTiming !== 'none' ? `${mealTiming === 'before' ? 'Avant' : mealTiming === 'during' ? 'Pendant' : 'Après'} le repas - ` : '';
      const fullDosage = dosage ? `${mealPrefix}${dosage}`.trim() : (mealPrefix ? mealPrefix.replace(' - ', '') : null);

      const { error } = await addSupplement({
        shopify_product_id: product.productId,
        product_name: productData.title,
        dosage: fullDosage,
        time_of_day: timeOfDay,
        recommended_by_ai: true,
        active: true
      });

      if (error) {
        toast.error("Erreur lors de l'ajout au suivi");
        return;
      }

      setAddedToTracking(true);
      setTrackingPopoverOpen(false);
      toast.success(`${productData.title} ajouté au suivi`, { position: 'top-center' });
      
      setTimeout(() => setAddedToTracking(false), 2000);
    } catch (error) {
      console.error('Error adding to tracking:', error);
      toast.error("Erreur lors de l'ajout au suivi");
    } finally {
      setIsAddingToTracking(false);
    }
  };

  if (isLoading) return <ProductCardSkeleton />;
  if (error || !productData) return <ProductCardError />;

  const currentPrice = purchaseMode === 'subscription' ? subscriptionPrice : basePrice;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: productData.currency,
  }).format(currentPrice);

  const formattedBasePrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: productData.currency,
  }).format(basePrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 backdrop-blur-sm my-3 hover:border-primary/40 transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="flex gap-4 p-4">
        {/* Product Image */}
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
          {productData.imageUrl ? (
            <img 
              src={productData.imageUrl} 
              alt={productData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package weight="duotone" className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
              {productData.title}
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-primary font-bold text-base">{formattedPrice}</span>
              {purchaseMode === 'subscription' && (
                <span className="text-xs text-foreground/40 line-through">{formattedBasePrice}</span>
              )}
              {purchaseMode === 'subscription' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                  -{discountPct}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Purchase mode toggle */}
      <div className="px-4 pb-2">
        <div className="flex rounded-lg border border-white/10 overflow-hidden text-[11px]">
          <button
            onClick={() => setPurchaseMode('subscription')}
            className={cn(
              "flex-1 py-1.5 px-2 flex items-center justify-center gap-1 transition-all",
              purchaseMode === 'subscription' 
                ? "bg-primary text-primary-foreground font-medium" 
                : "bg-white/5 text-foreground/60 hover:bg-white/10"
            )}
          >
            <Repeat weight="bold" className="w-3 h-3" />
            Abonnement
          </button>
          <button
            onClick={() => setPurchaseMode('onetime')}
            className={cn(
              "flex-1 py-1.5 px-2 flex items-center justify-center gap-1 transition-all",
              purchaseMode === 'onetime' 
                ? "bg-foreground/10 text-foreground font-medium" 
                : "bg-white/5 text-foreground/60 hover:bg-white/10"
            )}
          >
            Achat unique
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || addedToCart}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
            addedToCart 
              ? "bg-secondary/20 text-secondary border border-secondary/30"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isAddingToCart ? (
            <SpinnerGap weight="bold" className="w-3.5 h-3.5 animate-spin" />
          ) : addedToCart ? (
            <Check weight="bold" className="w-3.5 h-3.5" />
          ) : (
            <ShoppingCart weight="bold" className="w-3.5 h-3.5" />
          )}
          {addedToCart ? 'Ajouté' : 'Ajouter au panier'}
        </button>
        
        <Popover open={trackingPopoverOpen} onOpenChange={setTrackingPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              disabled={addedToTracking}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border",
                addedToTracking 
                  ? "bg-secondary/20 text-secondary border-secondary/30"
                  : "bg-white/5 text-foreground/80 hover:bg-white/10 border-white/20"
              )}
            >
              {addedToTracking ? (
                <Check weight="bold" className="w-3.5 h-3.5" />
              ) : (
                <Plus weight="bold" className="w-3.5 h-3.5" />
              )}
              {addedToTracking ? 'Suivi ✓' : 'Suivi'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 bg-popover/95 backdrop-blur-xl border-white/15" side="top" align="end">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Ajouter au suivi</h4>
                <button onClick={() => setTrackingPopoverOpen(false)} className="p-1 rounded hover:bg-white/10">
                  <X weight="bold" className="w-3.5 h-3.5 text-foreground/50" />
                </button>
              </div>

              {/* Time of day */}
              <div>
                <label className="text-[11px] text-foreground/60 uppercase tracking-wide font-medium mb-1.5 block">
                  Moment de prise
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {TIME_OPTIONS.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedTime(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[10px] transition-all",
                          selectedTime === opt.value
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-white/5 text-foreground/60 border border-transparent hover:bg-white/10"
                        )}
                      >
                        <Icon weight="bold" className="w-3.5 h-3.5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {/* Custom time option */}
                <button
                  onClick={() => setSelectedTime('custom')}
                  className={cn(
                    "mt-1 w-full flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] transition-all",
                    selectedTime === 'custom'
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-white/5 text-foreground/60 border border-transparent hover:bg-white/10"
                  )}
                >
                  <Clock weight="bold" className="w-3 h-3" />
                  Heure précise
                </button>
                <AnimatePresence>
                  {selectedTime === 'custom' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <Input
                        type="time"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="mt-1 h-8 text-xs bg-white/5 border-white/15"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Meal timing */}
              <div>
                <label className="text-[11px] text-foreground/60 uppercase tracking-wide font-medium mb-1.5 block">
                  Par rapport au repas
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {MEAL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setMealTiming(opt.value)}
                      className={cn(
                        "py-1.5 px-2 rounded-lg text-[10px] transition-all",
                        mealTiming === opt.value
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-white/5 text-foreground/60 border border-transparent hover:bg-white/10"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dosage */}
              <div>
                <label className="text-[11px] text-foreground/60 uppercase tracking-wide font-medium mb-1.5 block">
                  Dosage
                </label>
                <Input
                  placeholder="ex: 1 gélule, 5g, 2 comprimés..."
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="h-8 text-xs bg-white/5 border-white/15"
                />
              </div>

              {/* Confirm */}
              <Button
                onClick={handleConfirmTracking}
                disabled={isAddingToTracking}
                className="w-full h-8 text-xs"
                size="sm"
              >
                {isAddingToTracking ? (
                  <SpinnerGap weight="bold" className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Plus weight="bold" className="w-3.5 h-3.5 mr-1" />
                )}
                Confirmer l'ajout au suivi
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  );
}

// Parse product tags from AI response - extended format with AI scheduling
// Format: [[PRODUCT:productId:variantId:nom:prix]] or [[PRODUCT:productId:variantId:nom:prix:time:dosage:meal]]
export function parseProductRecommendations(content: string): {
  text: string;
  products: ProductRecommendation[];
  subscription: ParsedSubscriptionBlock | null;
} {
  const subscriptionResult = parseSubscriptionBlock(content);
  let textToProcess = subscriptionResult.text;
  
  // Extended regex: optional time:dosage:meal fields
  const regex = new RegExp(
    '\\[\\[PRODUCT:' +
    '((?:gid://[^:\\]]+/[^:\\]]+/[^:\\]]+|[^:\\]]+))' + // productId
    ':((?:gid://[^:\\]]+/[^:\\]]+/[^:\\]]+|[^:\\]]+))' + // variantId
    ':([^:\\]]+)' +   // name
    ':([^:\\]]+?)' +   // price
    '(?::([^:\\]]+):([^:\\]]*):([^:\\]]*))?' + // optional time:dosage:meal
    '\\]\\]',
    'g'
  );
  const products: ProductRecommendation[] = [];
  
  const text = textToProcess.replace(regex, (match, productId, variantId, name, price, time, dosage, meal) => {
    if (productId && variantId && name && price) {
      const rec: ProductRecommendation = { 
        productId: productId.trim(), 
        variantId: variantId.trim(), 
        name: name.trim(), 
        price: price.trim() 
      };
      // Map AI time values
      if (time) {
        const t = time.trim().toLowerCase();
        if (['morning', 'matin'].includes(t)) rec.aiTimeOfDay = 'morning';
        else if (['noon', 'midi'].includes(t)) rec.aiTimeOfDay = 'noon';
        else if (['afternoon', 'après-midi', 'apres-midi'].includes(t)) rec.aiTimeOfDay = 'afternoon';
        else if (['evening', 'soir'].includes(t)) rec.aiTimeOfDay = 'evening';
        else rec.aiTimeOfDay = t;
      }
      if (dosage) rec.aiDosage = dosage.trim();
      // Map AI meal timing values
      if (meal) {
        const m = meal.trim().toLowerCase();
        if (['before', 'avant'].includes(m)) rec.aiMealTiming = 'before';
        else if (['during', 'pendant'].includes(m)) rec.aiMealTiming = 'during';
        else if (['after', 'après', 'apres'].includes(m)) rec.aiMealTiming = 'after';
        else rec.aiMealTiming = 'none';
      }
      products.push(rec);
      return `__PRODUCT_${products.length - 1}__`;
    }
    return '';
  });
  
  const cleanedText = text
    .replace(/\[\[PRODUCT:[^\]]*\]\]/g, '')
    .replace(/\[\[PRODUCT:[^\]]*$/gm, '')
    .replace(/\[\[PROD[^\]]*$/gm, '')
    .replace(/\[\[P[^\]]*$/gm, '')
    .replace(/\[\[[^\]]*$/gm, '')
    .replace(/\bproduit\s*:\s*$/gim, '')
    .replace(/\bproduit\s*:\s*\n/gi, '\n')
    .replace(/\bproduit\s*:\s*(?=\s|$)/gim, '')
    .replace(/^\s*\n/gm, '\n')
    .trim();

  const seen = new Set<string>();
  const uniqueProducts = products.filter(p => {
    const key = p.productId;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return { 
    text: cleanedText, 
    products: uniqueProducts,
    subscription: subscriptionResult.subscription
  };
}

export { SubscriptionCard } from './SubscriptionCard';
export type { ParsedSubscriptionBlock } from '@/lib/subscription-calculator';
