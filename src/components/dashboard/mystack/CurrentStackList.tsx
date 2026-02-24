import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowsClockwise, Trash, Spinner } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

interface StackProduct {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: string;
  shopifyProductId?: string;
}

interface CurrentStackListProps {
  index: number;
  customer: ReturnType<typeof useShopifyCustomer>;
}

// Query to get subscription contract lines from Customer Account API
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

export function CurrentStackList({ index, customer }: CurrentStackListProps) {
  const { isConnected, isLoading: customerLoading, executeQuery } = customer;
  const [products, setProducts] = useState<StackProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Only fetch real order data when connected to Shopify
  useEffect(() => {
    async function loadSubscriptionProducts() {
      if (!isConnected) {
        setProducts([]);
        return;
      }

      // Connected: Try to fetch from Customer Account API
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
        Dans votre prochaine box
      </h2>

      {loading ? (
        <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-border/50 p-8 flex items-center justify-center">
          <Spinner className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Chargement des produits...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-border/50 p-8 text-center space-y-3">
          <p className="text-muted-foreground">Votre prochaine box est vide. Explorez notre boutique pour constituer votre stack.</p>
          <Button
            variant="outline"
            className="rounded-xl border-border"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'shop' }))}
          >
            Parcourir la boutique
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-border/50 divide-y divide-border/50">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 md:p-6 transition-all duration-200 hover:bg-muted/30 first:rounded-t-[20px] last:rounded-b-[20px] group"
            >
              {/* Image */}
              <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-medium text-foreground truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground">x{product.quantity}</p>
              </div>

              {/* Price */}
              <p className="text-base font-semibold text-foreground hidden sm:block">
                {product.price}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/5">
                  <ArrowsClockwise weight="bold" className="w-4 h-4" />
                  <span className="hidden md:inline">Échanger</span>
                </button>
                <button className="text-sm text-muted-foreground hover:text-destructive transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-destructive/5">
                  <Trash weight="bold" className="w-4 h-4" />
                  <span className="hidden md:inline">Retirer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
