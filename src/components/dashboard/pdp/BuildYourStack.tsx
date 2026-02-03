import { Plus, Stack } from '@phosphor-icons/react';
import { ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface BuildYourStackProps {
  products: ShopifyProduct[];
  currentProductId: string;
  onProductClick?: (handle: string) => void;
}

export function BuildYourStack({ products, currentProductId, onProductClick }: BuildYourStackProps) {
  const addItem = useCartStore(state => state.addItem);
  
  // Filter out current product and get up to 4 products
  const crossSellProducts = products
    .filter(p => p.node.id !== currentProductId)
    .slice(0, 4);

  if (crossSellProducts.length === 0) return null;

  const pairsWell = crossSellProducts.slice(0, 2);
  const popularStack = crossSellProducts.slice(2, 4);

  const handleAddToCart = async (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    try {
      await addItem({
        product,
        variantId: variant.id,
        variantTitle: variant.title,
        price: variant.price,
        quantity: 1,
        selectedOptions: variant.selectedOptions || [],
      });
      toast.success('Ajouté au panier', {
        description: product.node.title,
        position: 'top-center',
      });
    } catch (error) {
      toast.error("Erreur lors de l'ajout au panier");
    }
  };

  return (
    <section className="py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Stack weight="light" className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          Build Your Stack
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pairs Well With */}
        {pairsWell.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm text-foreground/60 font-medium">Pairs well with:</h3>
            <div className="space-y-3">
              {pairsWell.map((product) => (
                <CrossSellCard 
                  key={product.node.id} 
                  product={product} 
                  onAdd={() => handleAddToCart(product)}
                  onClick={() => onProductClick?.(product.node.handle)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Popular Stack */}
        {popularStack.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm text-foreground/60 font-medium">Popular stack:</h3>
            <div className="space-y-3">
              {popularStack.map((product) => (
                <CrossSellCard 
                  key={product.node.id} 
                  product={product} 
                  onAdd={() => handleAddToCart(product)}
                  onClick={() => onProductClick?.(product.node.handle)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

interface CrossSellCardProps {
  product: ShopifyProduct;
  onAdd: () => void;
  onClick: () => void;
}

function CrossSellCard({ product, onAdd, onClick }: CrossSellCardProps) {
  const image = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;
  
  // Get first benefit from description
  const benefit = product.node.description
    ?.replace(/<[^>]+>/g, '')
    ?.split('.')
    ?.[0]
    ?.trim()
    ?.substring(0, 60) || 'Premium supplement';

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors group">
      {/* Image */}
      <button 
        onClick={onClick}
        className="w-16 h-16 rounded-xl bg-background overflow-hidden flex-shrink-0"
      >
        {image ? (
          <img 
            src={image.url} 
            alt={image.altText || product.node.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted/50 flex items-center justify-center">
            <span className="text-xs text-foreground/30">IMG</span>
          </div>
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <button 
          onClick={onClick}
          className="text-left"
        >
          <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {product.node.title}
          </h4>
        </button>
        <p className="text-xs text-foreground/50 font-light truncate">
          {benefit}
        </p>
        <p className="text-sm font-semibold text-foreground mt-1">
          {parseFloat(price.amount).toFixed(2)} €
        </p>
      </div>

      {/* Add Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-colors flex-shrink-0"
      >
        <Plus weight="bold" className="w-5 h-5" />
      </button>
    </div>
  );
}
