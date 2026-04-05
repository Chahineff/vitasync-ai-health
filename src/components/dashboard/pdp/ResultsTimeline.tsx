import { Timer, TrendUp, Trophy } from '@phosphor-icons/react';
import { EnrichedProductData } from './types';
import { useTranslation } from '@/hooks/useTranslation';

interface ResultsTimelineProps {
  enrichedData: EnrichedProductData | null;
  productType: string;
}

const icons = [Timer, TrendUp, Trophy];

export function ResultsTimeline({ enrichedData, productType }: ResultsTimelineProps) {
  const { t } = useTranslation();

  const getTimeline = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('vitamin') || lowerType.includes('mineral')) {
      return [
        { period: t('pdp.timeline.vitamin.p1'), label: t('pdp.timeline.vitamin.l1'), detail: t('pdp.timeline.vitamin.d1') },
        { period: t('pdp.timeline.vitamin.p2'), label: t('pdp.timeline.vitamin.l2'), detail: t('pdp.timeline.vitamin.d2') },
        { period: t('pdp.timeline.vitamin.p3'), label: t('pdp.timeline.vitamin.l3'), detail: t('pdp.timeline.vitamin.d3') },
      ];
    }
    if (lowerType.includes('protein')) {
      return [
        { period: t('pdp.timeline.protein.p1'), label: t('pdp.timeline.protein.l1'), detail: t('pdp.timeline.protein.d1') },
        { period: t('pdp.timeline.protein.p2'), label: t('pdp.timeline.protein.l2'), detail: t('pdp.timeline.protein.d2') },
        { period: t('pdp.timeline.protein.p3'), label: t('pdp.timeline.protein.l3'), detail: t('pdp.timeline.protein.d3') },
      ];
    }
    return [
      { period: t('pdp.timeline.default.p1'), label: t('pdp.timeline.default.l1'), detail: t('pdp.timeline.default.d1') },
      { period: t('pdp.timeline.default.p2'), label: t('pdp.timeline.default.l2'), detail: t('pdp.timeline.default.d2') },
      { period: t('pdp.timeline.default.p3'), label: t('pdp.timeline.default.l3'), detail: t('pdp.timeline.default.d3') },
    ];
  };

  const timeline = getTimeline(productType);

  return (
    <section className="py-6 space-y-4">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
        {t('pdp.whatToExpect')}
      </h2>
      <div className="relative">
        <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-secondary via-primary to-primary/30 rounded-full" />
        <div className="space-y-6">
          {timeline.map((step, i) => {
            const Icon = icons[i] || Timer;
            return (
              <div key={i} className="flex gap-4 items-start">
                <div className="relative z-10 w-10 h-10 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                  <Icon weight="fill" className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="pt-1">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{step.period}</span>
                  <h4 className="text-sm font-semibold text-foreground mt-0.5">{step.label}</h4>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed mt-0.5">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}