import { Target, Package, Flask, Clock } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';

interface QuickBenefitsStripProps {
  productType: string;
  parsedData: ParsedProductData | null;
}

export function QuickBenefitsStrip({ productType, parsedData }: QuickBenefitsStripProps) {
  // Derive quick benefits from parsed data
  const goal = deriveGoal(productType, parsedData);
  const format = deriveFormat(productType, parsedData?.productAmount);
  const keyIngredient = deriveKeyIngredient(parsedData?.ingredients);
  const bestTime = deriveBestTime(parsedData?.suggestedUse);

  const items = [
    { icon: Target, label: 'Objectif', value: goal },
    { icon: Package, label: 'Format', value: format },
    { icon: Flask, label: 'Ingrédient clé', value: keyIngredient },
    { icon: Clock, label: 'Quand', value: bestTime },
  ].filter(item => item.value);

  if (items.length === 0) return null;

  return (
    <section className="py-4">
      <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-muted/30 border border-border/30"
          >
            <item.icon weight="light" className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-foreground/50 font-light">{item.label}</p>
              <p className="text-sm text-foreground font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function deriveGoal(productType: string, parsedData: ParsedProductData | null): string {
  const type = productType?.toLowerCase() || '';
  
  if (type.includes('protein') || type.includes('protéine')) return 'Strength';
  if (type.includes('sleep') || type.includes('sommeil') || type.includes('melatonin')) return 'Sleep';
  if (type.includes('focus') || type.includes('brain') || type.includes('cognitive')) return 'Focus';
  if (type.includes('stress') || type.includes('relax') || type.includes('calm')) return 'Stress Relief';
  if (type.includes('gut') || type.includes('digestive') || type.includes('probiotic')) return 'Gut Health';
  if (type.includes('energy') || type.includes('vitality')) return 'Energy';
  if (type.includes('immune') || type.includes('immunity')) return 'Immunity';
  if (type.includes('bone') || type.includes('joint')) return 'Bone & Joint';
  
  // Try to infer from benefits
  if (parsedData?.benefits?.length) {
    const benefitText = parsedData.benefits[0].toLowerCase();
    if (benefitText.includes('muscle') || benefitText.includes('strength')) return 'Strength';
    if (benefitText.includes('sleep') || benefitText.includes('rest')) return 'Sleep';
    if (benefitText.includes('energy')) return 'Energy';
    if (benefitText.includes('focus') || benefitText.includes('concentration')) return 'Focus';
  }
  
  return 'Wellness';
}

function deriveFormat(productType: string, productAmount: string | null | undefined): string {
  const amount = productAmount?.toLowerCase() || '';
  const type = productType?.toLowerCase() || '';
  
  if (amount.includes('capsule') || type.includes('capsule')) return 'Capsules';
  if (amount.includes('softgel')) return 'Softgels';
  if (amount.includes('tablet') || type.includes('tablet')) return 'Tablets';
  if (amount.includes('gumm') || type.includes('gumm')) return 'Gummies';
  if (amount.includes('powder') || type.includes('powder') || amount.includes('g)')) return 'Powder';
  if (amount.includes('liquid') || amount.includes('ml')) return 'Liquid';
  
  return 'Supplement';
}

function deriveKeyIngredient(ingredients: string[] | undefined): string {
  if (!ingredients?.length) return '';
  
  // Return first 1-2 key ingredients
  const key = ingredients.slice(0, 2).join(' + ');
  return key.length > 30 ? ingredients[0] : key;
}

function deriveBestTime(suggestedUse: string | undefined): string {
  if (!suggestedUse) return '';
  
  const use = suggestedUse.toLowerCase();
  
  if (use.includes('morning') || use.includes('matin') || use.includes('breakfast')) return 'AM';
  if (use.includes('evening') || use.includes('soir') || use.includes('night') || use.includes('before bed') || use.includes('bedtime')) return 'PM';
  if (use.includes('pre-workout') || use.includes('before workout') || use.includes('avant l\'entraînement')) return 'Pre-workout';
  if (use.includes('post-workout') || use.includes('after workout') || use.includes('après l\'entraînement')) return 'Post-workout';
  if (use.includes('with meal') || use.includes('avec repas')) return 'With meal';
  if (use.includes('empty stomach') || use.includes('estomac vide')) return 'Empty stomach';
  
  return 'Anytime';
}
