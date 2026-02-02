import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShoppingCartSimple, 
  Check, 
  SpinnerGap, 
  Star,
  FirstAidKit,
  Leaf,
  Flask,
  Info,
  Warning,
  MapPin
} from '@phosphor-icons/react';
import { fetchProductByHandle, ProductDetail, ShopifyProduct } from '@/lib/shopify';
import { parseProductDescription, htmlToText, ParsedProductData } from '@/lib/shopify-parser';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductDetailSectionProps {
  handle: string;
  onBack: () => void;
  recommendedByAI?: boolean;
}

export function ProductDetailSection({ handle, onBack, recommendedByAI = false }: ProductDetailSectionProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedProductData | null>(null);
  
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    loadProduct();
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

  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const images = product.images.edges;
  const selectedImage = images[selectedImageIndex]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;
  const hasMultipleVariants = variants.length > 1;

  const handleAddToCart = async () => {
    if (!selectedVariant || isAdding) return;

    setIsAdding(true);
    try {
      // Create a ShopifyProduct-like object for cart compatibility
      const cartProduct: ShopifyProduct = {
        node: {
          id: product.id,
          title: product.title,
          description: product.description,
          handle: product.handle,
          productType: product.productType,
          vendor: product.vendor,
          priceRange: product.priceRange,
          images: product.images,
          variants: product.variants,
          options: product.options,
        }
      };

      await addItem({
        product: cartProduct,
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity: 1,
        selectedOptions: selectedVariant.selectedOptions || [],
      });
      setJustAdded(true);
      toast.success('Produit ajouté au panier', {
        description: product.title,
        position: 'top-center',
      });
      setTimeout(() => setJustAdded(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeft weight="light" className="w-5 h-5" />
          <span className="text-sm font-light">Retour à la boutique</span>
        </button>
        
        {recommendedByAI && (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Star weight="fill" className="w-3 h-3 mr-1" />
            Recommandé par l'IA
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="glass-card rounded-3xl overflow-hidden aspect-square bg-gradient-to-br from-white/5 to-white/10">
            <AnimatePresence mode="wait">
              {selectedImage && (
                <motion.img
                  key={selectedImage.url}
                  src={selectedImage.url}
                  alt={selectedImage.altText || product.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                />
              )}
            </AnimatePresence>
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={img.node.url}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-primary'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={img.node.url}
                    alt={img.node.altText || ''}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Vendor & Title */}
          <div>
            {product.vendor && (
              <p className="text-sm text-primary font-medium uppercase tracking-wider mb-1">
                {product.vendor}
              </p>
            )}
            <h1 className="text-2xl lg:text-3xl font-light text-foreground">
              {product.title}
            </h1>
            {product.productType && (
              <Badge variant="secondary" className="mt-2">
                {product.productType}
              </Badge>
            )}
          </div>

          {/* Price */}
          <div>
            <span className="text-3xl font-semibold text-foreground">
              {parseFloat(price.amount).toFixed(2)} {price.currencyCode}
            </span>
          </div>

          {/* Variant Selector */}
          {hasMultipleVariants && (
            <div className="space-y-2">
              <p className="text-sm text-foreground/60 font-light">
                Variante : {selectedVariant?.title}
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant, index) => (
                  <button
                    key={variant.node.id}
                    onClick={() => setSelectedVariantIndex(index)}
                    disabled={!variant.node.availableForSale}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      selectedVariantIndex === index
                        ? 'bg-primary text-primary-foreground'
                        : variant.node.availableForSale
                        ? 'bg-white/5 text-foreground/60 hover:bg-white/10 border border-white/10'
                        : 'bg-white/5 text-foreground/30 cursor-not-allowed line-through'
                    }`}
                  >
                    {variant.node.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {selectedVariant && !selectedVariant.availableForSale && (
            <p className="text-destructive text-sm font-light">
              Ce produit est actuellement en rupture de stock
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || !selectedVariant?.availableForSale}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-base font-medium transition-all ${
                justAdded
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isAdding ? (
                <SpinnerGap className="w-5 h-5 animate-spin" />
              ) : justAdded ? (
                <>
                  <Check weight="bold" className="w-5 h-5" />
                  Ajouté au panier
                </>
              ) : (
                <>
                  <ShoppingCartSimple weight="bold" className="w-5 h-5" />
                  Ajouter au panier
                </>
              )}
            </button>
            
            <button
              className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="Ajouter au suivi"
            >
              <FirstAidKit weight="light" className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Certifications */}
          {parsedData && parsedData.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {parsedData.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="text-xs">
                  <Leaf weight="light" className="w-3 h-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs for Details */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start bg-white/5 rounded-2xl p-1 border border-white/10">
          <TabsTrigger value="description" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Description
          </TabsTrigger>
          {parsedData && parsedData.benefits.length > 0 && (
            <TabsTrigger value="benefits" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Bienfaits
            </TabsTrigger>
          )}
          {parsedData && parsedData.ingredients.length > 0 && (
            <TabsTrigger value="ingredients" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Ingrédients
            </TabsTrigger>
          )}
          {parsedData && parsedData.suggestedUse && (
            <TabsTrigger value="usage" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Utilisation
            </TabsTrigger>
          )}
          <TabsTrigger value="info" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Infos
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 glass-card rounded-3xl p-6 border border-white/10">
          <TabsContent value="description" className="mt-0">
            <div 
              className="prose prose-sm max-w-none text-foreground/80 font-light
                prose-headings:text-foreground prose-headings:font-medium
                prose-strong:text-foreground prose-strong:font-medium
                prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
            />
          </TabsContent>

          <TabsContent value="benefits" className="mt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Star weight="fill" className="w-5 h-5" />
                <h3 className="font-medium">Bienfaits principaux</h3>
              </div>
              <ul className="space-y-2">
                {parsedData?.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-foreground/80 font-light">
                    <Check weight="bold" className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Flask weight="light" className="w-5 h-5" />
                <h3 className="font-medium">Composition</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedData?.ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="outline" className="text-sm font-light">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Info weight="light" className="w-5 h-5" />
                <h3 className="font-medium">Conseils d'utilisation</h3>
              </div>
              <p className="text-foreground/80 font-light leading-relaxed">
                {parsedData?.suggestedUse}
              </p>
              
              {parsedData && parsedData.productAmount && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-foreground/60 font-light">
                    <span className="font-medium text-foreground">Contenu : </span>
                    {parsedData.productAmount}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-0">
            <div className="space-y-4">
              {parsedData?.manufacturerCountry && (
                <div className="flex items-center gap-3">
                  <MapPin weight="light" className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-foreground/60">Pays de fabrication</p>
                    <p className="text-foreground font-light">{parsedData.manufacturerCountry}</p>
                  </div>
                </div>
              )}
              
              {product.vendor && (
                <div className="flex items-center gap-3">
                  <Info weight="light" className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-foreground/60">Marque</p>
                    <p className="text-foreground font-light">{product.vendor}</p>
                  </div>
                </div>
              )}

              {parsedData && parsedData.warnings.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <Warning weight="fill" className="w-5 h-5" />
                    <h4 className="font-medium">Précautions</h4>
                  </div>
                  <ul className="space-y-1">
                    {parsedData.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-foreground/70 font-light">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  );
}
