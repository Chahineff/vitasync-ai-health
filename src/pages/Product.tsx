import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCartSimple, Check, SpinnerGap, Plus, Star, Package, Leaf, Flask } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProductByHandle, ProductDetail } from '@/lib/shopify';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function Product() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToTracking, setIsAddingToTracking] = useState(false);
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (!handle) return;

    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await fetchProductByHandle(handle);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [handle]);

  if (loading) {
    return <ProductSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Produit introuvable</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const images = product.images.edges;
  const selectedImage = images[selectedImageIndex]?.node;
  const price = selectedVariant?.price || product.priceRange.minVariantPrice;

  const handleAddToCart = async () => {
    if (!selectedVariant || isAddingToCart) return;

    setIsAddingToCart(true);
    try {
      await addItem({
        product: { node: product as unknown as ProductDetail & { node: ProductDetail }['node'] } as never,
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
        price: selectedVariant.price,
        quantity: 1,
        selectedOptions: selectedVariant.selectedOptions || [],
      });
      setJustAddedToCart(true);
      toast.success('Produit ajouté au panier', {
        description: product.title,
        position: 'top-center',
      });
      setTimeout(() => setJustAddedToCart(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToTracking = async () => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter au suivi');
      return;
    }

    setIsAddingToTracking(true);
    try {
      const { error } = await supabase
        .from('supplement_tracking')
        .insert({
          user_id: user.id,
          product_name: product.title,
          shopify_product_id: product.id,
          dosage: '1 par jour',
          time_of_day: 'morning',
          active: true,
        });

      if (error) throw error;

      toast.success('Ajouté à votre suivi', {
        description: product.title,
        position: 'top-center',
      });
    } catch (error) {
      console.error('Error adding to tracking:', error);
      toast.error("Erreur lors de l'ajout au suivi");
    } finally {
      setIsAddingToTracking(false);
    }
  };

  // Parse benefits from tags or metafield
  const benefits = product.benefitsMetafield?.value 
    ? JSON.parse(product.benefitsMetafield.value) 
    : product.tags?.filter(tag => !tag.startsWith('_')) || [];

  // Parse ingredients from metafield
  const ingredients = product.ingredientsMetafield?.value 
    ? JSON.parse(product.ingredientsMetafield.value) 
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-medium truncate">{product.title}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
              <AnimatePresence mode="wait">
                {selectedImage && (
                  <motion.img
                    key={selectedImageIndex}
                    src={selectedImage.url}
                    alt={selectedImage.altText || product.title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
              
              {/* AI Recommended Badge */}
              {product.tags?.includes('ai-recommended') && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-sm font-medium">
                  <Star weight="fill" className="w-4 h-4" />
                  Recommandé par l'IA
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={image.node.url}
                      alt={image.node.altText || `Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Vendor */}
            <div>
              {product.vendor && (
                <p className="text-sm text-primary font-medium mb-1">{product.vendor}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.title}</h1>
              {product.productType && (
                <Badge variant="secondary" className="mt-2">
                  {product.productType}
                </Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {parseFloat(price.amount).toFixed(2)}
              </span>
              <span className="text-lg text-foreground/60">{price.currencyCode}</span>
            </div>

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground/80">Variante</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant, index) => (
                    <button
                      key={variant.node.id}
                      onClick={() => setSelectedVariantIndex(index)}
                      disabled={!variant.node.availableForSale}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedVariantIndex === index
                          ? 'bg-primary text-primary-foreground'
                          : variant.node.availableForSale
                          ? 'bg-white/5 text-foreground/80 hover:bg-white/10'
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
            {!selectedVariant?.availableForSale && (
              <p className="text-destructive font-medium">Rupture de stock</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedVariant?.availableForSale}
                className={`flex-1 ${justAddedToCart ? 'bg-green-500 hover:bg-green-500' : ''}`}
              >
                {isAddingToCart ? (
                  <SpinnerGap className="w-5 h-5 animate-spin" />
                ) : justAddedToCart ? (
                  <>
                    <Check weight="bold" className="w-5 h-5 mr-2" />
                    Ajouté
                  </>
                ) : (
                  <>
                    <ShoppingCartSimple weight="bold" className="w-5 h-5 mr-2" />
                    Ajouter au panier
                  </>
                )}
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={handleAddToTracking}
                disabled={isAddingToTracking}
              >
                {isAddingToTracking ? (
                  <SpinnerGap className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus weight="bold" className="w-5 h-5 mr-2" />
                    Suivi
                  </>
                )}
              </Button>
            </div>

            {/* Tabs: Description / Benefits / Ingredients */}
            <Tabs defaultValue="description" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description" className="flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  Description
                </TabsTrigger>
                <TabsTrigger value="benefits" className="flex items-center gap-1.5">
                  <Leaf className="w-4 h-4" />
                  Bienfaits
                </TabsTrigger>
                <TabsTrigger value="ingredients" className="flex items-center gap-1.5">
                  <Flask className="w-4 h-4" />
                  Ingrédients
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.descriptionHtml || product.description) }}
                />
              </TabsContent>

              <TabsContent value="benefits" className="mt-4">
                {benefits.length > 0 ? (
                  <ul className="space-y-3">
                    {benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check weight="bold" className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-foreground/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-foreground/60">Aucun bienfait spécifié pour ce produit.</p>
                )}
              </TabsContent>

              <TabsContent value="ingredients" className="mt-4">
                {ingredients ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {typeof ingredients === 'string' ? (
                      <p>{ingredients}</p>
                    ) : (
                      <ul className="space-y-2">
                        {ingredients.map((ingredient: string, index: number) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <p className="text-foreground/60">
                    Consultez l'étiquette du produit pour la liste complète des ingrédients.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="w-16 h-16 rounded-lg" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-10 w-24 rounded-xl" />
              ))}
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
