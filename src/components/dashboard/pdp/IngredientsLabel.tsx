import { useState } from 'react';
import { Flask, Warning, MagnifyingGlass } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ParsedProductData } from '@/lib/shopify-parser';
import { ProductDetail } from '@/lib/shopify';
import { useTranslation } from '@/hooks/useTranslation';
import { EnrichedIngredient } from './types';

interface IngredientsLabelProps {
  parsedData: ParsedProductData | null;
  product: ProductDetail;
  enrichedIngredients?: EnrichedIngredient[];
}

export function IngredientsLabel({ parsedData, product, enrichedIngredients }: IngredientsLabelProps) {
  const { t } = useTranslation();
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const hasEnriched = enrichedIngredients && enrichedIngredients.length > 0;

  const ingredients = parsedData?.ingredients || [];
  const certifications = parsedData?.certifications || [];

  const supplementFactsImage = product.images.edges.find(img =>
    img.node.altText?.toLowerCase().includes('supplement') ||
    img.node.altText?.toLowerCase().includes('label') ||
    img.node.altText?.toLowerCase().includes('facts')
  )?.node || product.images.edges[product.images.edges.length - 1]?.node;

  const allergens = detectAllergens(ingredients, product.description, t);

  return (
    <section className="py-12 space-y-8">
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
        {t('pdp.ingredients')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ingredients */}
        <div className="space-y-6">
          {hasEnriched ? (
            <div className="space-y-3">
              {enrichedIngredients.map((ing, index) => (
                <div key={index} className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">{ing.name}</h4>
                    {ing.dosage && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {ing.dosage}
                      </span>
                    )}
                  </div>
                  {ing.role && (
                    <p className="text-xs text-foreground/60 font-light">{ing.role}</p>
                  )}
                  {ing.source && (
                    <p className="text-xs text-foreground/40 font-light mt-1">Source: {ing.source}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-muted/30 border border-border/30 space-y-4">
              <div className="flex items-center gap-2">
                <Flask weight="light" className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">{t('pdp.whatsInside')}</h3>
              </div>
              {ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="outline" className="text-sm font-light py-1.5">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-foreground/50 text-sm font-light">{t('pdp.seeLabel')}</p>
              )}
            </div>
          )}

          {allergens.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <Warning weight="fill" className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium text-foreground">{t('pdp.allergens')}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen, index) => (
                  <Badge key={index} className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-sm font-light">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="text-xs">{cert}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right: Supplement Facts Image */}
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-white border border-border/30 aspect-[3/4]">
            {supplementFactsImage ? (
              <img src={supplementFactsImage.url} alt={t('pdp.supplementFacts')} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground/50">
                  <Flask weight="light" className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">{t('pdp.supplementFacts')}</p>
                </div>
              </div>
            )}
            {supplementFactsImage && (
              <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                <DialogTrigger asChild>
                  <button className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors shadow-lg flex items-center gap-2">
                    <MagnifyingGlass weight="light" className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('pdp.viewFullLabel')}</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full p-0 bg-white">
                  <img src={supplementFactsImage.url} alt={`${t('pdp.supplementFacts')} - Full Size`} className="w-full h-auto" />
                </DialogContent>
              </Dialog>
            )}
          </div>
          <p className="text-xs text-foreground/40 text-center">{t('pdp.seeLabel')}</p>
        </div>
      </div>
    </section>
  );
}

function detectAllergens(ingredients: string[], description: string, t: (key: string) => string): string[] {
  const allergens: string[] = [];
  const text = [...ingredients, description].join(' ').toLowerCase();
  const allergenKeywords = [
    { keyword: 'milk', label: 'Milk' }, { keyword: 'dairy', label: 'Dairy' },
    { keyword: 'whey', label: 'Whey' }, { keyword: 'soy', label: 'Soy' },
    { keyword: 'gluten', label: 'Gluten' }, { keyword: 'egg', label: 'Egg' },
    { keyword: 'fish', label: 'Fish' }, { keyword: 'shellfish', label: 'Shellfish' },
    { keyword: 'peanut', label: 'Peanuts' },
  ];
  for (const { keyword, label } of allergenKeywords) {
    if (text.includes(keyword) && !allergens.includes(label)) allergens.push(label);
  }
  return allergens;
}
