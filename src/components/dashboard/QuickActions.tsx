import { Brain, Moon, Leaf, Lightning } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';

interface QuickActionsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

export const QuickActions = ({ onAction, disabled }: QuickActionsProps) => {
  const { t } = useTranslation();

  const actions = [
    { label: t("quickActions.analyzeSleep"), icon: Moon, message: t("quickActions.analyzeSleepMsg") },
    { label: t("quickActions.nutrition"), icon: Leaf, message: t("quickActions.nutritionMsg") },
    { label: t("quickActions.routine"), icon: Brain, message: t("quickActions.routineMsg") },
    { label: t("quickActions.boostEnergy"), icon: Lightning, message: t("quickActions.boostEnergyMsg") },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.message)}
          disabled={disabled}
          className="btn-quick-action flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <action.icon weight="light" className="w-4 h-4" />
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
};
