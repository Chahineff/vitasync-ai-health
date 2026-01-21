import { Brain, Moon, Leaf, Lightning } from '@phosphor-icons/react';

interface QuickActionsProps {
  onAction: (message: string) => void;
  disabled?: boolean;
}

const actions = [
  { label: "Analyser mon sommeil", icon: Moon, message: "Peux-tu analyser mes habitudes de sommeil et me donner des conseils pour mieux dormir ?" },
  { label: "Conseil nutrition", icon: Leaf, message: "Quels conseils nutritionnels peux-tu me donner pour améliorer mon énergie au quotidien ?" },
  { label: "Ma routine du jour", icon: Brain, message: "Quelle devrait être ma routine de compléments pour aujourd'hui ?" },
  { label: "Boost énergie", icon: Lightning, message: "Comment puis-je améliorer mon niveau d'énergie naturellement ?" },
];

export const QuickActions = ({ onAction, disabled }: QuickActionsProps) => {
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
