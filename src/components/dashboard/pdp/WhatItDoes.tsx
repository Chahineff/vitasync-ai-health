import { Star, Sparkle, Heart, Brain, Lightning, Shield, Moon, Leaf, Flame, Drop, Bone, Eye } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';
import { EnrichedKeyBenefit } from './types';
import { useTranslation } from '@/hooks/useTranslation';

interface WhatItDoesProps {
  description: string;
  parsedData: ParsedProductData | null;
  productType: string;
  enrichedBenefits?: EnrichedKeyBenefit[];
  enrichedSummary?: string | null;
  bestForTags?: string[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string; weight?: string }>> = {
  heart: Heart, brain: Brain, shield: Shield, lightning: Lightning,
  moon: Moon, leaf: Leaf, flame: Flame, drop: Drop, bone: Bone,
  eye: Eye, muscle: Star, gut: Sparkle, star: Star, sparkle: Sparkle,
};

export function WhatItDoes({ description, parsedData, productType, enrichedBenefits, enrichedSummary }: WhatItDoesProps) {
  const { t } = useTranslation();
  const hasEnriched = enrichedBenefits && enrichedBenefits.length > 0;

  const benefits = hasEnriched
    ? enrichedBenefits.slice(0, 3)
    : (parsedData?.benefits?.slice(0, 3) || []).map(b => ({ title: '', description: b, icon_hint: 'star' }));

  const summaryText = enrichedSummary || description?.replace(/<[^>]+>/g, '')?.split('\n')?.find(p => p.trim().length > 50)?.trim() || description?.replace(/<[^>]+>/g, '').substring(0, 300);

  const fallbackIcons = [Star, Sparkle, Heart, Brain, Lightning, Shield];

  return (
    <section className="py-6 space-y-6">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
        {t('pdp.whatItDoes')}
      </h2>

      {summaryText && (
        <p className="text-[#475569] dark:text-foreground/70 font-light leading-relaxed max-w-3xl text-sm lg:text-base">
          {summaryText}
        </p>
      )}

      {benefits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = hasEnriched
              ? (iconMap[(benefit as EnrichedKeyBenefit).icon_hint] || fallbackIcons[index % fallbackIcons.length])
              : fallbackIcons[index % fallbackIcons.length];
            return (
              <div
                key={index}
                className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon weight="light" className="w-5 h-5 text-primary" />
                </div>
                {hasEnriched && (benefit as EnrichedKeyBenefit).title && (
                  <h3 className="text-[16px] lg:text-[18px] font-semibold text-foreground">
                    {(benefit as EnrichedKeyBenefit).title}
                  </h3>
                )}
                <p className="text-[14px] lg:text-[16px] text-[#475569] dark:text-foreground/70 font-light leading-relaxed">
                  {hasEnriched ? (benefit as EnrichedKeyBenefit).description : (benefit as { description: string }).description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}