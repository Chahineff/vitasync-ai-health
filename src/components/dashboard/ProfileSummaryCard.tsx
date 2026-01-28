import { motion } from 'framer-motion';
import { User, PencilSimple, Target, CurrencyDollar, Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface ProfileSummaryCardProps {
  goals: string[];
  allergies: string[];
  budget: string | null;
  onEdit: () => void;
}

const goalLabels: Record<string, string> = {
  'sommeil': '💤 Sommeil',
  'energie': '⚡ Énergie',
  'stress': '🧘 Stress',
  'sport': '🏋️ Sport',
  'prise-muscle': '💪 Muscle',
  'immunite': '🛡️ Immunité',
  'digestion': '🌿 Digestion',
  'focus': '🎯 Focus',
  'concentration': '🧠 Concentration',
  'perte-poids': '⚖️ Poids',
};

export function ProfileSummaryCard({ goals, allergies, budget, onEdit }: ProfileSummaryCardProps) {
  const displayGoals = goals.slice(0, 3).map(g => goalLabels[g] || g);
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
          <span className="text-sm font-medium text-foreground">Mon profil santé</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 px-2 text-foreground/60 hover:text-foreground"
        >
          <PencilSimple weight="bold" className="w-4 h-4 mr-1" />
          Modifier
        </Button>
      </div>

      <div className="space-y-2">
        {/* Goals */}
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

        {/* Budget */}
        {budget && (
          <div className="flex items-center gap-2">
            <CurrencyDollar weight="duotone" className="w-4 h-4 text-foreground/40" />
            <span className="text-xs text-foreground/60">Budget: {budget}/mois</span>
          </div>
        )}

        {/* Allergies */}
        {allergies.length > 0 && (
          <div className="flex items-center gap-2">
            <Warning weight="duotone" className="w-4 h-4 text-amber-500/80" />
            <span className="text-xs text-foreground/60">
              Allergies: {allergies.slice(0, 2).join(', ')}{allergies.length > 2 ? '...' : ''}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
