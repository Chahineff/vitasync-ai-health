import { Timer, Drop, Calendar, Lightbulb } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';
import { useTranslation } from '@/hooks/useTranslation';

interface HowToTakeProps {
  parsedData: ParsedProductData | null;
}

export function HowToTake({ parsedData }: HowToTakeProps) {
  const { t } = useTranslation();
  
  const dosage = parsedData?.suggestedUse || '—';
  const timing = deriveTiming(parsedData?.suggestedUse, t);
  const notes = deriveNotes(parsedData?.suggestedUse, t);
  const duration = t('pdp.durationValue');
  const coachTip = generateCoachTip(parsedData, t);

  const items = [
    { icon: Timer, label: t('pdp.dosage'), value: dosage, show: !!parsedData?.suggestedUse },
    { icon: Calendar, label: t('pdp.timing'), value: timing, show: !!timing },
    { icon: Drop, label: t('pdp.notes'), value: notes, show: !!notes },
    { icon: Calendar, label: t('pdp.duration'), value: duration, show: true },
  ].filter(item => item.show);

  return (
    <section className="py-8 space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        {t('pdp.howToTake')}
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
              {t('pdp.coachTip')}
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

function deriveTiming(suggestedUse: string | undefined, t: (key: string) => string): string {
  if (!suggestedUse) return '';
  
  const use = suggestedUse.toLowerCase();
  
  if (use.includes('morning') || use.includes('matin')) return t('pdp.timingMorning');
  if (use.includes('evening') || use.includes('soir') || use.includes('before bed')) return t('pdp.timingEvening');
  if (use.includes('with meal') || use.includes('avec repas') || use.includes('with food')) return t('pdp.timingWithMeal');
  if (use.includes('empty stomach')) return t('pdp.timingEmptyStomach');
  if (use.includes('before workout')) return t('pdp.timingBeforeWorkout');
  if (use.includes('after workout')) return t('pdp.timingAfterWorkout');
  
  return t('pdp.timingDaily');
}

function deriveNotes(suggestedUse: string | undefined, t: (key: string) => string): string {
  if (!suggestedUse) return '';
  
  const notes: string[] = [];
  const use = suggestedUse.toLowerCase();
  
  if (use.includes('water') || use.includes('eau')) {
    notes.push(t('pdp.notesWater'));
  }
  if (use.includes('milk') || use.includes('lait')) {
    notes.push(t('pdp.notesMilk'));
  }
  if (use.includes('shake') || use.includes('smoothie')) {
    notes.push(t('pdp.notesShake'));
  }
  
  if (notes.length === 0) {
    notes.push(t('pdp.notesHydrate'));
  }
  
  return notes.join('. ');
}

function generateCoachTip(parsedData: ParsedProductData | null, t: (key: string) => string): string {
  const tips = [
    t('pdp.coachTip1'),
    t('pdp.coachTip2'),
    t('pdp.coachTip3'),
    t('pdp.coachTip4'),
  ];
  
  // Return a tip based on product characteristics
  if (parsedData?.suggestedUse?.toLowerCase().includes('workout')) {
    return t('pdp.coachTipWorkout');
  }
  if (parsedData?.suggestedUse?.toLowerCase().includes('sleep') || 
      parsedData?.suggestedUse?.toLowerCase().includes('soir')) {
    return t('pdp.coachTipSleep');
  }
  
  return tips[Math.floor(Math.random() * tips.length)];
}
