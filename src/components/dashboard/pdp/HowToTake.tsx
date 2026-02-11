import { useState } from 'react';
import { Timer, Drop, Calendar, Lightbulb, SunHorizon, Moon, ForkKnife } from '@phosphor-icons/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParsedProductData } from '@/lib/shopify-parser';
import { useTranslation } from '@/hooks/useTranslation';
import { EnrichedSuggestedUse } from './types';
import { cn } from '@/lib/utils';

interface HowToTakeProps {
  parsedData: ParsedProductData | null;
  enrichedSuggestedUse?: EnrichedSuggestedUse;
  enrichedCoachTip?: string | null;
}

export function HowToTake({ parsedData, enrichedSuggestedUse, enrichedCoachTip }: HowToTakeProps) {
  const { t } = useTranslation();
  const [activeTime, setActiveTime] = useState<string>('anytime');
  const hasEnriched = !!enrichedSuggestedUse?.dosage;

  const dosage = hasEnriched ? enrichedSuggestedUse.dosage : (parsedData?.suggestedUse || '—');
  const timing = hasEnriched ? enrichedSuggestedUse.timing : deriveTiming(parsedData?.suggestedUse, t);
  const notes = hasEnriched ? enrichedSuggestedUse.notes : deriveNotes(parsedData?.suggestedUse, t);
  const withFood = hasEnriched ? (enrichedSuggestedUse.with_food ? 'Take with food for better absorption' : 'Can be taken on an empty stomach') : '';
  const coachTip = enrichedCoachTip || generateCoachTip(parsedData, t);

  // Derive active time chip from timing
  const inferredTime = timing?.toLowerCase().includes('morning') || timing?.toLowerCase().includes('am') ? 'am' 
    : timing?.toLowerCase().includes('evening') || timing?.toLowerCase().includes('pm') ? 'pm'
    : timing?.toLowerCase().includes('post') ? 'post-workout' : 'anytime';

  const timeChips = [
    { id: 'am', label: 'AM' },
    { id: 'post-workout', label: 'Post-workout' },
    { id: 'pm', label: 'PM' },
  ];

  return (
    <section className="py-6 space-y-6">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
        {t('pdp.howToTake')}
      </h2>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="bg-[#F1F5F9] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30 rounded-xl p-1">
          <TabsTrigger value="daily" className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Daily</TabsTrigger>
          <TabsTrigger value="training" className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Training day</TabsTrigger>
          <TabsTrigger value="rest" className="rounded-lg text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Rest day</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4 space-y-4">
          <DosageCard dosage={dosage} timing={timing} withFood={withFood} notes={notes} />
        </TabsContent>
        <TabsContent value="training" className="mt-4 space-y-4">
          <DosageCard 
            dosage={dosage} 
            timing={timing?.includes('morning') ? 'Pre or post-workout' : timing} 
            withFood={withFood} 
            notes="Optimal when taken around your training window for maximum benefit." 
          />
        </TabsContent>
        <TabsContent value="rest" className="mt-4 space-y-4">
          <DosageCard 
            dosage={dosage} 
            timing="Anytime • consistency matters" 
            withFood={withFood} 
            notes="Maintain your daily dose even on rest days to keep levels stable." 
          />
        </TabsContent>
      </Tabs>

      {/* Timeline chips */}
      <div className="space-y-2">
        <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">Preferred timing</p>
        <div className="flex gap-2">
          {timeChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveTime(chip.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm transition-all border",
                activeTime === chip.id || inferredTime === chip.id
                  ? "bg-[#0B1220] text-white border-[#0B1220] dark:bg-foreground dark:text-background dark:border-foreground"
                  : "bg-[#F1F5F9] dark:bg-muted/30 text-foreground/70 border-[#E2E8F0] dark:border-border/50"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-secondary text-secondary text-sm font-medium hover:bg-secondary/10 transition-colors">
        <Calendar weight="light" className="w-4 h-4" />
        Add to my schedule
      </button>

      {/* Coach Tip */}
      {coachTip && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#F8FAFC] dark:bg-muted/20 border border-[#E2E8F0] dark:border-border/30">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb weight="fill" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
              {t('pdp.coachTip')}
            </p>
            <p className="text-foreground/70 font-light text-sm leading-relaxed">
              {coachTip}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function DosageCard({ dosage, timing, withFood, notes }: { dosage: string; timing?: string; withFood?: string; notes?: string }) {
  const items = [
    { icon: Timer, label: 'Dosage', value: dosage, show: !!dosage && dosage !== '—' },
    { icon: SunHorizon, label: 'Timing', value: timing, show: !!timing },
    { icon: ForkKnife, label: 'With Food', value: withFood, show: !!withFood },
    { icon: Drop, label: 'Notes', value: notes, show: !!notes },
  ].filter(item => item.show);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-4 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <item.icon weight="light" className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider">{item.label}</p>
            <p className="text-foreground/80 font-light text-sm leading-relaxed">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
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
