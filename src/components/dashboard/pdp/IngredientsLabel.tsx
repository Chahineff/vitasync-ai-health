import { useState } from 'react';
import { Flask, Warning, MagnifyingGlass, X } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ParsedProductData } from '@/lib/shopify-parser';
import { ProductDetail } from '@/lib/shopify';

interface IngredientsLabelProps {
  parsedData: ParsedProductData | null;
  product: ProductDetail;
}

export function IngredientsLabel({ parsedData, product }: IngredientsLabelProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  
  const ingredients = parsedData?.ingredients || [];
  const certifications = parsedData?.certifications || [];
  
  // Find supplement facts image (usually labeled or at specific position)
  const supplementFactsImage = product.images.edges.find(img => 
    img.node.altText?.toLowerCase().includes('supplement') ||
    img.node.altText?.toLowerCase().includes('label') ||
    img.node.altText?.toLowerCase().includes('facts') ||
    img.node.altText?.toLowerCase().includes('nutrition')
  )?.node || product.images.edges[product.images.edges.length - 1]?.node;

  // Allergens detection
  const allergens = detectAllergens(ingredients, product.description);

  return (
    <section className="py-8 space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        Ingredients & Label
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ingredients List */}
        <div className="space-y-6">
          {/* What's Inside */}
          <div className="p-5 rounded-2xl bg-muted/30 border border-border/30 space-y-4">
            <div className="flex items-center gap-2">
              <Flask weight="light" className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">What's Inside</h3>
            </div>
            
            {ingredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-sm font-light py-1.5"
                  >
                    {ingredient}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-foreground/50 text-sm font-light">
                Voir le label pour la liste complète
              </p>
            )}
          </div>

          {/* Allergens */}
          {allergens.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <Warning weight="fill" className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium text-foreground">Allergènes</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen, index) => (
                  <Badge 
                    key={index} 
                    className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-sm font-light"
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-xs"
                >
                  {cert}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right: Supplement Facts Image */}
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-white border border-border/30 aspect-[3/4]">
            {supplementFactsImage ? (
              <img
                src={supplementFactsImage.url}
                alt="Supplement Facts"
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground/50">
                  <Flask weight="light" className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Supplement Facts</p>
                  <p className="text-xs">(Image slot)</p>
                </div>
              </div>
            )}

            {/* Zoom Button */}
            {supplementFactsImage && (
              <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                <DialogTrigger asChild>
                  <button className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors shadow-lg flex items-center gap-2">
                    <MagnifyingGlass weight="light" className="w-4 h-4" />
                    <span className="text-sm font-medium">View Full Label</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0 bg-white">
                  <div className="relative">
                    <img
                      src={supplementFactsImage.url}
                      alt="Supplement Facts - Full Size"
                      className="w-full h-auto"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <p className="text-xs text-foreground/40 text-center">
            See full label for complete nutritional information
          </p>
        </div>
      </div>
    </section>
  );
}

function detectAllergens(ingredients: string[], description: string): string[] {
  const allergens: string[] = [];
  const text = [...ingredients, description].join(' ').toLowerCase();
  
  const allergenKeywords = [
    { keyword: 'milk', label: 'Lait' },
    { keyword: 'dairy', label: 'Produits laitiers' },
    { keyword: 'whey', label: 'Lactosérum' },
    { keyword: 'casein', label: 'Caséine' },
    { keyword: 'soy', label: 'Soja' },
    { keyword: 'gluten', label: 'Gluten' },
    { keyword: 'wheat', label: 'Blé' },
    { keyword: 'egg', label: 'Œuf' },
    { keyword: 'fish', label: 'Poisson' },
    { keyword: 'shellfish', label: 'Crustacés' },
    { keyword: 'tree nut', label: 'Fruits à coque' },
    { keyword: 'peanut', label: 'Arachides' },
    { keyword: 'sesame', label: 'Sésame' },
  ];
  
  for (const { keyword, label } of allergenKeywords) {
    if (text.includes(keyword) && !allergens.includes(label)) {
      allergens.push(label);
    }
  }
  
  return allergens;
}
