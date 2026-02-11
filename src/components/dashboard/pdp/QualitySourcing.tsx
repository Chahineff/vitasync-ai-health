import { Factory, Flask, Leaf, Thermometer, ShieldCheck, FileText } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';
import { EnrichedQualityInfo } from './types';
import { Badge } from '@/components/ui/badge';

interface QualitySourcingProps {
  parsedData: ParsedProductData | null;
  vendor: string;
  enrichedQuality?: EnrichedQualityInfo;
}

export function QualitySourcing({ parsedData, vendor, enrichedQuality }: QualitySourcingProps) {
  const hasEnriched = !!enrichedQuality;
  const certifications = hasEnriched
    ? enrichedQuality.certifications
    : (parsedData?.certifications || []);

  const hasCOA = hasEnriched && enrichedQuality.testing?.toLowerCase().includes('coa');

  const qualityCards = [
    {
      icon: Factory,
      title: 'Manufacturing & Standards',
      bullets: [
        hasEnriched && enrichedQuality.manufacturing ? enrichedQuality.manufacturing : 'Manufactured under strict quality standards',
        'GMP-compliant production facility',
        `By ${vendor || 'Trusted manufacturer'}`,
      ],
    },
    {
      icon: Flask,
      title: 'Testing & COA',
      bullets: [
        hasEnriched && enrichedQuality.testing ? enrichedQuality.testing : 'Third-party lab tested',
        'Verified purity and potency',
        'Batch-level quality assurance',
      ],
      showCOA: true,
    },
    {
      icon: Leaf,
      title: 'Contaminants',
      bullets: [
        'Tested for heavy metals',
        'No harmful contaminants detected',
        'Meets safety thresholds',
      ],
    },
    {
      icon: Thermometer,
      title: 'Traceability',
      bullets: [
        'Full batch traceability',
        'Documented supply chain',
        'Transparent sourcing',
      ],
    },
  ];

  return (
    <section className="py-6 space-y-6">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
        Quality & Sourcing
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qualityCards.map((card, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30 space-y-3"
          >
            <div className="flex items-center gap-2">
              <card.icon weight="light" className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{card.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {card.bullets.map((bullet, i) => (
                <li key={i} className="text-xs text-[#475569] dark:text-foreground/60 font-light flex items-start gap-2">
                  <span className="text-foreground/30 mt-0.5">•</span>
                  {bullet}
                </li>
              ))}
            </ul>
            {card.showCOA && (
              <button
                disabled={!hasCOA}
                className={`flex items-center gap-1.5 text-xs font-medium mt-2 ${hasCOA ? 'text-primary hover:text-primary/80' : 'text-foreground/30 cursor-not-allowed'}`}
              >
                <FileText weight="light" className="w-3.5 h-3.5" />
                {hasCOA ? 'View COA' : 'View COA — Coming soon'}
              </button>
            )}
          </div>
        ))}
      </div>

      {certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
              <ShieldCheck weight="light" className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-foreground/70 font-light">{cert}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
