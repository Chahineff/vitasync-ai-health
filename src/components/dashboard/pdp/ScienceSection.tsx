import { BookOpen, ArrowSquareOut, Lightbulb } from '@phosphor-icons/react';

interface ScienceSectionProps {
  productTitle: string;
}

export function ScienceSection({ productTitle }: ScienceSectionProps) {
  // Placeholder sources
  const sources = [
    { title: 'PubMed - Clinical Study 1', url: '#' },
    { title: 'Journal of Nutrition Research', url: '#' },
    { title: 'European Journal of Clinical Nutrition', url: '#' },
    { title: 'American Journal of Clinical Nutrition', url: '#' },
    { title: 'Nutrients Journal', url: '#' },
    { title: 'International Journal of Sport Nutrition', url: '#' },
  ];

  const studyBullets = [
    'Studies suggest this ingredient may support the intended health benefit when taken consistently.',
    'Research indicates potential synergistic effects with balanced nutrition.',
    'Clinical trials have explored dosage optimization for maximum efficacy.',
    'Observational studies show correlation with improved wellness markers.',
    'Meta-analyses support safety profile at recommended dosages.',
  ];

  return (
    <section className="py-8 space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen weight="light" className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">
          The Science (Simplified)
        </h2>
      </div>

      {/* TL;DR */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
        <div className="flex items-start gap-3">
          <Lightbulb weight="fill" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary mb-1">TL;DR</p>
            <p className="text-foreground font-light text-sm leading-relaxed">
              Les ingrédients actifs de ce produit ont fait l'objet d'études scientifiques suggérant 
              des bienfaits potentiels pour la santé. Résultats variables selon les individus.
            </p>
          </div>
        </div>
      </div>

      {/* Study Bullets */}
      <div className="space-y-3">
        <p className="text-sm text-foreground/60 font-medium">What studies suggest:</p>
        <ul className="space-y-2">
          {studyBullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-foreground/70 font-light">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sources */}
      <div className="space-y-3">
        <p className="text-sm text-foreground/60 font-medium">Sources & références:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sources.map((source, index) => (
            <a
              key={index}
              href={source.url}
              className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors group"
            >
              <ArrowSquareOut weight="light" className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
              <span className="text-sm text-foreground/60 font-light truncate group-hover:text-foreground transition-colors">
                {source.title}
              </span>
              <span className="text-xs text-foreground/30">(placeholder)</span>
            </a>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-foreground/40 font-light">
        Ces informations sont fournies à titre éducatif uniquement. Les résultats peuvent varier. 
        Consultez un professionnel de santé pour des conseils personnalisés.
      </p>
    </section>
  );
}
