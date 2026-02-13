import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Robot, ArrowRight, Storefront } from '@phosphor-icons/react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';

interface AwaitingAnalysisProps {
  title: string;
  onStartDiagnostic: () => void;
}

export const AwaitingAnalysis = ({ title, onStartDiagnostic }: AwaitingAnalysisProps) => {
  const [previewProducts, setPreviewProducts] = useState<ShopifyProduct[]>([]);

  useEffect(() => {
    fetchProducts(6).then(setPreviewProducts).catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-premium rounded-3xl p-6 h-full border border-white/10 flex flex-col min-h-[280px]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Storefront weight="light" className="w-5 h-5 text-primary/60" />
        </div>
        <div>
          <h3 className="text-base font-medium tracking-tight text-foreground">{title}</h3>
          <p className="text-xs text-foreground/50 font-light">
            Discutez avec le Coach IA pour des recommandations
          </p>
        </div>
      </div>

      {/* Shop Preview Grid */}
      {previewProducts.length > 0 && (
        <div className="flex-1 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Storefront weight="duotone" className="w-4 h-4 text-primary/50" />
            <span className="text-xs text-foreground/40 font-medium uppercase tracking-wider">Aperçu boutique</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {previewProducts.slice(0, 6).map((product, i) => {
              const imgUrl = product.node.images.edges[0]?.node.url;
              return (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
                  className="aspect-square rounded-xl overflow-hidden bg-muted/30 border border-white/5"
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={product.node.title}
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Storefront weight="light" className="w-5 h-5 text-foreground/20" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

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
