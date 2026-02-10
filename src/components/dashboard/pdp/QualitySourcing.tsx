import { Factory, Flask, Leaf, Thermometer, ShieldCheck } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';
import { EnrichedQualityInfo } from './types';

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

  const qualityCards = [
    {
      icon: Factory,
      title: 'Manufacturing',
      description: hasEnriched && enrichedQuality.manufacturing
        ? enrichedQuality.manufacturing
        : 'Fabriqué selon des normes strictes',
    },
    {
      icon: Flask,
      title: 'Testing',
      description: hasEnriched && enrichedQuality.testing
        ? enrichedQuality.testing
        : 'Testé par des laboratoires tiers pour garantir pureté et qualité',
    },
    {
      icon: Leaf,
      title: 'Clean Formula',
      description: 'Sans additifs inutiles, formule transparente',
    },
    {
      icon: Thermometer,
      title: 'Storage',
      description: 'Conserver dans un endroit frais et sec, à l\'abri de la lumière directe',
    },
  ];

  return (
    <section className="py-12 space-y-8">
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
        Quality & Sourcing
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qualityCards.map((card, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30 border border-border/30"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <card.icon weight="light" className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">{card.title}</h3>
              <p className="text-foreground/60 font-light text-sm leading-relaxed">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {certifications.map((cert, index) => (
            <div key={index} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
              <ShieldCheck weight="light" className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground/70 font-light">{cert}</span>
            </div>
          ))}
        </div>
      )}

      {vendor && (
        <div className="p-4 rounded-xl bg-muted/20 border border-border/20">
          <p className="text-sm text-foreground/60 font-light">
            <span className="font-medium text-foreground">Marque :</span> {vendor}
          </p>
        </div>
      )}
    </section>
  );
}
