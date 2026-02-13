import { Sparkle, PencilSimple, ChatCircleDots, ArrowRight } from '@phosphor-icons/react';
import { EnrichedProductData } from './types';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface CoachInsightCardProps {
  enrichedData: EnrichedProductData | null;
  productTitle: string;
  onAskCoach?: () => void;
}

export function CoachInsightCard({ enrichedData, productTitle, onAskCoach }: CoachInsightCardProps) {
  const { healthProfile: profile } = useHealthProfile();
  const navigate = useNavigate();

  const insightText = enrichedData?.coach_tip || enrichedData?.summary || null;
  if (!insightText) return null;

  // Build contextual chips from user profile
  const chips: Array<{ label: string; value: string }> = [];
  if (profile?.health_goals?.length) {
    chips.push({ label: 'Goal', value: profile.health_goals[0] });
  }
  if (profile?.activity_level) {
    chips.push({ label: 'Training', value: profile.activity_level });
  }
  if (profile?.monthly_budget) {
    chips.push({ label: 'Budget', value: profile.monthly_budget });
  }

  return (
    <section className="py-6">
      <div className="relative rounded-2xl bg-background border border-[#E2E8F0] dark:border-border/30 overflow-hidden">
        {/* Gradient left border accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-secondary to-primary" />

        <div className="p-6 pl-7 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Sparkle weight="fill" className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-semibold text-foreground tracking-wide">
              VitaSync Insight
            </h3>
          </div>

          {/* Insight text */}
          <p className="text-sm text-[#475569] dark:text-foreground/70 font-light leading-relaxed line-clamp-3">
            {insightText}
          </p>

          {/* Contextual chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <Badge
                  key={chip.label}
                  variant="outline"
                  className="bg-[#F1F5F9] dark:bg-muted/30 text-[#0B1220] dark:text-foreground border-[#E2E8F0] dark:border-border/30 text-xs font-normal rounded-full"
                >
                  {chip.label}: {chip.value}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                const question = `Que penses-tu de ${productTitle} pour moi ? Est-ce adapté à mon profil et mes objectifs ?`;
                navigate('/dashboard', { state: { activeTab: 'coach', prefillMessage: question } });
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-secondary to-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
            >
              <ChatCircleDots weight="fill" className="w-4.5 h-4.5" />
              Demander au Coach
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </button>
            <button className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/60 transition-colors">
              <PencilSimple weight="light" className="w-3.5 h-3.5" />
              Edit my context
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
