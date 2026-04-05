import { Sparkle, PencilSimple, ChatCircleDots, ArrowRight } from '@phosphor-icons/react';
import { EnrichedProductData } from './types';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo } from 'react';

interface CoachInsightCardProps {
  enrichedData: EnrichedProductData | null;
  productTitle: string;
  onAskCoach?: () => void;
}

function CompatibilityRing({ score }: { score: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 75 ? 'hsl(var(--primary))' : score >= 50 ? 'hsl(40 90% 50%)' : 'hsl(0 70% 55%)';

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity={0.3} />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{score}%</span>
    </div>
  );
}

export function CoachInsightCard({ enrichedData, productTitle, onAskCoach }: CoachInsightCardProps) {
  const { t } = useTranslation();
  const { healthProfile: profile } = useHealthProfile();
  const navigate = useNavigate();

  const insightText = enrichedData?.coach_tip || enrichedData?.summary || null;

  const compatibilityScore = useMemo(() => {
    if (!profile || !enrichedData) return null;
    let score = 50;
    const bestFor = (enrichedData.best_for_tags || []).map(tg => tg.toLowerCase());
    const goals = (profile.health_goals || []).map((g: string) => g.toLowerCase());
    for (const goal of goals) {
      if (bestFor.some(tg => tg.includes(goal) || goal.includes(tg))) score += 12;
    }
    if (profile.activity_level) {
      const active = ['moderate', 'intense', 'very_active', 'athlete'].includes(profile.activity_level);
      const isPerformance = bestFor.some(tg => tg.includes('sport') || tg.includes('recovery') || tg.includes('energy'));
      if (active && isPerformance) score += 10;
    }
    return Math.min(100, Math.max(10, score));
  }, [profile, enrichedData]);

  if (!insightText && !compatibilityScore) return null;

  const chips: Array<{ label: string; value: string }> = [];
  if (profile?.health_goals?.length) {
    chips.push({ label: t('pdp.chipGoal'), value: profile.health_goals[0] });
  }
  if (profile?.activity_level) {
    chips.push({ label: t('pdp.chipTraining'), value: profile.activity_level });
  }
  if (profile?.monthly_budget) {
    chips.push({ label: t('pdp.chipBudget'), value: profile.monthly_budget });
  }

  return (
    <section className="py-6">
      <div className="relative rounded-2xl bg-background border border-border/30 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-secondary to-primary" />
        <div className="p-6 pl-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkle weight="fill" className="w-5 h-5 text-secondary" />
              <h3 className="text-sm font-semibold text-foreground tracking-wide">{t('pdp.vitaSyncInsight')}</h3>
            </div>
            {compatibilityScore !== null && <CompatibilityRing score={compatibilityScore} />}
          </div>

          {compatibilityScore !== null && (
            <p className="text-sm font-semibold text-foreground">
              {compatibilityScore >= 75 ? t('pdp.veryCompatible') : compatibilityScore >= 50 ? t('pdp.compatible') : t('pdp.lowCompatibility')}
            </p>
          )}

          {insightText && (
            <p className="text-sm text-foreground/60 font-light leading-relaxed line-clamp-3">{insightText}</p>
          )}

          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <Badge key={chip.label} variant="outline" className="bg-muted/30 text-foreground border-border/30 text-xs font-normal rounded-full">
                  {chip.label}: {chip.value}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                const question = t('pdp.askVitaSyncQuestion').replace('{product}', productTitle);
                navigate('/dashboard', { state: { activeTab: 'coach', prefillMessage: question } });
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-primary-foreground rounded-full bg-gradient-to-r from-secondary to-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              <ChatCircleDots weight="fill" className="w-4.5 h-4.5" />
              {t('pdp.askCoachBtn')}
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/60 transition-colors">
              <PencilSimple weight="light" className="w-3.5 h-3.5" />
              {t('pdp.editMyContext')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}