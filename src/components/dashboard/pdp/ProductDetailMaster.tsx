import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart } from '@phosphor-icons/react';
import { fetchProductByHandle, fetchProducts, ProductDetail, ShopifyProduct } from '@/lib/shopify';
import { parseProductDescription, ParsedProductData } from '@/lib/shopify-parser';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CartDrawer } from '../CartDrawer';
import { useCartStore } from '@/stores/cartStore';

// Import all PDP sections
import { ProductGallery } from './ProductGallery';
import { ProductPurchaseBox } from './ProductPurchaseBox';
import { QuickBenefitsStrip } from './QuickBenefitsStrip';
import { WhatItDoes } from './WhatItDoes';
import { HowToTake } from './HowToTake';
import { IngredientsLabel } from './IngredientsLabel';
import { QualitySourcing } from './QualitySourcing';
import { SafetyCautions } from './SafetyCautions';
import { ScienceSection } from './ScienceSection';
import { ProductFAQ } from './ProductFAQ';
import { ProductReviews } from './ProductReviews';
import { BuildYourStack } from './BuildYourStack';
import { PDPFooter } from './PDPFooter';
import { MobileStickyCart } from './MobileStickyCart';

interface ProductDetailMasterProps {
  handle: string;
  onBack: () => void;
  onProductSelect?: (handle: string) => void;
  recommendedByAI?: boolean;
}

export function ProductDetailMaster({ 
  handle, 
  onBack, 
  onProductSelect,
  recommendedByAI = false 
}: ProductDetailMasterProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [parsedData, setParsedData] = useState<ParsedProductData | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  
  const cartItems = useCartStore(state => state.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    loadProduct();
    loadAllProducts();
  }, [handle]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await fetchProductByHandle(handle);
      setProduct(data);
      if (data) {
        const parsed = parseProductDescription(
          data.descriptionHtml,
          data.tags,
          {
            benefits: data.benefitsMetafield?.value,
            ingredients: data.ingredientsMetafield?.value,
          }
        );
        setParsedData(parsed);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error('Erreur lors du chargement du produit');
    } finally {
      setLoading(false);
    }
  };

  const loadAllProducts = async () => {
    try {
      const products = await fetchProducts(50);
      setAllProducts(products);
    } catch (error) {
      console.error('Failed to load products for cross-sell:', error);
    }
  };

  // Find related products (same base name = flavor variants)
  const findRelatedProducts = (): Array<{ flavor: string; handle: string }> => {
    if (!product || !allProducts.length) return [];
    
    // Extract base title (remove flavor suffix)
    const flavorPatterns = [
      /\s*\(([^)]+)\)\s*$/,
      /\s*-\s*([^-]+)\s*$/,
    ];
    
    let baseTitle = product.title;
    let currentFlavor = 'Default';
    
    for (const pattern of flavorPatterns) {
      const match = product.title.match(pattern);
      if (match) {
        currentFlavor = match[1].trim();
        baseTitle = product.title.replace(pattern, '').trim();
        break;
      }
    }
    
    // Find products with same base title
    const related: Array<{ flavor: string; handle: string }> = [];
    
    for (const p of allProducts) {
      let pBase = p.node.title;
      let pFlavor = 'Default';
      
      for (const pattern of flavorPatterns) {
        const match = p.node.title.match(pattern);
        if (match) {
          pFlavor = match[1].trim();
          pBase = p.node.title.replace(pattern, '').trim();
          break;
        }
      }
      
      if (pBase === baseTitle) {
        related.push({ flavor: pFlavor, handle: p.node.handle });
      }
    }
    
    return related.length > 1 ? related : [];
  };

  const relatedProducts = findRelatedProducts();
  const images = product?.images.edges.map(e => e.node) || [];

  if (loading) {
    return <ProductDetailSkeleton onBack={onBack} />;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-foreground/60 font-light mb-4">Produit non trouvé</p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la boutique
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-0 pb-24 lg:pb-8"
      >
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30 -mx-4 lg:-mx-8 px-4 lg:px-8 py-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
            >
              <ArrowLeft weight="light" className="w-5 h-5" />
              <span className="text-sm font-light">Retour à la boutique</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Heart weight="light" className="w-5 h-5 text-foreground/60" />
              </button>
              <CartDrawer>
                <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
                  <ShoppingCart weight="light" className="w-5 h-5 text-foreground/60" />
                  {totalCartItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                      {totalCartItems}
                    </span>
                  )}
                </button>
              </CartDrawer>
            </div>
          </div>
        </div>

        {/* 1. HERO Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery - 7/12 on desktop */}
          <div className="lg:col-span-7">
            <ProductGallery 
              images={images}
              productTitle={product.title}
              recommendedByAI={recommendedByAI}
            />
          </div>

          {/* Purchase Box - 5/12 on desktop */}
          <div className="lg:col-span-5">
            <ProductPurchaseBox 
              product={product}
              parsedData={parsedData}
              relatedProducts={relatedProducts}
              onFlavorChange={onProductSelect}
            />
          </div>
        </section>

        {/* 2. Quick Benefits Strip */}
        <QuickBenefitsStrip 
          productType={product.productType}
          parsedData={parsedData}
        />

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* 3. What It Does */}
        <WhatItDoes 
          description={product.description}
          parsedData={parsedData}
          productType={product.productType}
        />

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* 4. How To Take It */}
        <HowToTake parsedData={parsedData} />

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* 5. Ingredients & Label */}
        <IngredientsLabel 
          parsedData={parsedData}
          product={product}
        />

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* 6. Quality & Sourcing */}
        <QualitySourcing 
          parsedData={parsedData}
          vendor={product.vendor}
        />

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* 7. Safety & Cautions */}
        <SafetyCautions parsedData={parsedData} />

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* 8. Science (Simplified) */}
        <ScienceSection productTitle={product.title} />

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* 9. FAQ */}
        <ProductFAQ productTitle={product.title} />

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* 10. Reviews (Placeholder) */}
        <ProductReviews productTitle={product.title} />

        {/* Divider */}
        <div className="border-t border-border/30" />

        {/* 11. Build Your Stack (Cross-sell) */}
        <BuildYourStack 
          products={allProducts}
          currentProductId={product.id}
          onProductClick={onProductSelect}
        />

        {/* 12. Shipping / Returns / Support Footer */}
        <PDPFooter />
      </motion.div>

      {/* Mobile Sticky Cart */}
      <MobileStickyCart 
        product={product}
        selectedVariantIndex={selectedVariantIndex}
      />
    </>
  );
}

function ProductDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
      >
        <ArrowLeft weight="light" className="w-5 h-5" />
        <span className="text-sm font-light">Retour à la boutique</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
