import { motion } from 'framer-motion';
import { User, PencilSimple, Target, CurrencyDollar, Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface ProfileSummaryCardProps {
  goals: string[];
  allergies: string[];
  budget: string | null;
  onEdit: () => void;
}

const goalKeyMap: Record<string, string> = {
  'sommeil': 'goal.sleep',
  'energie': 'goal.energy',
  'stress': 'goal.stress',
  'sport': 'goal.sport',
  'prise-muscle': 'goal.muscle',
  'immunite': 'goal.immunity',
  'digestion': 'goal.digestion',
  'focus': 'goal.focus',
  'concentration': 'goal.focus',
  'perte-poids': 'goal.weightLoss',
};

export function ProfileSummaryCard({ goals, allergies, budget, onEdit }: ProfileSummaryCardProps) {
  const { t } = useTranslation();
  const displayGoals = goals.slice(0, 3).map(g => {
    const key = goalKeyMap[g];
    return key ? t(key) : g;
  });
  const hasMore = goals.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
            <User weight="fill" className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">{t('profileSummary.title')}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 px-2 text-foreground/60 hover:text-foreground"
        >
          <PencilSimple weight="bold" className="w-4 h-4 mr-1" />
          {t('profileSummary.edit')}
        </Button>
      </div>

      <div className="space-y-2">
        {goals.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Target weight="duotone" className="w-4 h-4 text-foreground/40 flex-shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              {displayGoals.map((goal, i) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                >
                  {goal}
                </span>
              ))}
              {hasMore && (
                <span className="px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/60 text-xs">
                  +{goals.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {budget && (
          <div className="flex items-center gap-2">
            <CurrencyDollar weight="duotone" className="w-4 h-4 text-foreground/40" />
            <span className="text-xs text-foreground/60">{t('profileSummary.budget')}: {budget}{t('profileSummary.perMonth')}</span>
          </div>
        )}

        {allergies.length > 0 && (
          <div className="flex items-center gap-2">
            <Warning weight="duotone" className="w-4 h-4 text-amber-500/80" />
            <span className="text-xs text-foreground/60">
              {t('profileSummary.allergies')}: {allergies.slice(0, 2).join(', ')}{allergies.length > 2 ? '...' : ''}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
