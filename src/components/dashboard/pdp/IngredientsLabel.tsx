import { useState } from 'react';
import { Flask, Warning, MagnifyingGlass, Copy, Check } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParsedProductData } from '@/lib/shopify-parser';
import { ProductDetail } from '@/lib/shopify';
import { useTranslation } from '@/hooks/useTranslation';
import { EnrichedIngredient, EnrichedSafetyWarnings, EnrichedQualityInfo } from './types';
import { toast } from 'sonner';

interface IngredientsLabelProps {
  parsedData: ParsedProductData | null;
  product: ProductDetail;
  enrichedIngredients?: EnrichedIngredient[];
  enrichedSafety?: EnrichedSafetyWarnings;
  enrichedQuality?: EnrichedQualityInfo;
}

export function IngredientsLabel({ parsedData, product, enrichedIngredients, enrichedSafety, enrichedQuality }: IngredientsLabelProps) {
  const { t } = useTranslation();
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasEnriched = enrichedIngredients && enrichedIngredients.length > 0;

  const ingredients = parsedData?.ingredients || [];
  const certifications = parsedData?.certifications || [];
  const allergens = enrichedSafety?.allergens?.length 
    ? enrichedSafety.allergens 
    : detectAllergens(ingredients, product.description, t);

  const supplementFactsImage = (() => {
    const images = product.images.edges;
    if (!images.length) return null;
    
    // Priority 1: Keywords in alt text (most reliable when set)
    const altKeywords = ['supplement', 'facts', 'label', 'nutrition', 'ingredients'];
    const byAlt = images.find(img => {
      const alt = (img.node.altText || '').toLowerCase();
      return altKeywords.some(k => alt.includes(k));
    });
    if (byAlt) return byAlt.node;
    
    // Priority 2: Specific supplement facts URL patterns (not generic "generated-label")
    const specificUrlPatterns = ['supplement-facts', 'nutrition-facts', 'supp-facts'];
    const bySpecificUrl = images.find(img => {
      const url = img.node.url.toLowerCase();
      return specificUrlPatterns.some(k => url.includes(k));
    });
    if (bySpecificUrl) return bySpecificUrl.node;
    
    // Priority 3: Non-generated-label URLs with back/rear keywords
    const byBack = images.find(img => {
      const url = img.node.url.toLowerCase();
      const filename = url.split('/').pop() || '';
      // Only match if the filename itself (not the path) contains these keywords
      // and is NOT a generic "generated-label-image-N" pattern
      if (filename.includes('generated-label-image')) return false;
      return ['back', 'rear', 'facts', 'nutrition', 'label'].some(k => filename.includes(k));
    });
    if (byBack) return byBack.node;
    
    // Priority 4: Last image (VitaSync catalogue convention: supplement facts is the last image)
    if (images.length >= 2) return images[images.length - 1].node;
    
    return null;
  })();

  const handleCopyServing = () => {
    const servingInfo = hasEnriched 
      ? enrichedIngredients.map(i => `${i.name}: ${i.dosage || 'N/A'}`).join('\n')
      : ingredients.join(', ');
    navigator.clipboard.writeText(servingInfo);
    setCopied(true);
    toast.success('Serving info copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
          {t('pdp.ingredients')}
        </h2>
        <button
          onClick={handleCopyServing}
          className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground/70 transition-colors"
        >
          {copied ? <Check weight="bold" className="w-3.5 h-3.5 text-green-500" /> : <Copy weight="light" className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy serving info'}
        </button>
      </div>

      <Tabs defaultValue="facts" className="w-full">
        <TabsList className="bg-[#F1F5F9] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30 rounded-xl p-1 w-full flex">
          <TabsTrigger value="facts" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Supplement Facts</TabsTrigger>
          <TabsTrigger value="ingredients" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Ingredients</TabsTrigger>
          <TabsTrigger value="allergens" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Allergens</TabsTrigger>
          <TabsTrigger value="storage" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Storage</TabsTrigger>
        </TabsList>

        {/* Supplement Facts Tab */}
        <TabsContent value="facts" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Facts Table */}
            {hasEnriched ? (
              <div className="rounded-xl border border-[#E2E8F0] dark:border-border/30 overflow-hidden">
                <div className="bg-[#F8FAFC] dark:bg-muted/20 px-4 py-3 border-b border-[#E2E8F0] dark:border-border/30">
                  <h4 className="text-sm font-semibold text-foreground">Supplement Facts</h4>
                </div>
                {enrichedIngredients.map((ing, index) => (
                  <div key={index} className={`flex items-center justify-between px-4 py-2.5 text-sm ${index % 2 === 0 ? 'bg-[#F8FAFC] dark:bg-muted/10' : 'bg-background'}`}>
                    <span className="text-foreground/80 font-light">{ing.name}</span>
                    <span className="text-foreground font-medium text-right">{ing.dosage || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Flask weight="light" className="w-5 h-5 text-primary" />
                  <h3 className="font-medium text-foreground">{t('pdp.whatsInside')}</h3>
                </div>
                {ingredients.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="outline" className="text-sm font-light py-1.5">{ingredient}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/50 text-sm font-light">{t('pdp.seeLabel')}</p>
                )}
              </div>
            )}

            {/* Supplement Facts Image */}
            <div className="relative rounded-xl overflow-hidden bg-white dark:bg-muted/10 border border-[#E2E8F0] dark:border-border/30 aspect-[3/4]">
              {supplementFactsImage ? (
                <>
                  <img src={supplementFactsImage.url} alt={t('pdp.supplementFacts')} className="w-full h-full object-contain p-4" />
                  <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                    <DialogTrigger asChild>
                      <button className="absolute bottom-4 right-4 px-3 py-2 rounded-xl bg-background/90 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors shadow-lg flex items-center gap-2">
                        <MagnifyingGlass weight="light" className="w-4 h-4" />
                        <span className="text-xs font-medium">{t('pdp.viewFullLabel')}</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full p-0 bg-white">
                      <img src={supplementFactsImage.url} alt={`${t('pdp.supplementFacts')} - Full`} className="w-full h-auto" />
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                  <Flask weight="light" className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Ingredients Tab */}
        <TabsContent value="ingredients" className="mt-4">
          {hasEnriched ? (
            <div className="space-y-3">
              {enrichedIngredients.map((ing, index) => (
                <div key={index} className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30">
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">{ing.name}</h4>
                    {ing.dosage && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{ing.dosage}</span>
                    )}
                  </div>
                  {ing.role && <p className="text-xs text-foreground/60 font-light">{ing.role}</p>}
                  {ing.source && <p className="text-xs text-foreground/40 font-light mt-1">Source: {ing.source}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-4">
              {ingredients.map((ingredient, index) => (
                <Badge key={index} variant="outline" className="text-sm font-light py-1.5">{ingredient}</Badge>
              ))}
              {ingredients.length === 0 && <p className="text-foreground/50 text-sm font-light">{t('pdp.seeLabel')}</p>}
            </div>
          )}
        </TabsContent>

        {/* Allergens Tab */}
        <TabsContent value="allergens" className="mt-4 space-y-4">
          {allergens.length > 0 ? (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <Warning weight="fill" className="w-5 h-5 text-amber-500" />
                <h3 className="font-medium text-foreground">{t('pdp.allergens')}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen, index) => (
                  <Badge key={index} className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-sm font-light">{allergen}</Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-foreground/60 text-sm font-light p-4">No known allergens listed for this product.</p>
          )}
          {certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4">
              {certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="text-xs">{cert}</Badge>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="mt-4">
          <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30 space-y-3">
            <h4 className="text-sm font-medium text-foreground">Storage Conditions</h4>
            <ul className="space-y-2 text-sm text-foreground/70 font-light">
              <li>• Store in a cool, dry place away from direct sunlight</li>
              <li>• Keep container tightly closed</li>
              <li>• Keep out of reach of children</li>
              {enrichedQuality?.manufacturing && (
                <li>• {enrichedQuality.manufacturing}</li>
              )}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
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
