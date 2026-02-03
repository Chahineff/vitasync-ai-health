import { Factory, Flask, Leaf, Thermometer } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';

interface QualitySourcingProps {
  parsedData: ParsedProductData | null;
  vendor: string;
}

export function QualitySourcing({ parsedData, vendor }: QualitySourcingProps) {
  const country = parsedData?.manufacturerCountry || '—';
  const certifications = parsedData?.certifications || [];

  const qualityCards = [
    {
      icon: Factory,
      title: 'Manufacturing',
      description: country !== '—' 
        ? `Fabriqué ${country.toLowerCase().includes('usa') ? 'aux USA' : country.toLowerCase().includes('france') ? 'en France' : 'en ' + country}`
        : 'Fabriqué selon des normes strictes',
      show: true,
    },
    {
      icon: Flask,
      title: 'Testing',
      description: 'Testé par des laboratoires tiers pour garantir pureté et qualité',
      show: certifications.includes('Third-Party-Tested') || certifications.includes('GMP') || true,
    },
    {
      icon: Leaf,
      title: 'Clean Formula',
      description: 'Sans additifs inutiles, formule transparente',
      show: certifications.some(c => c.includes('Natural') || c.includes('Clean')) || true,
    },
    {
      icon: Thermometer,
      title: 'Storage',
      description: 'Conserver dans un endroit frais et sec, à l\'abri de la lumière directe',
      show: true,
    },
  ].filter(card => card.show);

  return (
    <section className="py-8 space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        Quality & Sourcing
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qualityCards.map((card, index) => (
          <div 
            key={index}
            className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30 border border-border/30"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <card.icon weight="light" className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">
                {card.title}
              </h3>
              <p className="text-foreground/60 font-light text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Brand Info */}
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
