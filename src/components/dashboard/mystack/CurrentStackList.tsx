import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowsClockwise, Trash, Spinner, Package, Sun, Moon, Coffee, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import type { useShopifyCustomer } from '@/hooks/useShopifyCustomer';
import { formatPriceUSD } from '@/lib/utils';

interface StackProduct {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: string;
  shopifyProductId?: string;
  recommendedByAI?: boolean;
  timeOfDay?: string;
}

interface CurrentStackListProps {
  index: number;
  customer: ReturnType<typeof useShopifyCustomer>;
}

const SUBSCRIPTION_LINES_QUERY = `
  query {
    customer {
      orders(first: 1, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  image {
                    url
                    altText
                  }
                  discountedTotalPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const timeIcons: Record<string, typeof Sun> = {
  morning: Sun,
  afternoon: Coffee,
  evening: Moon,
};

export function CurrentStackList({ index, customer }: CurrentStackListProps) {
  const { t } = useTranslation();
  const { isConnected, isLoading: customerLoading, executeQuery } = customer;
  const [products, setProducts] = useState<StackProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadSubscriptionProducts() {
      if (!isConnected) { setProducts([]); return; }
      setIsLoading(true);
      try {
        const data = await executeQuery(SUBSCRIPTION_LINES_QUERY);
        const orders = (data as any)?.data?.customer?.orders?.edges || [];
        if (orders.length > 0) {
          const latestOrder = orders[0].node;
          const lineItems = latestOrder.lineItems.edges.map((edge: any) => edge.node);
          setProducts(
            lineItems.map((item: any, idx: number) => ({
              id: `order-${idx}`,
              name: item.title,
              image: item.image?.url || '/placeholder.svg',
              quantity: item.quantity,
              price: `${parseFloat(item.discountedTotalPrice.amount).toFixed(2)} €`,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch subscription lines:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSubscriptionProducts();
  }, [isConnected, executeQuery]);

  const loading = customerLoading || isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
        {t('mystack.nextBox')}
      </h2>

      {loading ? (
        <div className="bg-card rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-border/50 p-8 flex items-center justify-center">
          <Spinner className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">{t('mystack.loadingProducts')}</span>
        </div>
      ) : products.length === 0 ? (
        /* ── Enhanced empty state ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-dashed border-border p-10 md:p-14 text-center relative overflow-hidden"
        >
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/10"
                style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-5">
              <Package weight="duotone" className="w-10 h-10 text-primary/50" />
            </div>
          </motion.div>

          <h3 className="text-lg font-semibold text-foreground mb-2 relative z-10">
            {t('mystack.emptyBox')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto relative z-10">
            {t('mystack.exploreShop')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Button
              className="rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'coach' }))}
            >
              <Sparkle weight="fill" className="w-4 h-4 mr-1.5" />
              {t('mystack.createWithCoach')}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl border-border"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'shop' }))}
            >
              {t('mystack.browseShop')}
              <ArrowRight weight="bold" className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-card rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-border/50 divide-y divide-border/30 overflow-hidden">
          <AnimatePresence>
            {products.map((product, i) => {
              const TimeIcon = product.timeOfDay ? timeIcons[product.timeOfDay] || Sun : null;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className="flex items-center gap-4 p-4 md:p-5 transition-all duration-200 hover:bg-muted/20 group"
                >
                  {/* Image */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-muted/30 flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/30">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm md:text-base font-medium text-foreground truncate">
                        {product.name}
                      </h3>
                      {product.recommendedByAI && (
                        <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-[10px] px-1.5 py-0 h-5 flex-shrink-0">
                          <Sparkle weight="fill" className="w-3 h-3 mr-0.5" />
                          IA
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">×{product.quantity}</span>
                      {TimeIcon && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-full">
                          <TimeIcon weight="fill" className="w-3 h-3" />
                          {product.timeOfDay === 'morning' ? t('mystack.morning') :
                           product.timeOfDay === 'afternoon' ? t('mystack.afternoon') :
                           t('mystack.evening')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <p className="text-sm font-semibold text-foreground hidden sm:block tabular-nums">
                    {product.price}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors">
                      <ArrowsClockwise weight="bold" className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors">
                      <Trash weight="bold" className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
