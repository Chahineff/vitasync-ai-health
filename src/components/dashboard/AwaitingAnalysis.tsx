import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Storefront, Sparkle, SpinnerGap } from '@phosphor-icons/react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AwaitingAnalysisProps {
  title: string;
  onStartDiagnostic: () => void;
}

interface RecommendedProduct {
  handle: string;
  title: string;
  price: string;
  currency: string;
  imageUrl: string;
}

const CACHE_KEY = 'vitasync_awaiting_ai_recs';

export const AwaitingAnalysis = ({ title, onStartDiagnostic }: AwaitingAnalysisProps) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const hasInit = useRef(false);

  useEffect(() => {
    if (hasInit.current) return;
    hasInit.current = true;
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    try {
      // Check cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.date === today && parsed.userId === user?.id && parsed.products?.length > 0) {
          setProducts(parsed.products);
          setLoading(false);
          return;
        }
      }

      const allProducts = await fetchProducts(100);

      if (!user) {
        // Fallback: show first 4 products
        setProducts(allProducts.slice(0, 4).map(mapProduct));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-shop-recommendations', {
        body: {}
      });

      if (error) throw error;

      const handles: string[] = data?.recommendations || [];
      const matched: RecommendedProduct[] = [];
      for (const handle of handles.slice(0, 4)) {
        const p = allProducts.find(pr => pr.node.handle === handle);
        if (p) matched.push(mapProduct(p));
      }

      const result = matched.length > 0 ? matched : allProducts.slice(0, 4).map(mapProduct);

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        userId: user?.id || '',
        products: result
      }));

      setProducts(result);
    } catch {
      // Fallback to regular products
      try {
        const fallback = await fetchProducts(4);
        setProducts(fallback.map(mapProduct));
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-premium rounded-3xl p-6 h-full border border-white/10 flex flex-col min-h-[280px]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center">
          <Sparkle weight="fill" className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-medium tracking-tight text-foreground">{title}</h3>
          <p className="text-xs text-foreground/50 font-light">
            Recommandations personnalisées par l'IA
          </p>
        </div>
      </div>

      {/* AI Product Recommendations */}
      <div className="flex-1 mb-4">
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse">
                  <Sparkle weight="fill" className="w-5 h-5 text-primary" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              </div>
              <p className="text-xs text-foreground/50">Analyse de votre profil…</p>
            </motion.div>
          ) : products.length > 0 ? (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-3"
            >
              {products.slice(0, 4).map((product, i) => (
                <motion.div
                  key={product.handle}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
                  className="group cursor-pointer"
                  onClick={onStartDiagnostic}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 border border-white/5 mb-1.5">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Storefront weight="light" className="w-6 h-6 text-foreground/20" />
                      </div>
                    )}
                    {/* AI Badge */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-primary/90 text-primary-foreground text-[9px] font-semibold flex items-center gap-0.5">
                      <Sparkle weight="fill" className="w-2.5 h-2.5" />
                      IA
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </p>
                  <p className="text-xs font-semibold text-foreground/70">
                    {parseFloat(product.price).toFixed(2)} {product.currency}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center py-8 text-xs text-foreground/40">
              Aucune recommandation disponible
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <button
        onClick={onStartDiagnostic}
        className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-medium group"
      >
        Visiter le Shop
        <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

function mapProduct(p: ShopifyProduct): RecommendedProduct {
  const variant = p.node.variants.edges[0]?.node;
  const image = p.node.images.edges[0]?.node;
  return {
    handle: p.node.handle,
    title: p.node.title,
    price: variant?.price?.amount || p.node.priceRange.minVariantPrice.amount,
    currency: variant?.price?.currencyCode || p.node.priceRange.minVariantPrice.currencyCode,
    imageUrl: image?.url || '',
  };
}
