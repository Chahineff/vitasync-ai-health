import { motion } from 'framer-motion';
import { TrendUp, TrendDown, Heartbeat } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';

interface HealthScoreCardProps {
  score: number;
  previousScore?: number;
  lastAnalysisDate: string;
  totalAnalyses: number;
}

export function HealthScoreCard({ score, previousScore, lastAnalysisDate, totalAnalyses }: HealthScoreCardProps) {
  const { t } = useTranslation();
  const trend = previousScore !== undefined ? score - previousScore : undefined;
  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;

  const scoreColor = score >= 75 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';
  const strokeColor = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-card rounded-[20px] border border-border/50 p-6 flex items-center gap-6"
    >
      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Animated circle */}
      <div className="relative w-[128px] h-[128px] shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" opacity="0.3" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-3xl font-bold ${scoreColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">/100</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <Heartbeat weight="fill" className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('bloodtest.healthScore')}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {t('bloodtest.basedOnAnalysis')} {new Date(lastAnalysisDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </p>

        <div className="flex items-center gap-4">
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendUp weight="bold" className="w-4 h-4" /> : <TrendDown weight="bold" className="w-4 h-4" />}
              {trend >= 0 ? '+' : ''}{trend} pts
            </div>
          )}
          <span className="text-xs text-muted-foreground">
            {totalAnalyses} {t('bloodtest.analysesCount')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/** Calculate a health score from analysis data */
export function calculateHealthScore(analysis: {
  abnormal_values: Array<any>;
  deficiencies: Array<any>;
  suggested_supplements: Array<any>;
}): number {
  const abnormalCount = analysis.abnormal_values?.length || 0;
  const deficiencyCount = analysis.deficiencies?.length || 0;
  // Start at 100, deduct for each issue
  const penalty = (abnormalCount * 6) + (deficiencyCount * 8);
  return Math.max(0, Math.min(100, 100 - penalty));
}
