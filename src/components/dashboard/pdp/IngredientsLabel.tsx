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
    : detectAllergens(ingredients, product.description);

  const supplementFactsImage = (() => {
    const images = product.images.edges;
    if (!images.length) return null;
    const altKeywords = ['supplement', 'facts', 'label', 'nutrition', 'ingredients'];
    const byAlt = images.find(img => {
      const alt = (img.node.altText || '').toLowerCase();
      return altKeywords.some(k => alt.includes(k));
    });
    if (byAlt) return byAlt.node;
    const specificUrlPatterns = ['supplement-facts', 'nutrition-facts', 'supp-facts'];
    const bySpecificUrl = images.find(img => {
      const url = img.node.url.toLowerCase();
      return specificUrlPatterns.some(k => url.includes(k));
    });
    if (bySpecificUrl) return bySpecificUrl.node;
    const byBack = images.find(img => {
      const url = img.node.url.toLowerCase();
      const filename = url.split('/').pop() || '';
      if (filename.includes('generated-label-image')) return false;
      return ['back', 'rear', 'facts', 'nutrition', 'label'].some(k => filename.includes(k));
    });
    if (byBack) return byBack.node;
    if (images.length >= 2) return images[images.length - 1].node;
    return null;
  })();

  const handleCopyServing = () => {
    const servingInfo = hasEnriched 
      ? enrichedIngredients.map(i => `${i.name}: ${i.dosage || 'N/A'}`).join('\n')
      : ingredients.join(', ');
    navigator.clipboard.writeText(servingInfo);
    setCopied(true);
    toast.success(t('pdp.servingInfoCopied'));
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
          {copied ? t('pdp.copied') : t('pdp.copyServingInfo')}
        </button>
      </div>

      <Tabs defaultValue="facts" className="w-full">
        <TabsList className="bg-[#F1F5F9] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30 rounded-xl p-1 w-full flex">
          <TabsTrigger value="facts" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('pdp.supplementFactsTab')}</TabsTrigger>
          <TabsTrigger value="ingredients" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('pdp.ingredientsTab')}</TabsTrigger>
          <TabsTrigger value="allergens" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('pdp.allergensTab')}</TabsTrigger>
          <TabsTrigger value="storage" className="flex-1 rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">{t('pdp.storageTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="facts" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasEnriched ? (
              <div className="rounded-xl border border-[#E2E8F0] dark:border-border/30 overflow-hidden">
                <div className="bg-[#F8FAFC] dark:bg-muted/20 px-4 py-3 border-b border-[#E2E8F0] dark:border-border/30">
                  <h4 className="text-sm font-semibold text-foreground">{t('pdp.supplementFactsTab')}</h4>
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
                  {ing.source && <p className="text-xs text-foreground/40 font-light mt-1">{t('pdp.sourceLabel')}: {ing.source}</p>}
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
            <p className="text-foreground/60 text-sm font-light p-4">{t('pdp.noAllergens')}</p>
          )}
          {certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4">
              {certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="text-xs">{cert}</Badge>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="storage" className="mt-4">
          <div className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30 space-y-3">
            <h4 className="text-sm font-medium text-foreground">{t('pdp.storageTitle')}</h4>
            <ul className="space-y-2 text-sm text-foreground/70 font-light">
              <li>• {t('pdp.storageTip1')}</li>
              <li>• {t('pdp.storageTip2')}</li>
              <li>• {t('pdp.storageTip3')}</li>
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

function detectAllergens(ingredients: string[], description: string): string[] {
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