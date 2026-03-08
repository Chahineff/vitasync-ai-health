import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, ShoppingBag, CaretDown } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';
import type { useShopifyCustomer } from '@/hooks/useShopifyCustomer';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  name: string;
  processedAt: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: Array<{
    title: string;
    quantity: number;
    image?: { url: string; altText: string | null } | null;
    discountedTotalPrice: { amount: string; currencyCode: string };
  }>;
}

const ORDERS_QUERY = `
  query {
    customer {
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            totalPrice {
              amount
              currencyCode
            }
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

interface OrderHistoryProps {
  index: number;
  customer: ReturnType<typeof useShopifyCustomer>;
}

export function OrderHistory({ index, customer }: OrderHistoryProps) {
  const { t, locale } = useTranslation();
  const { isConnected, executeQuery } = customer;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) return;
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await executeQuery(ORDERS_QUERY) as any;
        const edges = result?.data?.customer?.orders?.edges || [];
        setOrders(
          edges.map((e: any) => ({
            ...e.node,
            lineItems: e.node.lineItems.edges.map((li: any) => li.node),
          }))
        );
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(t('orders.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isConnected, executeQuery]);

  if (!isConnected) return null;

  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', ar: 'ar-SA', zh: 'zh-CN', pt: 'pt-BR' };
  const intlLocale = localeMap[locale] || 'en-US';

  const formatPrice = (amount: string, currency: string) =>
    new Intl.NumberFormat(intlLocale, { style: 'currency', currency }).format(parseFloat(amount));

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(intlLocale, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
          <Receipt weight="duotone" className="w-5 h-5 text-foreground/70" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">{t('orders.title')}</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-5 border border-border/50 animate-pulse h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-card rounded-2xl p-6 border border-border/50 text-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 border border-dashed border-border/50 text-center">
          <ShoppingBag weight="duotone" className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground">{t('orders.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order, i) => {
            const isExpanded = expandedId === order.id;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-border/50 overflow-hidden"
              >
                {/* Accordion header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-muted/20 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
                      <ShoppingBag weight="duotone" className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground text-sm">{order.name}</span>
                      <p className="text-xs text-muted-foreground">{formatDate(order.processedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground text-sm tabular-nums">
                      {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CaretDown weight="bold" className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </button>

                {/* Accordion content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 pt-1 border-t border-border/30">
                        <div className="flex flex-wrap gap-3 pt-3">
                          {order.lineItems.map((item, li) => (
                            <div key={li} className="flex items-center gap-2.5 bg-muted/20 rounded-xl px-3 py-2">
                              {item.image?.url && (
                                <img
                                  src={item.image.url}
                                  alt={item.image.altText || item.title}
                                  className="w-9 h-9 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="text-xs font-medium text-foreground">{item.title}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  ×{item.quantity} · {formatPrice(item.discountedTotalPrice.amount, item.discountedTotalPrice.currencyCode)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
