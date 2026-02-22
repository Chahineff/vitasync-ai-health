import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartSimple, Star, Check, SpinnerGap } from '@phosphor-icons/react';
import { ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: ShopifyProduct;
  recommendedByAI?: boolean;
  onProductClick?: (handle: string) => void;
}

export function ProductCard({ product, recommendedByAI = false, onProductClick }: ProductCardProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const { node } = product;
  const variants = node.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const mainImage = node.images.edges[0]?.node;
  const price = selectedVariant?.price || node.priceRange.minVariantPrice;

  const hasMultipleVariants = variants.length > 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedVariant || isAdding) return;

    setIsAdding(true);
    try {
      await addItem({
        product,
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity: 1,
        selectedOptions: selectedVariant.selectedOptions || [],
      });
      setJustAdded(true);
      toast.success('Produit ajouté au panier', {
        description: node.title,
        position: 'top-center',
      });
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAdding(false);
    }
  };

  const handleVariantClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariantIndex(index);
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(node.handle);
    }
  };

  return (
    <div onClick={handleCardClick} className={onProductClick ? "cursor-pointer" : ""}>
      <motion.div
        whileHover={{ y: -4 }}
        className="glass-card rounded-card overflow-hidden border border-border group flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-br from-white/5 to-white/10 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={mainImage.altText || node.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCartSimple weight="light" className="w-12 h-12 text-foreground/20" />
            </div>
          )}

          {/* AI Recommended Badge */}
          {recommendedByAI && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
              <Star weight="fill" className="w-3 h-3" />
              Recommandé
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="text-left">
            <h3 className="font-medium text-foreground truncate">{node.title}</h3>
            {node.description && (
              <p className="text-sm text-foreground/60 font-light line-clamp-2 mt-1">
                {node.description}
              </p>
            )}
          </div>

          {/* Variant Selector */}
          {hasMultipleVariants && (
            <div className="flex flex-wrap gap-2 mt-3">
              {variants.slice(0, 4).map((variant, index) => (
                <button
                  key={variant.node.id}
                  onClick={(e) => handleVariantClick(e, index)}
                  className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                    selectedVariantIndex === index
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/40 text-foreground/60 hover:bg-muted/60'
                  }`}
                >
                  {variant.node.title}
                </button>
              ))}
              {variants.length > 4 && (
                <span className="px-2 py-1 text-xs text-foreground/40">
                  +{variants.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="text-left mt-3">
            <span className="text-xl font-bold text-foreground">
              {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
            </span>
          </div>

          {/* Add to Cart — Full Width */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !selectedVariant?.availableForSale}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-btn text-sm font-medium transition-all duration-150 mt-4 ${
              justAdded
                ? 'bg-green-500/20 text-green-600'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAdding ? (
              <SpinnerGap className="w-4 h-4 animate-spin" />
            ) : justAdded ? (
              <>
                <Check weight="bold" className="w-4 h-4" />
                Ajouté
              </>
            ) : (
              <>
                <ShoppingCartSimple weight="bold" className="w-4 h-4" />
                Ajouter
              </>
            )}
          </button>

          {!selectedVariant?.availableForSale && (
            <p className="text-xs text-destructive font-light mt-2">Rupture de stock</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}