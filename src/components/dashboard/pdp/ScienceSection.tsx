import { useState } from 'react';
import { BookOpen, ArrowSquareOut, Lightbulb, CaretDown } from '@phosphor-icons/react';
import { EnrichedScienceData } from './types';
import { Button } from '@/components/ui/button';

interface ScienceSectionProps {
  productTitle: string;
  enrichedScience?: EnrichedScienceData;
}

const INITIAL_SOURCES_COUNT = 3;

export function ScienceSection({ productTitle, enrichedScience }: ScienceSectionProps) {
  const [showAllSources, setShowAllSources] = useState(false);
  const hasEnriched = enrichedScience && enrichedScience.study_bullets?.length > 0;

  const studyBullets = hasEnriched
    ? enrichedScience.study_bullets
    : [
        'Studies suggest this ingredient may support the intended health benefit when taken consistently.',
        'Research indicates potential synergistic effects with balanced nutrition.',
        'Clinical trials have explored dosage optimization for maximum efficacy.',
      ];

  const sources = hasEnriched
    ? enrichedScience.sources
    : [];

  const tldr = hasEnriched
    ? enrichedScience.tldr
    : 'Les ingrédients actifs de ce produit ont fait l\'objet d\'études scientifiques suggérant des bienfaits potentiels pour la santé. Résultats variables selon les individus.';

  return (
    <section className="py-12 space-y-8">
      <div className="flex items-center gap-2">
        <BookOpen weight="light" className="w-5 h-5 text-primary" />
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
          The Science
        </h2>
      </div>

      {/* TL;DR */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
        <div className="flex items-start gap-3">
          <Lightbulb weight="fill" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary mb-1">TL;DR</p>
            <p className="text-foreground font-light text-sm leading-relaxed">
              {tldr}
            </p>
          </div>
        </div>
      </div>

      {/* Study Bullets */}
      <div className="space-y-3">
        <p className="text-sm text-foreground/60 font-medium">What studies suggest:</p>
        <ul className="space-y-3">
          {studyBullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-foreground/70 font-light">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sources */}
      {sources.length > 0 && (() => {
        const visibleSources = showAllSources ? sources : sources.slice(0, INITIAL_SOURCES_COUNT);
        const hasMore = sources.length > INITIAL_SOURCES_COUNT;
        return (
          <div className="space-y-3">
            <p className="text-sm text-foreground/60 font-medium">Sources & références:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {visibleSources.map((source, index) => (
                <a
                  key={index}
                  href={source.url || '#'}
                  target={source.url ? '_blank' : undefined}
                  rel={source.url ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors group"
                >
                  <ArrowSquareOut weight="light" className="w-4 h-4 text-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                  <span className="text-sm text-foreground/60 font-light truncate group-hover:text-foreground transition-colors">
                    {source.title}
                  </span>
                  {source.year && (
                    <span className="text-xs text-foreground/30 flex-shrink-0">({source.year})</span>
                  )}
                </a>
              ))}
            </div>
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllSources(!showAllSources)}
                className="gap-2 text-primary hover:text-primary/80"
              >
                {showAllSources ? 'Voir moins' : `Voir plus de sources (${sources.length - INITIAL_SOURCES_COUNT})`}
                <CaretDown weight="light" className={`w-4 h-4 transition-transform ${showAllSources ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </div>
        );
      })()}

      <p className="text-xs text-foreground/40 font-light">
        Ces informations sont fournies à titre éducatif uniquement. Les résultats peuvent varier.
        Consultez un professionnel de santé pour des conseils personnalisés.
      </p>
    </section>
  );
}
