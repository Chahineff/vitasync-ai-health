import { Star, Sparkle, Heart, Brain, Lightning, Shield, Moon, Leaf, Flame, Drop, Bone, Eye } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { ParsedProductData } from '@/lib/shopify-parser';
import { EnrichedKeyBenefit } from './types';

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

export function WhatItDoes({ description, parsedData, productType, enrichedBenefits, enrichedSummary, bestForTags }: WhatItDoesProps) {
  const hasEnriched = enrichedBenefits && enrichedBenefits.length > 0;

  // Use enriched benefits or fallback to parsed
  const benefits = hasEnriched
    ? enrichedBenefits
    : (parsedData?.benefits?.slice(0, 3) || []).map(b => ({ title: '', description: b, icon_hint: 'star' }));

  // Use enriched summary or fallback
  const summaryText = enrichedSummary || description?.replace(/<[^>]+>/g, '')?.split('\n')?.find(p => p.trim().length > 50)?.trim() || description?.replace(/<[^>]+>/g, '').substring(0, 300);

  // Use enriched tags or generate from product type
  const tags = bestForTags && bestForTags.length > 0
    ? bestForTags
    : generateBestForTags(productType, parsedData);

  const fallbackIcons = [Star, Sparkle, Heart, Brain, Lightning, Shield];

  return (
    <section className="py-12 space-y-8">
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
        What It Does
      </h2>

      {/* Summary */}
      {summaryText && (
        <p className="text-foreground/70 font-light leading-relaxed max-w-3xl text-base lg:text-lg">
          {summaryText}
        </p>
      )}

      {/* Benefit Cards */}
      {benefits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = hasEnriched
              ? (iconMap[(benefit as EnrichedKeyBenefit).icon_hint] || fallbackIcons[index % fallbackIcons.length])
              : fallbackIcons[index % fallbackIcons.length];
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-muted/30 border border-border/30 space-y-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon weight="light" className="w-5 h-5 text-primary" />
                </div>
                {hasEnriched && (benefit as EnrichedKeyBenefit).title && (
                  <h3 className="text-sm font-semibold text-foreground">
                    {(benefit as EnrichedKeyBenefit).title}
                  </h3>
                )}
                <p className="text-foreground/70 font-light text-sm leading-relaxed">
                  {hasEnriched ? (benefit as EnrichedKeyBenefit).description : (benefit as { description: string }).description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Best For Tags */}
      {tags.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-foreground/60 font-medium">Best for:</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-3 py-1.5 rounded-full text-sm font-light"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function generateBestForTags(productType: string, parsedData: ParsedProductData | null): string[] {
  const tags: string[] = [];
  const type = productType?.toLowerCase() || '';
  const benefits = parsedData?.benefits?.join(' ').toLowerCase() || '';

  if (type.includes('protein') || benefits.includes('muscle')) tags.push('Athletes', 'Muscle Recovery');
  if (type.includes('sleep') || benefits.includes('sleep')) tags.push('Better Sleep', 'Relaxation');
  if (type.includes('energy') || benefits.includes('energy')) tags.push('Active Lifestyle', 'Daily Energy');
  if (type.includes('vitamin') || type.includes('multi')) tags.push('Daily Wellness', 'Nutritional Gaps');
  if (benefits.includes('stress') || benefits.includes('calm')) tags.push('Stress Relief', 'Calm Mind');
  if (benefits.includes('focus') || benefits.includes('cognitive')) tags.push('Mental Clarity', 'Focus');
  if (benefits.includes('immune') || benefits.includes('immunity')) tags.push('Immune Support');
  if (benefits.includes('digest') || benefits.includes('gut')) tags.push('Digestive Health');
  if (tags.length < 3) tags.push('Daily Use', 'Wellness Seekers');
  return [...new Set(tags)].slice(0, 8);
}
