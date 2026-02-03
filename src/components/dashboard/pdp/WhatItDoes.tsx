import { Star, Sparkle, Heart, Brain, Lightning, Shield } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { ParsedProductData } from '@/lib/shopify-parser';

interface WhatItDoesProps {
  description: string;
  parsedData: ParsedProductData | null;
  productType: string;
}

export function WhatItDoes({ description, parsedData, productType }: WhatItDoesProps) {
  // Get first 3 benefits for cards
  const benefits = parsedData?.benefits?.slice(0, 3) || [];
  
  // Generate "Best for" tags
  const bestForTags = generateBestForTags(productType, parsedData);

  // Clean description - remove HTML and get first paragraph
  const cleanDescription = description
    ?.replace(/<[^>]+>/g, '')
    ?.split('\n')
    ?.find(p => p.trim().length > 50)
    ?.trim() || description?.replace(/<[^>]+>/g, '').substring(0, 300);

  const icons = [Star, Sparkle, Heart, Brain, Lightning, Shield];

  return (
    <section className="py-8 space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        What It Does
      </h2>

      {/* Benefit Cards */}
      {benefits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div 
                key={index}
                className="p-5 rounded-2xl bg-muted/30 border border-border/30 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon weight="light" className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground font-light text-sm leading-relaxed">
                  {benefit}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Description Paragraph */}
      {cleanDescription && (
        <p className="text-foreground/70 font-light leading-relaxed max-w-3xl">
          {cleanDescription}
        </p>
      )}

      {/* Best For Tags */}
      {bestForTags.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-foreground/60 font-medium">Best for:</p>
          <div className="flex flex-wrap gap-2">
            {bestForTags.map((tag, index) => (
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
  
  // Add based on product type
  if (type.includes('protein') || benefits.includes('muscle')) {
    tags.push('Athletes', 'Muscle Recovery');
  }
  if (type.includes('sleep') || benefits.includes('sleep')) {
    tags.push('Better Sleep', 'Relaxation');
  }
  if (type.includes('energy') || benefits.includes('energy')) {
    tags.push('Active Lifestyle', 'Daily Energy');
  }
  if (type.includes('vitamin') || type.includes('multi')) {
    tags.push('Daily Wellness', 'Nutritional Gaps');
  }
  if (benefits.includes('stress') || benefits.includes('calm')) {
    tags.push('Stress Relief', 'Calm Mind');
  }
  if (benefits.includes('focus') || benefits.includes('cognitive')) {
    tags.push('Mental Clarity', 'Focus');
  }
  if (benefits.includes('immune') || benefits.includes('immunity')) {
    tags.push('Immune Support', 'Year-round Health');
  }
  if (benefits.includes('digest') || benefits.includes('gut')) {
    tags.push('Digestive Health', 'Gut Balance');
  }

  // Add generic tags if few specific ones
  if (tags.length < 3) {
    tags.push('Daily Use', 'Wellness Seekers');
  }

  // Limit to 8 tags
  return [...new Set(tags)].slice(0, 8);
}
