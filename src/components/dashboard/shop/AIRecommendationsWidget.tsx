import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, ArrowClockwise, ShoppingCartSimple, Check, SpinnerGap, Star } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface CachedRecommendations {
  date: string;
  products: RecommendedProduct[];
  userId: string;
}

interface RecommendedProduct {
  handle: string;
  title: string;
  price: string;
  currency: string;
  imageUrl: string;
  productType: string;
  variantId: string;
  fullProduct: ShopifyProduct;
}

const CACHE_KEY = 'vitasync_ai_recommendations';

export function AIRecommendationsWidget({ onProductClick }: { onProductClick?: (handle: string) => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const [hasRequested, setHasRequested] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const hasInitialized = useRef(false);

  // Only load from cache on mount — never auto-fetch
  useEffect(() => {
    if (!user) return;
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const cached: CachedRecommendations = JSON.parse(cachedData);
        const today = new Date().toISOString().split('T')[0];
        if (cached.date === today && cached.userId === user.id && cached.products.length > 0) {
          setRecommendations(cached.products);
          setHasRequested(true);
        }
      }
    } catch {}
  }, [user]);

  const isCacheValid = (cached: CachedRecommendations): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return cached.date === today && cached.userId === user?.id;
  };

  const loadRecommendations = async () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const cached: CachedRecommendations = JSON.parse(cachedData);
        if (isCacheValid(cached) && cached.products.length > 0) {
          setRecommendations(cached.products);
          setLoading(false);
          return;
        }
      }
      await fetchAIRecommendations();
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setLoading(false);
    }
  };

  const fetchAIRecommendations = async () => {
    setLoading(true);
    try {
      const allProducts = await fetchProducts(250);

      const { data, error } = await supabase.functions.invoke('ai-shop-recommendations', {
        body: {}
      });

      if (error) throw error;

      const recommendedHandles: string[] = data?.recommendations || [];

      // Map handles to real products — no random fallback
      const recommendedProducts: RecommendedProduct[] = [];
      for (const handle of recommendedHandles.slice(0, 4)) {
        const product = allProducts.find(p => p.node.handle === handle);
        if (product) {
          const variant = product.node.variants.edges[0]?.node;
          const image = product.node.images.edges[0]?.node;
          recommendedProducts.push({
            handle: product.node.handle,
            title: product.node.title,
            price: variant?.price?.amount || product.node.priceRange.minVariantPrice.amount,
            currency: variant?.price?.currencyCode || product.node.priceRange.minVariantPrice.currencyCode,
            imageUrl: image?.url || '',
            productType: product.node.productType || '',
            variantId: variant?.id || '',
            fullProduct: product
          });
        }
      }

      // Cache the results
      const cacheData: CachedRecommendations = {
        date: new Date().toISOString().split('T')[0],
        products: recommendedProducts,
        userId: user?.id || ''
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setRecommendations(recommendedProducts);
    } catch (error) {
      console.error('AI recommendations error:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRecommendations = () => {
    setHasRequested(true);
    fetchAIRecommendations();
  };

  const handleRefresh = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const cached: CachedRecommendations = JSON.parse(cachedData);
        if (isCacheValid(cached) && cached.products.length > 0) {
          toast.info(t('shop.recommendationsAlreadyGenerated') || 'Recommandations déjà générées aujourd\'hui', {
            position: 'top-center',
          });
          return;
        }
      } catch {}
    }
    hasInitialized.current = false;
    fetchAIRecommendations();
  };

  const handleAddToCart = async (product: RecommendedProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (addingToCart || !product.variantId) return;

    setAddingToCart(product.handle);
    try {
      const variant = product.fullProduct.node.variants.edges[0]?.node;
      await addItem({
        product: product.fullProduct,
        variantId: product.variantId,
        variantTitle: variant?.title || '',
        price: variant?.price || { amount: product.price, currencyCode: product.currency },
        quantity: 1,
        selectedOptions: variant?.selectedOptions || [],
      });
      setAddedProducts(prev => new Set([...prev, product.handle]));
      toast.success(t('shop.productAdded'), {
        description: product.title,
        position: 'top-center',
      });
      setTimeout(() => {
        setAddedProducts(prev => {
          const next = new Set(prev);
          next.delete(product.handle);
          return next;
        });
      }, 2000);
    } catch {
      toast.error(t('shop.addError'));
    } finally {
      setAddingToCart(null);
    }
  };

  // Responsive grid classes based on product count
  const getGridCols = (count: number) => {
    if (count <= 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    return 'grid-cols-2 md:grid-cols-4';
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-premium rounded-2xl p-4 border border-border/50 dark:border-white/10 mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Sparkle weight="fill" className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-medium text-foreground flex items-center gap-2">
              {t('shop.aiRecommendations')}
              <Star weight="fill" className="w-3.5 h-3.5 text-yellow-500" />
            </h3>
            <p className="text-xs text-foreground/50">{t('shop.aiRecommendationsDesc')}</p>
          </div>
        </div>
        {hasRequested && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-muted/50 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 border border-border/50 dark:border-white/10 transition-all disabled:opacity-50"
            title={t('shop.refreshRecommendations')}
          >
            <ArrowClockwise className={`w-4 h-4 text-foreground/60 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse">
                <Sparkle weight="fill" className="w-6 h-6 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            </div>
            <p className="text-sm text-foreground/60 text-center">{t('shop.aiThinking')}</p>
          </motion.div>
        ) : recommendations.length > 0 ? (
          <motion.div
            key="products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid ${getGridCols(recommendations.length)} gap-3`}
          >
            {recommendations.map((product, index) => (
              <motion.div
                key={product.handle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onProductClick?.(product.handle)}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5 mb-2">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCartSimple weight="light" className="w-8 h-8 text-foreground/20" />
                    </div>
                  )}
                  {/* AI Badge */}
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-medium flex items-center gap-1">
                    <Sparkle weight="fill" className="w-2.5 h-2.5" />
                    AI
                  </div>
                </div>
                <h4 className="text-xs font-medium text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {product.title}
                </h4>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {parseFloat(product.price).toFixed(2)} {product.currency}
                  </span>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={addingToCart === product.handle}
                    className={`p-1.5 rounded-lg transition-all ${
                      addedProducts.has(product.handle)
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground'
                    }`}
                  >
                    {addingToCart === product.handle ? (
                      <SpinnerGap className="w-3.5 h-3.5 animate-spin" />
                    ) : addedProducts.has(product.handle) ? (
                      <Check weight="bold" className="w-3.5 h-3.5" />
                    ) : (
                      <ShoppingCartSimple weight="bold" className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 text-foreground/50 text-sm"
          >
            {t('shop.noProducts')}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
