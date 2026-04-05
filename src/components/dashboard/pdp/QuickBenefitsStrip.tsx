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

  const goal = bestForTags?.[0] || deriveGoal(productType, parsedData);
  const format = deriveFormat(productType, parsedData?.productAmount);
  const keyIngredient = deriveKeyIngredient(parsedData?.ingredients);
  const bestTime = enrichedTiming || deriveBestTime(parsedData?.suggestedUse);

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

function deriveGoal(productType: string, parsedData: ParsedProductData | null): string {
  const type = productType?.toLowerCase() || '';
  if (type.includes('protein')) return 'Strength';
  if (type.includes('sleep') || type.includes('melatonin')) return 'Sleep';
  if (type.includes('focus') || type.includes('brain')) return 'Focus';
  if (type.includes('stress') || type.includes('relax')) return 'Stress Relief';
  if (type.includes('energy')) return 'Energy';
  if (type.includes('immune')) return 'Immunity';
  if (parsedData?.benefits?.length) {
    const b = parsedData.benefits[0].toLowerCase();
    if (b.includes('muscle')) return 'Strength';
    if (b.includes('sleep')) return 'Sleep';
    if (b.includes('energy')) return 'Energy';
  }
  return 'Wellness';
}

function deriveFormat(productType: string, productAmount: string | null | undefined): string {
  const amount = productAmount?.toLowerCase() || '';
  const type = productType?.toLowerCase() || '';
  if (amount.includes('capsule') || type.includes('capsule')) return 'Capsules';
  if (amount.includes('softgel')) return 'Softgels';
  if (amount.includes('tablet')) return 'Tablets';
  if (amount.includes('gumm') || type.includes('gumm')) return 'Gummies';
  if (amount.includes('powder') || type.includes('powder')) return 'Powder';
  if (amount.includes('liquid') || amount.includes('ml')) return 'Liquid';
  return 'Supplement';
}

function deriveKeyIngredient(ingredients: string[] | undefined): string {
  if (!ingredients?.length) return '';
  const key = ingredients.slice(0, 2).join(' + ');
  return key.length > 30 ? ingredients[0] : key;
}

function deriveBestTime(suggestedUse: string | undefined): string {
  if (!suggestedUse) return '';
  const use = suggestedUse.toLowerCase();
  if (use.includes('morning') || use.includes('matin')) return 'AM';
  if (use.includes('evening') || use.includes('soir') || use.includes('before bed')) return 'PM';
  if (use.includes('pre-workout')) return 'Pre-workout';
  if (use.includes('post-workout')) return 'Post-workout';
  if (use.includes('with meal')) return 'With meal';
  return 'Anytime';
}