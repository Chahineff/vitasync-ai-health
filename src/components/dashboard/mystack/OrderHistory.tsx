import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, ShoppingBag } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';
import type { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

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

  useEffect(() => {
    if (!isConnected) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await executeQuery(ORDERS_QUERY) as {
          data?: {
            customer?: {
              orders?: {
                edges: Array<{
                  node: {
                    id: string;
                    name: string;
                    processedAt: string;
                    totalPrice: { amount: string; currencyCode: string };
                    lineItems: {
                      edges: Array<{
                        node: {
                          title: string;
                          quantity: number;
                          image?: { url: string; altText: string | null } | null;
                          discountedTotalPrice: { amount: string; currencyCode: string };
                        };
                      }>;
                    };
                  };
                }>;
              };
            };
          };
        };

        const edges = result?.data?.customer?.orders?.edges || [];
        setOrders(
          edges.map((e) => ({
            ...e.node,
            lineItems: e.node.lineItems.edges.map((li) => li.node),
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

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat(intlLocale, { style: 'currency', currency }).format(parseFloat(amount));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(intlLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Receipt weight="duotone" className="w-6 h-6 text-foreground/70" />
        <h2 className="text-xl font-semibold text-foreground">{t('orders.title')}</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-[20px] p-5 border border-border/50 animate-pulse h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-card rounded-[20px] p-6 border border-border/50 text-center">
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-[20px] p-8 border border-border/50 text-center">
          <ShoppingBag weight="duotone" className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t('orders.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-5 border border-border/50"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-semibold text-foreground">{order.name}</span>
                  <span className="text-sm text-muted-foreground ml-3">
                    {formatDate(order.processedAt)}
                  </span>
                </div>
                <span className="font-semibold text-foreground">
                  {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {order.lineItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {item.image?.url && (
                      <img
                        src={item.image.url}
                        alt={item.image.altText || item.title}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    )}
                    <span className="text-muted-foreground">
                      {item.title} × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
