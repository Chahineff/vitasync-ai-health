import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart } from '@phosphor-icons/react';
import { fetchProductByHandle, fetchProducts, ProductDetail, ShopifyProduct } from '@/lib/shopify';
import { parseProductDescription, ParsedProductData } from '@/lib/shopify-parser';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CartDrawer } from '../CartDrawer';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/hooks/useTranslation';

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

// Cache for product data to enable instant switching
interface CachedProduct {
  product: ProductDetail;
  parsedData: ParsedProductData | null;
}

export function ProductDetailMaster({ 
  handle, 
  onBack, 
  onProductSelect,
  recommendedByAI = false 
}: ProductDetailMasterProps) {
  const { t } = useTranslation();
  
  // Current handle being displayed (can differ from prop during flavor switching)
  const [currentHandle, setCurrentHandle] = useState(handle);
  
  // Cache of all related products (flavor variants)
  const [productCache, setProductCache] = useState<Map<string, CachedProduct>>(new Map());
  
  // All products for cross-sell and finding related products
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  
  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [preloadingFlavors, setPreloadingFlavors] = useState(false);
  
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  
  const cartItems = useCartStore(state => state.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Reset when handle prop changes (new product entirely)
  useEffect(() => {
    if (handle !== currentHandle && !productCache.has(handle)) {
      setCurrentHandle(handle);
      setProductCache(new Map());
      setInitialLoading(true);
    } else if (handle !== currentHandle && productCache.has(handle)) {
      // Handle exists in cache, just switch
      setCurrentHandle(handle);
    }
  }, [handle]);

  // Load initial product and all products
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        // Load the main product and all products in parallel
        const [productData, productsData] = await Promise.all([
          fetchProductByHandle(currentHandle),
          fetchProducts(100)
        ]);
        
        setAllProducts(productsData);
        
        if (productData) {
          const parsed = parseProductDescription(
            productData.descriptionHtml,
            productData.tags,
            {
              benefits: productData.benefitsMetafield?.value,
              ingredients: productData.ingredientsMetafield?.value,
            }
          );
          
          // Add to cache
          const newCache = new Map(productCache);
          newCache.set(currentHandle, { product: productData, parsedData: parsed });
          setProductCache(newCache);
          
          // Preload related products (flavor variants) in background
          preloadRelatedProducts(productData, productsData, newCache);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error(t('pdp.loadError'));
      } finally {
        setInitialLoading(false);
      }
    };
    
    // Only load if not in cache
    if (!productCache.has(currentHandle)) {
      loadInitialData();
    }
  }, [currentHandle]);

  // Preload all flavor variants in background
  const preloadRelatedProducts = async (
    mainProduct: ProductDetail, 
    products: ShopifyProduct[],
    existingCache: Map<string, CachedProduct>
  ) => {
    const flavorPatterns = [
      /\s*\(([^)]+)\)\s*$/,
      /\s*-\s*([^-]+)\s*$/,
    ];
    
    let baseTitle = mainProduct.title;
    for (const pattern of flavorPatterns) {
      const match = mainProduct.title.match(pattern);
      if (match) {
        baseTitle = mainProduct.title.replace(pattern, '').trim();
        break;
      }
    }
    
    // Find all related product handles
    const relatedHandles: string[] = [];
    for (const p of products) {
      let pBase = p.node.title;
      for (const pattern of flavorPatterns) {
        const match = p.node.title.match(pattern);
        if (match) {
          pBase = p.node.title.replace(pattern, '').trim();
          break;
        }
      }
      
      if (pBase === baseTitle && p.node.handle !== mainProduct.handle && !existingCache.has(p.node.handle)) {
        relatedHandles.push(p.node.handle);
      }
    }
    
    if (relatedHandles.length === 0) return;
    
    setPreloadingFlavors(true);
    
    try {
      // Fetch all related products in parallel
      const relatedProducts = await Promise.all(
        relatedHandles.map(h => fetchProductByHandle(h))
      );
      
      const newCache = new Map(existingCache);
      
      for (const product of relatedProducts) {
        if (product) {
          const parsed = parseProductDescription(
            product.descriptionHtml,
            product.tags,
            {
              benefits: product.benefitsMetafield?.value,
              ingredients: product.ingredientsMetafield?.value,
            }
          );
          newCache.set(product.handle, { product, parsedData: parsed });
        }
      }
      
      setProductCache(newCache);
    } catch (error) {
      console.error('Failed to preload flavor variants:', error);
    } finally {
      setPreloadingFlavors(false);
    }
  };

  // Get current product from cache
  const currentProduct = productCache.get(currentHandle);
  const product = currentProduct?.product || null;
  const parsedData = currentProduct?.parsedData || null;

  // Find related products (same base name = flavor variants)
  const relatedProducts = useMemo((): Array<{ flavor: string; handle: string }> => {
    if (!product || !allProducts.length) return [];
    
    const flavorPatterns = [
      /\s*\(([^)]+)\)\s*$/,
      /\s*-\s*([^-]+)\s*$/,
    ];
    
    let baseTitle = product.title;
    for (const pattern of flavorPatterns) {
      const match = product.title.match(pattern);
      if (match) {
        baseTitle = product.title.replace(pattern, '').trim();
        break;
      }
    }
    
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
  }, [product, allProducts]);

  // Handle instant flavor switching
  const handleFlavorChange = useCallback((newHandle: string) => {
    if (productCache.has(newHandle)) {
      // Instant switch - product is already cached
      setCurrentHandle(newHandle);
      setSelectedVariantIndex(0);
      // Update URL without triggering a reload
      if (onProductSelect) {
        onProductSelect(newHandle);
      }
    } else {
      // Fallback: product not in cache, let parent handle navigation
      if (onProductSelect) {
        onProductSelect(newHandle);
      }
    }
  }, [productCache, onProductSelect]);

  const images = product?.images.edges.map(e => e.node) || [];

  if (initialLoading) {
    return <ProductDetailSkeleton onBack={onBack} t={t} />;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-foreground/60 font-light mb-4">{t('pdp.productNotFound')}</p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('pdp.backToShop')}
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
              <span className="text-sm font-light">{t('pdp.backToShop')}</span>
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
              onFlavorChange={handleFlavorChange}
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
        <ScienceSection productTitle={product.title} productHandle={currentHandle} />

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
          onProductClick={handleFlavorChange}
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

function ProductDetailSkeleton({ onBack, t }: { onBack: () => void; t: (key: string) => string }) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
      >
        <ArrowLeft weight="light" className="w-5 h-5" />
        <span className="text-sm font-light">{t('pdp.backToShop')}</span>
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
