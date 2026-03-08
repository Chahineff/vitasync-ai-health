import { Plus, Check, SpinnerGap, Sparkle } from '@phosphor-icons/react';
import { ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';

interface BuildYourStackProps {
  products: ShopifyProduct[];
  currentProductId: string;
  onProductClick?: (handle: string) => void;
}

// Mapping productType/tags → health goals
const goalTagMap: Record<string, string[]> = {
  energy: ['energy', 'caffeine', 'b-vitamin', 'iron', 'coq10'],
  sleep: ['sleep', 'melatonin', 'magnesium', 'ashwagandha', 'gaba'],
  muscle: ['protein', 'creatine', 'bcaa', 'recovery', 'muscle'],
  immunity: ['vitamin c', 'vitamin d', 'zinc', 'elderberry', 'immune'],
  digestion: ['probiotic', 'digestive', 'fiber', 'enzyme', 'gut'],
  stress: ['ashwagandha', 'rhodiola', 'adaptogen', 'stress', 'calm'],
  skin: ['collagen', 'biotin', 'hyaluronic', 'skin', 'beauty'],
  heart: ['omega', 'fish oil', 'coq10', 'heart', 'cardiovascular'],
};

function productMatchesGoals(product: ShopifyProduct, goals: string[]): number {
  const searchText = `${product.node.title} ${product.node.productType}`.toLowerCase();
  let score = 0;
  for (const goal of goals) {
    const keywords = goalTagMap[goal.toLowerCase()] || [goal.toLowerCase()];
    for (const kw of keywords) {
      if (searchText.includes(kw)) { score += 1; break; }
    }
  }
  return score;
}

export function BuildYourStack({ products, currentProductId, onProductClick }: BuildYourStackProps) {
  const addItem = useCartStore(state => state.addItem);
  const { healthProfile } = useHealthProfile();

  const crossSellProducts = useMemo(() => {
    const filtered = products.filter(p => p.node.id !== currentProductId);
    const goals = (healthProfile?.health_goals || []) as string[];
    
    if (goals.length === 0) return filtered.slice(0, 6);

    // Sort by goal relevance
    return [...filtered]
      .sort((a, b) => productMatchesGoals(b, goals) - productMatchesGoals(a, goals))
      .slice(0, 6);
  }, [products, currentProductId, healthProfile]);

  if (crossSellProducts.length === 0) return null;

  const hasPersonalization = (healthProfile?.health_goals?.length || 0) > 0;

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

  const getReasonTag = (product: ShopifyProduct): string => {
    const goals = (healthProfile?.health_goals || []) as string[];
    for (const goal of goals) {
      const keywords = goalTagMap[goal.toLowerCase()] || [];
      const searchText = `${product.node.title} ${product.node.productType}`.toLowerCase();
      for (const kw of keywords) {
        if (searchText.includes(kw)) return goal;
      }
    }
    const t = product.node.productType?.toLowerCase() || '';
    if (t.includes('protein')) return 'Recovery';
    if (t.includes('vitamin')) return 'Daily Health';
    if (t.includes('mineral')) return 'Essential';
    return 'Wellness';
  };

  return (
    <section className="py-6 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
          {hasPersonalization ? 'Recommande pour vous' : 'Pairs well with'}
        </h2>
        {hasPersonalization && <Sparkle weight="fill" className="w-5 h-5 text-secondary" />}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin -mx-2 px-2">
        {crossSellProducts.map((product) => (
          <CompactCrossSellCard
            key={product.node.id}
            product={product}
            reasonTag={getReasonTag(product)}
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
    <div className="flex-shrink-0 w-[160px] rounded-2xl bg-muted/10 border border-border/30 overflow-hidden">
      <button onClick={onClick} className="w-full aspect-square bg-background p-2">
        {image ? (
          <img src={image.url} alt={image.altText || product.node.title} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/20 text-xs">IMG</div>
        )}
      </button>

      <div className="p-3 space-y-2">
        <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
          {reasonTag}
        </span>
        <button onClick={onClick} className="block text-left">
          <h4 className="text-xs font-medium text-foreground line-clamp-2 leading-tight hover:text-primary transition-colors">
            {product.node.title}
          </h4>
        </button>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">{parseFloat(price.amount).toFixed(2)} &euro;</span>
          <button
            onClick={handleAdd}
            disabled={adding}
            className="w-7 h-7 rounded-lg border border-border/50 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-colors disabled:opacity-50"
          >
            {adding ? <SpinnerGap className="w-3.5 h-3.5 animate-spin" /> : <Plus weight="bold" className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
