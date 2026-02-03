import { Timer, Drop, Calendar, Lightbulb } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';

interface HowToTakeProps {
  parsedData: ParsedProductData | null;
}

export function HowToTake({ parsedData }: HowToTakeProps) {
  const dosage = parsedData?.suggestedUse || '—';
  const timing = deriveTiming(parsedData?.suggestedUse);
  const notes = deriveNotes(parsedData?.suggestedUse);
  const duration = '4-8 semaines pour des résultats optimaux';
  const coachTip = generateCoachTip(parsedData);

  const items = [
    { icon: Timer, label: 'Dosage', value: dosage, show: !!parsedData?.suggestedUse },
    { icon: Calendar, label: 'Timing', value: timing, show: !!timing },
    { icon: Drop, label: 'Notes', value: notes, show: !!notes },
    { icon: Calendar, label: 'Durée recommandée', value: duration, show: true },
  ].filter(item => item.show);

  return (
    <section className="py-8 space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        How to Take It
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30 border border-border/30"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <item.icon weight="light" className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-foreground font-light text-sm leading-relaxed">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Coach Tip */}
      {coachTip && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb weight="fill" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
              Coach Tip
            </p>
            <p className="text-foreground font-light text-sm leading-relaxed">
              {coachTip}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function deriveTiming(suggestedUse: string | undefined): string {
  if (!suggestedUse) return '';
  
  const use = suggestedUse.toLowerCase();
  
  if (use.includes('morning') || use.includes('matin')) return 'Le matin au réveil';
  if (use.includes('evening') || use.includes('soir') || use.includes('before bed')) return 'Le soir avant le coucher';
  if (use.includes('with meal') || use.includes('avec repas') || use.includes('with food')) return 'Avec un repas';
  if (use.includes('empty stomach')) return 'À jeun';
  if (use.includes('before workout')) return 'Avant l\'entraînement';
  if (use.includes('after workout')) return 'Après l\'entraînement';
  
  return 'Prendre quotidiennement';
}

function deriveNotes(suggestedUse: string | undefined): string {
  if (!suggestedUse) return '';
  
  const notes: string[] = [];
  const use = suggestedUse.toLowerCase();
  
  if (use.includes('water') || use.includes('eau')) {
    notes.push('Prendre avec un grand verre d\'eau');
  }
  if (use.includes('milk') || use.includes('lait')) {
    notes.push('Peut être mélangé avec du lait ou une boisson végétale');
  }
  if (use.includes('shake') || use.includes('smoothie')) {
    notes.push('Idéal dans un shake ou smoothie');
  }
  
  if (notes.length === 0) {
    notes.push('Bien s\'hydrater tout au long de la journée');
  }
  
  return notes.join('. ');
}

function generateCoachTip(parsedData: ParsedProductData | null): string {
  const tips = [
    'Pour des résultats optimaux, soyez régulier dans votre prise quotidienne.',
    'Associez ce complément à une alimentation équilibrée et variée.',
    'Écoutez votre corps et ajustez si nécessaire après consultation.',
    'La constance est la clé : ne sautez pas de jours pour maximiser les effets.',
  ];
  
  // Return a tip based on product characteristics
  if (parsedData?.suggestedUse?.toLowerCase().includes('workout')) {
    return 'Préparez votre dose à l\'avance pour ne jamais manquer votre prise post-entraînement.';
  }
  if (parsedData?.suggestedUse?.toLowerCase().includes('sleep') || 
      parsedData?.suggestedUse?.toLowerCase().includes('soir')) {
    return 'Établissez une routine du soir incluant ce complément pour des effets optimaux.';
  }
  
  return tips[Math.floor(Math.random() * tips.length)];
}
