import { useState, useEffect, useMemo, useCallback, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart, Flask, Leaf, ShieldCheck, Flag, Plus, CaretRight } from '@phosphor-icons/react';
import { fetchProductByHandle, fetchProducts, ProductDetail, ShopifyProduct } from '@/lib/shopify';
import { parseProductDescription, ParsedProductData } from '@/lib/shopify-parser';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CartDrawer } from '../CartDrawer';
import { useCartStore } from '@/stores/cartStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useEnrichedProductData } from '@/hooks/useEnrichedProductData';
import { useTranslatedEnrichedData } from '@/hooks/useTranslatedEnrichedData';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

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
import { ResultsTimeline } from './ResultsTimeline';
import { ProductComparator } from './ProductComparator';

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

const reassuranceKeys = [
  { icon: ShieldCheck, key: 'pdp.reassuranceQuality' },
  { icon: Leaf, key: 'pdp.reassuranceVegan' },
  { icon: Flask, key: 'pdp.reassuranceGlutenFree' },
  { icon: Flag, key: 'pdp.reassuranceMadeInFrance' },
];

export const ProductDetailMaster = forwardRef<HTMLDivElement, ProductDetailMasterProps>(function ProductDetailMaster({ 
  handle, onBack, onProductSelect, recommendedByAI = false 
}, ref) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentHandle, setCurrentHandle] = useState(handle);
  const [productCache, setProductCache] = useState<Map<string, CachedProduct>>(new Map());
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isInStack, setIsInStack] = useState<boolean | undefined>(undefined);
  
  const cartItems = useCartStore(state => state.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const currentProduct = productCache.get(currentHandle);
  const product = currentProduct?.product || null;
  const parsedData = currentProduct?.parsedData || null;

  const { enrichedData: rawEnrichedData } = useEnrichedProductData(product?.title || null);
  const { translatedData: enrichedData } = useTranslatedEnrichedData(rawEnrichedData, product?.title || null);
  const { isWishlisted, toggleWishlist } = useWishlist(product?.handle || null);

  // Check if product is in user's supplement stack
  useEffect(() => {
    if (!user || !product) return;
    supabase
      .from('supplement_tracking')
      .select('id')
      .eq('user_id', user.id)
      .eq('active', true)
      .then(({ data }) => {
        if (!data) return;
        const inStack = data.some((s: any) => {
          // Match by shopify product id or product name
          return s.shopify_product_id === product.id;
        });
        setIsInStack(inStack);
      });
  }, [user, product]);

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

  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        const [productData, productsData] = await Promise.all([
          fetchProductByHandle(currentHandle),
          fetchProducts(250)
        ]);
        setAllProducts(productsData);
        if (productData) {
          const parsed = parseProductDescription(
            productData.descriptionHtml, productData.tags,
            { benefits: productData.benefitsMetafield?.value, ingredients: productData.ingredientsMetafield?.value }
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
    if (!productCache.has(currentHandle)) loadInitialData();
  }, [currentHandle]);

  const preloadRelatedProducts = async (
    mainProduct: ProductDetail, products: ShopifyProduct[], existingCache: Map<string, CachedProduct>
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
            benefits: rp.benefitsMetafield?.value, ingredients: rp.ingredientsMetafield?.value,
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

  // Review data
  const reviewRating = useMemo(() => {
    if (!product?.reviewRating?.value) return null;
    try {
      const parsed = JSON.parse(product.reviewRating.value);
      return parseFloat(parsed?.value ?? parsed);
    } catch { return parseFloat(product.reviewRating.value); }
  }, [product]);
  const reviewCount = product?.reviewCount?.value ? parseInt(product.reviewCount.value, 10) : null;

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
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 mb-2">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
              <ArrowLeft weight="light" className="w-5 h-5" />
              <span className="text-sm font-light">{t('pdp.backToShop')}</span>
            </button>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => { toggleWishlist(); toast.success(isWishlisted ? t('pdp.wishlistRemoved') : t('pdp.wishlistAdded')); }}
                whileTap={{ scale: 0.85 }}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <Heart
                  weight={isWishlisted ? 'fill' : 'light'}
                  className={cn('w-5 h-5 transition-colors', isWishlisted ? 'text-red-500' : 'text-foreground/60')}
                />
              </motion.button>
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

        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer text-foreground/40 hover:text-foreground/60 text-xs" onClick={onBack}>
                {t('pdp.breadcrumbShop')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {product.productType && (
              <>
                <BreadcrumbSeparator><CaretRight className="w-3 h-3 text-foreground/20" /></BreadcrumbSeparator>
                <BreadcrumbItem>
                  <span className="text-xs text-foreground/40">{product.productType}</span>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator><CaretRight className="w-3 h-3 text-foreground/20" /></BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs">{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* HERO — 50/50 columns */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          <div className="lg:sticky lg:top-[100px] lg:self-start lg:max-h-[calc(100vh-120px)]">
            <ProductGallery images={images} productTitle={product.title} recommendedByAI={recommendedByAI} tags={product.tags} />
          </div>

          <div className="space-y-6 lg:min-h-[600px]">
            <ProductPurchaseBox 
              product={product}
              parsedData={parsedData}
              relatedProducts={relatedProducts}
              onFlavorChange={handleFlavorChange}
              enrichedSummary={enrichedData?.summary}
              reviewRating={reviewRating}
              reviewCount={reviewCount}
              isInStack={isInStack}
            />

            {/* Reassurance Strip */}
            <div className="flex items-center justify-between gap-3 py-4 border-t border-b border-border/30">
              {reassuranceKeys.map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center flex-1">
                  <item.icon weight="light" className="w-5 h-5 text-foreground/40" />
                  <span className="text-[12px] text-foreground/50 font-light leading-tight">{t(item.key)}</span>
                </div>
              ))}
            </div>

            {/* Accordion Sections */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="what-it-does" className="border-b border-border/30">
                <AccordionTrigger className="py-4 text-[15px] font-semibold text-foreground hover:no-underline [&>svg]:hidden">
                  <span className="flex items-center justify-between w-full pr-2">
                    {t('pdp.accordionWhatItDoes')}
                    <Plus weight="light" className="w-4 h-4 text-foreground/40 transition-transform duration-200 [[data-state=open]_&]:rotate-45" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <WhatItDoes 
                    description={product.description}
                    parsedData={parsedData}
                    productType={product.productType}
                    enrichedBenefits={enrichedData?.key_benefits}
                    enrichedSummary={enrichedData?.summary}
                    bestForTags={enrichedData?.best_for_tags}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="results-timeline" className="border-b border-border/30">
                <AccordionTrigger className="py-4 text-[15px] font-semibold text-foreground hover:no-underline [&>svg]:hidden">
                  <span className="flex items-center justify-between w-full pr-2">
                    {t('pdp.accordionExpect')}
                    <Plus weight="light" className="w-4 h-4 text-foreground/40 transition-transform duration-200 [[data-state=open]_&]:rotate-45" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <ResultsTimeline enrichedData={enrichedData as any} productType={product.productType} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-to-take" className="border-b border-border/30">
                <AccordionTrigger className="py-4 text-[15px] font-semibold text-foreground hover:no-underline [&>svg]:hidden">
                  <span className="flex items-center justify-between w-full pr-2">
                    {t('pdp.howToTake')}
                    <Plus weight="light" className="w-4 h-4 text-foreground/40 transition-transform duration-200 [[data-state=open]_&]:rotate-45" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <HowToTake 
                    parsedData={parsedData}
                    enrichedSuggestedUse={enrichedData?.suggested_use}
                    enrichedCoachTip={enrichedData?.coach_tip}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ingredients" className="border-b border-border/30">
                <AccordionTrigger className="py-4 text-[15px] font-semibold text-foreground hover:no-underline [&>svg]:hidden">
                  <span className="flex items-center justify-between w-full pr-2">
                    {t('pdp.accordionIngredients')}
                    <Plus weight="light" className="w-4 h-4 text-foreground/40 transition-transform duration-200 [[data-state=open]_&]:rotate-45" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <IngredientsLabel 
                    parsedData={parsedData}
                    product={product}
                    enrichedIngredients={enrichedData?.ingredients_detailed}
                    enrichedSafety={enrichedData?.safety_warnings as any}
                    enrichedQuality={enrichedData?.quality_info as any}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="science" className="border-b border-border/30">
                <AccordionTrigger className="py-4 text-[15px] font-semibold text-foreground hover:no-underline [&>svg]:hidden">
                  <span className="flex items-center justify-between w-full pr-2">
                    {t('pdp.accordionScience')}
                    <Plus weight="light" className="w-4 h-4 text-foreground/40 transition-transform duration-200 [[data-state=open]_&]:rotate-45" />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <ScienceSection 
                    productTitle={product.title}
                    enrichedScience={enrichedData?.science_data}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <CoachInsightCard 
              enrichedData={enrichedData as any}
              productTitle={product.title}
            />
          </div>
        </section>

        {/* Full-width below-the-fold */}
        <QuickBenefitsStrip 
          productType={product.productType}
          parsedData={parsedData}
          bestForTags={enrichedData?.best_for_tags}
          enrichedDosage={enrichedData?.suggested_use?.dosage}
          enrichedTiming={enrichedData?.suggested_use?.timing}
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

        <div id="product-reviews">
          <ProductReviews 
            productTitle={product.title}
            productHandle={product.handle}
            enrichedFaq={enrichedData?.faq as any}
            reviewRating={reviewRating}
            reviewCount={reviewCount}
          />
        </div>




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
});

function ProductDetailSkeleton({ onBack, t }: { onBack: () => void; t: (key: string) => string }) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-6 space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
        <ArrowLeft weight="light" className="w-5 h-5" />
        <span className="text-sm font-light">{t('pdp.backToShop')}</span>
      </button>

      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-32 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery skeleton */}
        <div>
          <Skeleton className="aspect-square rounded-[20px]" />
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-xl" />
            ))}
          </div>
          {/* Mobile dots skeleton */}
          <div className="flex justify-center gap-1.5 mt-3 lg:hidden">
            {[1, 2, 3].map(i => <Skeleton key={i} className="w-2 h-2 rounded-full" />)}
          </div>
        </div>

        {/* Purchase box skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          {/* Stars */}
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="w-4 h-4 rounded-full" />)}
            <Skeleton className="h-4 w-20 ml-2" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          {/* Purchase mode skeleton */}
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-8 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          {/* Delivery estimate */}
          <Skeleton className="h-4 w-48 mx-auto" />
          {/* Accordion skeletons */}
          {[1,2,3,4].map(i => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
