import { motion } from 'framer-motion';
import { Package, ArrowRight } from '@phosphor-icons/react';
import { useShopifyCustomer } from '@/hooks/useShopifyCustomer';
import { formatPriceUSD } from '@/lib/utils';

interface MyStackPreviewWidgetProps {
  onGoToStack: () => void;
}

/**
 * "Mon Stack" preview widget on the dashboard home.
 *
 * SOURCE OF TRUTH: the user's active Shopify subscription contract
 * (next box line items), via useShopifyCustomer → subscriptionContracts.
 *
 * This widget MUST NOT read from useSupplementTracking — that is the
 * separate "daily tracking" model (supplements the user takes & checks
 * off each day). The two are intentionally distinct:
 *   - subscriptionStack  → Shopify subscription / next box (this widget)
 *   - dailyTracking      → supplement_tracking table (Supplement Tracking tab)
 */
export function MyStackPreviewWidget({ onGoToStack }: MyStackPreviewWidgetProps) {
  const { subscriptions, isLoading } = useShopifyCustomer();

  const activeContract =
    subscriptions.find((s) => s.status === 'ACTIVE') ?? subscriptions[0] ?? null;

  const products = activeContract
    ? activeContract.lines.edges.map((edge) => ({
        id: edge.node.id,
        name: edge.node.title,
        image: edge.node.variantImage?.url || '/placeholder.svg',
        quantity: edge.node.quantity,
        price: formatPriceUSD(edge.node.currentPrice.amount),
      }))
    : [];

  const loading = isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium rounded-3xl p-6 h-full border border-white/10 flex flex-col min-h-[280px]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package weight="light" className="w-5 h-5 text-primary/60" />
        </div>
        <div>
          <h3 className="text-base font-medium tracking-tight text-foreground">Mon Stack</h3>
          <p className="text-xs text-foreground/50 font-light">
            {loading
              ? '...'
              : activeContract
              ? `${products.length} produit${products.length !== 1 ? 's' : ''} dans la prochaine box`
              : 'Aucun abonnement actif'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mb-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <Package weight="light" className="w-10 h-10 text-foreground/20 mb-3" />
            <p className="text-sm text-foreground/50 font-light">
              Aucun abonnement actif. Construisez votre stack mensuel.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/20 border border-white/5"
              >
                <img
                  src={p.image}
                  alt=""
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-muted/30"
                />
                <span className="text-sm text-foreground/80 font-light truncate flex-1">
                  {p.name}
                </span>
                <span className="text-[10px] text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full flex-shrink-0">
                  ×{p.quantity}
                </span>
              </div>
            ))}
            {products.length > 4 && (
              <p className="text-xs text-foreground/40 text-center pt-1">
                +{products.length - 4} autre{products.length - 4 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onGoToStack}
        className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-medium group"
      >
        {activeContract ? 'Voir mon stack' : 'Construire mon stack'}
        <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}
