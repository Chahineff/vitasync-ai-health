import { Plus, Check, SpinnerGap } from '@phosphor-icons/react';
import { ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { useState } from 'react';

interface BuildYourStackProps {
  products: ShopifyProduct[];
  currentProductId: string;
  onProductClick?: (handle: string) => void;
}

export function BuildYourStack({ products, currentProductId, onProductClick }: BuildYourStackProps) {
  const addItem = useCartStore(state => state.addItem);
  
  const crossSellProducts = products
    .filter(p => p.node.id !== currentProductId)
    .slice(0, 6);

  if (crossSellProducts.length === 0) return null;

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
      toast.success('Bundle updated', {
        description: `${product.node.title} added`,
        position: 'top-center',
      });
    } catch {
      toast.error('Failed to add product');
    }
  };

  // Derive reason tag from productType
  const getReasonTag = (type: string): string => {
    const t = type?.toLowerCase() || '';
    if (t.includes('protein')) return 'Recovery';
    if (t.includes('vitamin')) return 'Daily Health';
    if (t.includes('mineral')) return 'Essential';
    if (t.includes('sleep')) return 'Sleep';
    if (t.includes('energy')) return 'Energy';
    if (t.includes('omega') || t.includes('fish')) return 'Heart Health';
    if (t.includes('probiotic') || t.includes('digest')) return 'Gut Health';
    return 'Wellness';
  };

  return (
    <section className="py-6 space-y-4">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
        Pairs well with
      </h2>

      {/* Horizontal scroll carousel */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin -mx-2 px-2">
        {crossSellProducts.map((product) => (
          <CompactCrossSellCard
            key={product.node.id}
            product={product}
            reasonTag={getReasonTag(product.node.productType)}
            onAdd={() => handleAddToCart(product)}
            onClick={() => onProductClick?.(product.node.handle)}
          />
        ))}
      </div>
    </section>
  );
}

function CompactCrossSellCard({ product, reasonTag, onAdd, onClick }: { 
  product: ShopifyProduct; reasonTag: string; onAdd: () => void; onClick: () => void 
}) {
  const [adding, setAdding] = useState(false);
  const image = product.node.images.edges[0]?.node;
  const price = product.node.priceRange.minVariantPrice;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    await onAdd();
    setAdding(false);
  };

  return (
    <div className="flex-shrink-0 w-[160px] rounded-2xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30 overflow-hidden">
      {/* Image */}
      <button onClick={onClick} className="w-full aspect-square bg-white dark:bg-muted/10 p-2">
        {image ? (
          <img src={image.url} alt={image.altText || product.node.title} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/20 text-xs">IMG</div>
        )}
      </button>

      <div className="p-3 space-y-2">
        {/* Reason tag */}
        <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
          {reasonTag}
        </span>

        {/* Title */}
        <button onClick={onClick} className="block text-left">
          <h4 className="text-xs font-medium text-foreground line-clamp-2 leading-tight hover:text-primary transition-colors">
            {product.node.title}
          </h4>
        </button>

        {/* Price + Add */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">{parseFloat(price.amount).toFixed(2)} €</span>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="w-7 h-7 rounded-lg border border-[#E2E8F0] dark:border-border/50 flex items-center justify-center hover:bg-secondary hover:text-[#0B1220] hover:border-secondary transition-colors disabled:opacity-50"
          >
            {adding ? <SpinnerGap className="w-3.5 h-3.5 animate-spin" /> : <Plus weight="bold" className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
