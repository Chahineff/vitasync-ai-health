import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, ArrowClockwise, ShoppingCartSimple, Check, SpinnerGap, Star, Timer, ArrowRight } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { SUBSCRIPTION_DISCOUNT_RATE } from '@/lib/subscription-calculator';

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

export function AIRecommendationsWidget({ onProductClick, onViewAll }: { onProductClick?: (handle: string) => void; onViewAll?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const [hasRequested, setHasRequested] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  const hasInitialized = useRef(false);

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
          return;
        }
      }
    } catch {}

    const recoKey = `vitasync_initial_reco_${user.id}`;
    if (localStorage.getItem(recoKey) && !hasInitialized.current) {
      hasInitialized.current = true;
      setHasRequested(true);
      fetchAIRecommendations();
    }
  }, [user]);

  const isCacheValid = (cached: CachedRecommendations): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return cached.date === today && cached.userId === user?.id;
  };

  const fetchAIRecommendations = async () => {
    setLoading(true);
    try {
      const allProducts = await fetchProducts(250);
      const { data, error } = await supabase.functions.invoke('ai-shop-recommendations', { body: {} });
      if (error) throw error;

      const recommendedHandles: string[] = data?.recommendations || [];
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
          toast.info(t('shop.recommendationsAlreadyGenerated') || 'Recommandations déjà générées aujourd\'hui', { position: 'top-center' });
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
      toast.success(t('shop.productAdded'), { description: product.title, position: 'top-center' });
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

  const getSubscriptionPrice = (price: string) => {
    const basePrice = parseFloat(price);
    return (basePrice * (1 - SUBSCRIPTION_DISCOUNT_RATE)).toFixed(2);
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-premium rounded-2xl mb-4"
    >

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkle weight="fill" className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-[15px]">
                {t('shop.aiRecommendations')}
                <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">AI</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t('shop.aiRecommendationsDesc')}</p>
            </div>
          </div>
          {hasRequested && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 transition-all disabled:opacity-50"
              title={t('shop.refreshRecommendations')}
            >
              <ArrowClockwise className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {!hasRequested && !loading ? (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Sparkle weight="light" className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Star weight="fill" className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  {t('shop.aiIdleTitle') || "Votre sélection personnalisée"}
                </p>
                <p className="text-xs text-muted-foreground max-w-[260px]">
                  {t('shop.aiIdleDescription') || "Découvrez les compléments adaptés à votre profil"}
                </p>
              </div>
              <button
                onClick={handleRequestRecommendations}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Sparkle weight="fill" className="w-4 h-4" />
                {t('shop.requestRecommendations') || "Analyser mon profil"}
              </button>
            </motion.div>
          ) : loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Sparkle weight="fill" className="w-7 h-7 text-primary animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">{t('shop.aiThinking')}</p>
                <p className="text-xs text-muted-foreground">{t('shop.aiAnalyzingProfile') || "Analyse de votre profil en cours..."}</p>
              </div>
            </motion.div>
          ) : recommendations.length > 0 ? (
            <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Subscription badge */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20">
                <Timer weight="fill" className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  {t('shop.subscriptionSaveBadge') || `Économisez ${(SUBSCRIPTION_DISCOUNT_RATE * 100).toFixed(0)}% avec un abonnement mensuel`}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {recommendations.map((product, index) => {
                  const basePrice = parseFloat(product.price);
                  const subPrice = getSubscriptionPrice(product.price);

                  return (
                    <motion.div
                      key={product.handle}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                      onClick={() => onProductClick?.(product.handle)}
                      className="group cursor-pointer rounded-xl bg-card/80 dark:bg-white/[0.03] border border-border/40 dark:border-white/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-muted/30 dark:bg-white/[0.02]">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCartSimple weight="light" className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* AI badge */}
                        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <Sparkle weight="fill" className="w-2.5 h-2.5" />
                          AI Pick
                        </div>
                        {/* Quick add overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={addingToCart === product.handle}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 backdrop-blur-sm shadow-lg ${
                              addedProducts.has(product.handle)
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            {addingToCart === product.handle ? (
                              <SpinnerGap className="w-3.5 h-3.5 animate-spin" />
                            ) : addedProducts.has(product.handle) ? (
                              <><Check weight="bold" className="w-3.5 h-3.5" /> {t('shop.added') || 'Ajouté'}</>
                            ) : (
                              <><ShoppingCartSimple weight="bold" className="w-3.5 h-3.5" /> {t('shop.addToCart') || 'Ajouter'}</>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <h4 className="text-xs font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-tight min-h-[2rem]">
                          {product.title}
                        </h4>

                        {/* Pricing */}
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[13px] text-muted-foreground line-through">
                              {basePrice.toFixed(2)} {product.currency}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-primary">
                              {subPrice} {product.currency}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded">
                              -{(SUBSCRIPTION_DISCOUNT_RATE * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {t('shop.subscriptionLabel') || 'abonnement /mois'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => onViewAll?.()}
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                {t('shop.viewRecommendations')}
                <ArrowRight weight="bold" className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-muted-foreground text-sm">
              {t('shop.noProducts')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
