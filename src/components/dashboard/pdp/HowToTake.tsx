import { Timer, Drop, Calendar, Lightbulb, SunHorizon, Moon, ForkKnife } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';
import { useTranslation } from '@/hooks/useTranslation';
import { EnrichedSuggestedUse } from './types';

interface HowToTakeProps {
  parsedData: ParsedProductData | null;
  enrichedSuggestedUse?: EnrichedSuggestedUse;
  enrichedCoachTip?: string | null;
}

export function HowToTake({ parsedData, enrichedSuggestedUse, enrichedCoachTip }: HowToTakeProps) {
  const { t } = useTranslation();
  const hasEnriched = !!enrichedSuggestedUse?.dosage;

  const dosage = hasEnriched ? enrichedSuggestedUse.dosage : (parsedData?.suggestedUse || '—');
  const timing = hasEnriched ? enrichedSuggestedUse.timing : deriveTiming(parsedData?.suggestedUse, t);
  const notes = hasEnriched ? enrichedSuggestedUse.notes : deriveNotes(parsedData?.suggestedUse, t);
  const withFood = hasEnriched ? (enrichedSuggestedUse.with_food ? 'Take with food for better absorption' : 'Can be taken on an empty stomach') : '';
  const coachTip = enrichedCoachTip || generateCoachTip(parsedData, t);

  const items = [
    { icon: Timer, label: t('pdp.dosage'), value: dosage, show: !!dosage && dosage !== '—' },
    { icon: timing?.toLowerCase().includes('morning') || timing?.toLowerCase().includes('am') ? SunHorizon : Moon, label: t('pdp.timing'), value: timing, show: !!timing },
    { icon: ForkKnife, label: 'With Food', value: withFood, show: hasEnriched },
    { icon: Drop, label: t('pdp.notes'), value: notes, show: !!notes },
    { icon: Calendar, label: t('pdp.duration'), value: t('pdp.durationValue'), show: true },
  ].filter(item => item.show);

  return (
    <section className="py-12 space-y-8">
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
        {t('pdp.howToTake')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30 border border-border/30"
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

      {coachTip && (
        <div className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
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
  return t('pdp.timingDaily');
}

function deriveNotes(suggestedUse: string | undefined, t: (key: string) => string): string {
  if (!suggestedUse) return '';
  const notes: string[] = [];
  const use = suggestedUse.toLowerCase();
  if (use.includes('water') || use.includes('eau')) notes.push(t('pdp.notesWater'));
  if (use.includes('shake') || use.includes('smoothie')) notes.push(t('pdp.notesShake'));
  if (notes.length === 0) notes.push(t('pdp.notesHydrate'));
  return notes.join('. ');
}

function generateCoachTip(parsedData: ParsedProductData | null, t: (key: string) => string): string {
  const tips = [t('pdp.coachTip1'), t('pdp.coachTip2'), t('pdp.coachTip3'), t('pdp.coachTip4')];
  if (parsedData?.suggestedUse?.toLowerCase().includes('workout')) return t('pdp.coachTipWorkout');
  if (parsedData?.suggestedUse?.toLowerCase().includes('sleep')) return t('pdp.coachTipSleep');
  return tips[Math.floor(Math.random() * tips.length)];
}
