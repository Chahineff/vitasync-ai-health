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
import { useEnrichedProductData } from '@/hooks/useEnrichedProductData';

// Import all PDP sections
import { ProductGallery } from './ProductGallery';
import { ProductPurchaseBox } from './ProductPurchaseBox';
import { CoachInsightCard } from './CoachInsightCard';
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
  const [currentHandle, setCurrentHandle] = useState(handle);
  const [productCache, setProductCache] = useState<Map<string, CachedProduct>>(new Map());
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  
  const cartItems = useCartStore(state => state.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const currentProduct = productCache.get(currentHandle);
  const product = currentProduct?.product || null;
  const parsedData = currentProduct?.parsedData || null;

  // Fetch enriched data from DB
  const { enrichedData } = useEnrichedProductData(product?.title || null);

  // Reset when handle prop changes
  useEffect(() => {
    if (handle !== currentHandle && !productCache.has(handle)) {
      setCurrentHandle(handle);
      setProductCache(new Map());
      setInitialLoading(true);
    } else if (handle !== currentHandle && productCache.has(handle)) {
      setCurrentHandle(handle);
    }
  }, [handle]);

  // Load initial product and all products
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
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
          
          const newCache = new Map(productCache);
          newCache.set(currentHandle, { product: productData, parsedData: parsed });
          setProductCache(newCache);
          preloadRelatedProducts(productData, productsData, newCache);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error(t('pdp.loadError'));
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (!productCache.has(currentHandle)) {
      loadInitialData();
    }
  }, [currentHandle]);

  const preloadRelatedProducts = async (
    mainProduct: ProductDetail, 
    products: ShopifyProduct[],
    existingCache: Map<string, CachedProduct>
  ) => {
    const flavorPatterns = [/\s*\(([^)]+)\)\s*$/, /\s*-\s*([^-]+)\s*$/];
    let baseTitle = mainProduct.title;
    for (const pattern of flavorPatterns) {
      const match = mainProduct.title.match(pattern);
      if (match) { baseTitle = mainProduct.title.replace(pattern, '').trim(); break; }
    }
    
    const relatedHandles: string[] = [];
    for (const p of products) {
      let pBase = p.node.title;
      for (const pattern of flavorPatterns) {
        const match = p.node.title.match(pattern);
        if (match) { pBase = p.node.title.replace(pattern, '').trim(); break; }
      }
      if (pBase === baseTitle && p.node.handle !== mainProduct.handle && !existingCache.has(p.node.handle)) {
        relatedHandles.push(p.node.handle);
      }
    }
    
    if (relatedHandles.length === 0) return;
    
    try {
      const relatedProducts = await Promise.all(relatedHandles.map(h => fetchProductByHandle(h)));
      const newCache = new Map(existingCache);
      for (const rp of relatedProducts) {
        if (rp) {
          const parsed = parseProductDescription(rp.descriptionHtml, rp.tags, {
            benefits: rp.benefitsMetafield?.value,
            ingredients: rp.ingredientsMetafield?.value,
          });
          newCache.set(rp.handle, { product: rp, parsedData: parsed });
        }
      }
      setProductCache(newCache);
    } catch (error) {
      console.error('Failed to preload flavor variants:', error);
    }
  };

  const relatedProducts = useMemo((): Array<{ flavor: string; handle: string }> => {
    if (!product || !allProducts.length) return [];
    const flavorPatterns = [/\s*\(([^)]+)\)\s*$/, /\s*-\s*([^-]+)\s*$/];
    let baseTitle = product.title;
    for (const pattern of flavorPatterns) {
      const match = product.title.match(pattern);
      if (match) { baseTitle = product.title.replace(pattern, '').trim(); break; }
    }
    const related: Array<{ flavor: string; handle: string }> = [];
    for (const p of allProducts) {
      let pBase = p.node.title;
      let pFlavor = 'Default';
      for (const pattern of flavorPatterns) {
        const match = p.node.title.match(pattern);
        if (match) { pFlavor = match[1].trim(); pBase = p.node.title.replace(pattern, '').trim(); break; }
      }
      if (pBase === baseTitle) related.push({ flavor: pFlavor, handle: p.node.handle });
    }
    return related.length > 1 ? related : [];
  }, [product, allProducts]);

  const handleFlavorChange = useCallback((newHandle: string) => {
    if (productCache.has(newHandle)) {
      setCurrentHandle(newHandle);
      setSelectedVariantIndex(0);
      if (onProductSelect) onProductSelect(newHandle);
    } else {
      if (onProductSelect) onProductSelect(newHandle);
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
        <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          {t('pdp.backToShop')}
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1200px] mx-auto px-4 lg:px-6 pb-24 lg:pb-8 overflow-x-hidden">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
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

        {/* HERO Section — 2 equal columns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <ProductGallery images={images} productTitle={product.title} recommendedByAI={recommendedByAI} tags={product.tags} />
          </div>
          <div>
            <ProductPurchaseBox 
              product={product}
              parsedData={parsedData}
              relatedProducts={relatedProducts}
              onFlavorChange={handleFlavorChange}
              enrichedSummary={enrichedData?.summary}
            />
          </div>
        </section>

        {/* Coach Insight Card */}
        <CoachInsightCard 
          enrichedData={enrichedData as any}
          productTitle={product.title}
        />

        <QuickBenefitsStrip 
          productType={product.productType}
          parsedData={parsedData}
          bestForTags={enrichedData?.best_for_tags}
          enrichedDosage={enrichedData?.suggested_use?.dosage}
          enrichedTiming={enrichedData?.suggested_use?.timing}
        />

        <WhatItDoes 
          description={product.description}
          parsedData={parsedData}
          productType={product.productType}
          enrichedBenefits={enrichedData?.key_benefits}
          enrichedSummary={enrichedData?.summary}
          bestForTags={enrichedData?.best_for_tags}
        />

        <HowToTake 
          parsedData={parsedData}
          enrichedSuggestedUse={enrichedData?.suggested_use}
          enrichedCoachTip={enrichedData?.coach_tip}
        />

        <IngredientsLabel 
          parsedData={parsedData}
          product={product}
          enrichedIngredients={enrichedData?.ingredients_detailed}
          enrichedSafety={enrichedData?.safety_warnings as any}
          enrichedQuality={enrichedData?.quality_info as any}
        />

        <QualitySourcing 
          parsedData={parsedData}
          vendor={product.vendor}
          enrichedQuality={enrichedData?.quality_info}
        />

        <SafetyCautions 
          parsedData={parsedData}
          enrichedSafety={enrichedData?.safety_warnings}
        />

        <ScienceSection 
          productTitle={product.title}
          enrichedScience={enrichedData?.science_data}
        />

        <ProductReviews 
          productTitle={product.title}
          productHandle={product.handle}
          enrichedFaq={enrichedData?.faq as any}
          reviewRating={(() => {
            if (!product.reviewRating?.value) return null;
            try {
              const parsed = JSON.parse(product.reviewRating.value);
              return parseFloat(parsed?.value ?? parsed);
            } catch { return parseFloat(product.reviewRating.value); }
          })()}
          reviewCount={product.reviewCount?.value ? parseInt(product.reviewCount.value, 10) : null}
        />

        <BuildYourStack
          products={allProducts}
          currentProductId={product.id}
          onProductClick={handleFlavorChange}
        />

        <PDPFooter />
      </motion.div>

      <MobileStickyCart product={product} selectedVariantIndex={selectedVariantIndex} />
    </>
  );
}

function ProductDetailSkeleton({ onBack, t }: { onBack: () => void; t: (key: string) => string }) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-6 space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft weight="light" className="w-5 h-5" />
        <span className="text-sm font-light">{t('pdp.backToShop')}</span>
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="w-16 h-16 rounded-xl" />))}
          </div>
        </div>
        <div className="space-y-6">
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
