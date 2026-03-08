import { motion } from 'framer-motion';
import { Warning, TestTube, Pill } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';

interface StatCardsProps {
  abnormalCount: number;
  deficiencyCount: number;
  supplementCount: number;
}

export function StatCards({ abnormalCount, deficiencyCount, supplementCount }: StatCardsProps) {
  const { t } = useTranslation();
  const cards = [
    {
      icon: Warning,
      label: t('bloodtest.abnormalValues'),
      count: abnormalCount,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
    },
    {
      icon: TestTube,
      label: t('bloodtest.deficiencies'),
      count: deficiencyCount,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      icon: Pill,
      label: t('bloodtest.suggestedSupplements'),
      count: supplementCount,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`glass-card p-4 rounded-[16px] border ${card.border} text-center`}
        >
          <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mx-auto mb-2`}>
            <card.icon weight="fill" className={`w-5 h-5 ${card.color}`} />
          </div>
          <p className={`text-2xl font-bold ${card.color}`}>{card.count}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
