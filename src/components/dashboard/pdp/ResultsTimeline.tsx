import { Timer, TrendUp, Trophy } from '@phosphor-icons/react';
import { EnrichedProductData } from './types';

interface ResultsTimelineProps {
  enrichedData: EnrichedProductData | null;
  productType: string;
}

const defaultTimelines: Record<string, Array<{ period: string; label: string; detail: string }>> = {
  vitamin: [
    { period: 'Semaine 1-2', label: 'Absorption', detail: 'Votre corps commence a reconstituer ses reserves.' },
    { period: 'Semaine 3-4', label: 'Premiers effets', detail: 'Amelioration progressive de l\'energie et du bien-etre.' },
    { period: 'Mois 2-3', label: 'Resultats optimaux', detail: 'Benefices pleinement installes avec une prise reguliere.' },
  ],
  protein: [
    { period: 'Semaine 1', label: 'Recuperation', detail: 'Recuperation musculaire amelioree apres l\'effort.' },
    { period: 'Semaine 2-4', label: 'Performance', detail: 'Gains de force et d\'endurance progressifs.' },
    { period: 'Mois 2-3', label: 'Transformation', detail: 'Composition corporelle visiblement amelioree.' },
  ],
  default: [
    { period: 'Semaine 1-2', label: 'Adaptation', detail: 'Votre organisme s\'adapte au complement.' },
    { period: 'Semaine 3-6', label: 'Effets visibles', detail: 'Les premiers benefices deviennent perceptibles.' },
    { period: 'Mois 3+', label: 'Benefices durables', detail: 'Resultats consolides avec une utilisation reguliere.' },
  ],
};

const icons = [Timer, TrendUp, Trophy];

export function ResultsTimeline({ enrichedData, productType }: ResultsTimelineProps) {
  const type = productType?.toLowerCase() || '';
  let timeline = defaultTimelines.default;
  if (type.includes('vitamin') || type.includes('mineral')) timeline = defaultTimelines.vitamin;
  else if (type.includes('protein')) timeline = defaultTimelines.protein;

  return (
    <section className="py-6 space-y-4">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
        À quoi s'attendre
      </h2>
      <div className="relative">
        {/* Vertical line */}
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
