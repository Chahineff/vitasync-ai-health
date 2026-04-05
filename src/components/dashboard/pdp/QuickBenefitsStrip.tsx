import { Target, Package, Flask, Clock } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';
import { useTranslation } from '@/hooks/useTranslation';

interface QuickBenefitsStripProps {
  productType: string;
  parsedData: ParsedProductData | null;
  bestForTags?: string[];
  enrichedDosage?: string;
  enrichedTiming?: string;
}

export function QuickBenefitsStrip({ productType, parsedData, bestForTags, enrichedDosage, enrichedTiming }: QuickBenefitsStripProps) {
  const { t } = useTranslation();

  const goal = bestForTags?.[0] || deriveGoal(productType, parsedData, t);
  const format = deriveFormat(productType, parsedData?.productAmount, t);
  const keyIngredient = deriveKeyIngredient(parsedData?.ingredients);
  const bestTime = enrichedTiming || deriveBestTime(parsedData?.suggestedUse, t);

  const items = [
    { icon: Target, label: t('pdp.goalLabel'), value: goal },
    { icon: Package, label: t('pdp.formatLabel'), value: format },
    { icon: Flask, label: t('pdp.keyIngredient'), value: keyIngredient },
    { icon: Clock, label: t('pdp.whenLabel'), value: bestTime },
  ].filter(item => item.value);

  if (items.length === 0) return null;

  return (
    <section className="py-4">
      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#F1F5F9] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30">
            <item.icon weight="light" className="w-4 h-4 text-primary" />
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-foreground/50 font-light">{item.label}:</p>
              <p className="text-xs text-foreground font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function deriveGoal(productType: string, parsedData: ParsedProductData | null, t: (key: string) => string): string {
  const type = productType?.toLowerCase() || '';
  if (type.includes('protein')) return t('pdp.goalStrength');
  if (type.includes('sleep') || type.includes('melatonin')) return t('pdp.goalSleep');
  if (type.includes('focus') || type.includes('brain')) return t('pdp.goalFocus');
  if (type.includes('stress') || type.includes('relax')) return t('pdp.goalStressRelief');
  if (type.includes('energy')) return t('pdp.goalEnergy');
  if (type.includes('immune')) return t('pdp.goalImmunity');
  if (parsedData?.benefits?.length) {
    const b = parsedData.benefits[0].toLowerCase();
    if (b.includes('muscle')) return t('pdp.goalStrength');
    if (b.includes('sleep')) return t('pdp.goalSleep');
    if (b.includes('energy')) return t('pdp.goalEnergy');
  }
  return t('pdp.goalWellness');
}

function deriveFormat(productType: string, productAmount: string | null | undefined, t: (key: string) => string): string {
  const amount = productAmount?.toLowerCase() || '';
  const type = productType?.toLowerCase() || '';
  if (amount.includes('capsule') || type.includes('capsule')) return t('pdp.formatCapsules');
  if (amount.includes('softgel')) return t('pdp.formatSoftgels');
  if (amount.includes('tablet')) return t('pdp.formatTablets');
  if (amount.includes('gumm') || type.includes('gumm')) return t('pdp.formatGummies');
  if (amount.includes('powder') || type.includes('powder')) return t('pdp.formatPowder');
  if (amount.includes('liquid') || amount.includes('ml')) return t('pdp.formatLiquid');
  return t('pdp.formatSupplement');
}

function deriveKeyIngredient(ingredients: string[] | undefined): string {
  if (!ingredients?.length) return '';
  const key = ingredients.slice(0, 2).join(' + ');
  return key.length > 30 ? ingredients[0] : key;
}

function deriveBestTime(suggestedUse: string | undefined, t: (key: string) => string): string {
  if (!suggestedUse) return '';
  const use = suggestedUse.toLowerCase();
  if (use.includes('morning') || use.includes('matin')) return t('pdp.bestTimeAM');
  if (use.includes('evening') || use.includes('soir') || use.includes('before bed')) return t('pdp.bestTimePM');
  if (use.includes('pre-workout')) return t('pdp.bestTimePreWorkout');
  if (use.includes('post-workout')) return t('pdp.bestTimePostWorkout');
  if (use.includes('with meal')) return t('pdp.bestTimeWithMeal');
  return t('pdp.bestTimeAnytime');
}
