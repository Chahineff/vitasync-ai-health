import { useState } from 'react';
import { motion } from 'framer-motion';
import { CaretDown, Lightning, Brain, Sparkle, Lock } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';

export type UserPlan = 'free' | 'go' | 'premium';

export interface AIModel {
  id: string;
  label: string;
  description: string;
  model: string;
  tier: 'free' | 'go' | 'premium';
  thinking: boolean;
  icon: 'lightning' | 'sparkle' | 'brain';
  maxTokens: number;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'nano',
    label: 'VitaSync Nano',
    description: 'Rapide et léger',
    model: 'openai/gpt-5-nano',
    tier: 'free',
    thinking: false,
    icon: 'lightning',
    maxTokens: 2048,
  },
  {
    id: 'mini',
    label: 'VitaSync Mini',
    description: 'Équilibré',
    model: 'openai/gpt-5-mini',
    tier: 'free',
    thinking: false,
    icon: 'lightning',
    maxTokens: 4096,
  },
  {
    id: 'pro',
    label: 'VitaSync Pro',
    description: 'Puissant',
    model: 'openai/gpt-5',
    tier: 'go',
    thinking: false,
    icon: 'sparkle',
    maxTokens: 6144,
  },
  {
    id: 'ultra',
    label: 'VitaSync Ultra',
    description: 'Réflexion avancée',
    model: 'openai/gpt-5.2',
    tier: 'premium',
    thinking: true,
    icon: 'brain',
    maxTokens: 8192,
  },
];

function canAccessModel(modelTier: string, userPlan: UserPlan): boolean {
  if (userPlan === 'premium') return true;
  if (userPlan === 'go') return modelTier !== 'premium';
  return modelTier === 'free';
}

function getRequiredPlanLabel(tier: string): string {
  if (tier === 'go') return 'Go AI';
  if (tier === 'premium') return 'Premium AI';
  return '';
}

export function getDefaultModelForPlan(plan: UserPlan): AIModel {
  if (plan === 'premium') return AI_MODELS.find(m => m.id === 'pro')!;
  if (plan === 'go') return AI_MODELS.find(m => m.id === 'mini')!;
  return AI_MODELS[0]; // nano
}

const ModelIcon = ({ icon, className }: { icon: string; className?: string }) => {
  if (icon === 'lightning') return <Lightning weight="fill" className={className} />;
  if (icon === 'brain') return <Brain weight="fill" className={className} />;
  return <Sparkle weight="fill" className={className} />;
};

interface ChatModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  userPlan?: UserPlan;
}

export function ChatModelSelector({ selectedModel, onModelChange, userPlan = 'free' }: ChatModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const fastModels = AI_MODELS.filter(m => m.id === 'nano' || m.id === 'mini');
  const advancedModels = AI_MODELS.filter(m => m.id === 'pro' || m.id === 'ultra');

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl",
            "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20",
            "transition-all duration-200",
            "text-sm font-medium text-foreground/80"
          )}
        >
          <ModelIcon icon={selectedModel.icon} className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">{selectedModel.label}</span>
          <span className="sm:hidden">{selectedModel.id.toUpperCase()}</span>
          {selectedModel.thinking && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-semibold">
              Thinking
            </span>
          )}
          <CaretDown
            weight="bold"
            className={cn("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72 bg-background/95 backdrop-blur-xl border-white/10">
        {/* Advanced models */}
        <DropdownMenuLabel className="flex items-center gap-2 text-primary">
          <Sparkle weight="fill" className="w-4 h-4" />
          {t('chat.modelGroupAdvanced') || 'Avancé'}
        </DropdownMenuLabel>

        {advancedModels.map((model) => {
          const locked = !canAccessModel(model.tier, userPlan);
          return (
            <DropdownMenuItem
              key={model.model}
              onClick={() => !locked && onModelChange(model)}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                selectedModel.model === model.model && "bg-primary/10",
                locked && "opacity-50 cursor-not-allowed"
              )}
              disabled={locked}
            >
              <ModelIcon icon={model.icon} className={cn("w-4 h-4", model.thinking ? "text-purple-500" : "text-primary")} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{model.label}</p>
                  {model.thinking && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-semibold flex items-center gap-1">
                      <Brain weight="fill" className="w-2.5 h-2.5" />
                      Thinking
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/50">{model.description}</p>
              </div>
              {locked ? (
                <div className="flex items-center gap-1">
                  <Lock weight="fill" className="w-3 h-3 text-foreground/30" />
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground/40">
                    {getRequiredPlanLabel(model.tier)}
                  </span>
                </div>
              ) : selectedModel.model === model.model ? (
                <motion.div layoutId="selectedModel" className="w-2 h-2 rounded-full bg-primary" />
              ) : null}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="bg-white/10" />

        {/* Fast models */}
        <DropdownMenuLabel className="flex items-center gap-2 text-secondary">
          <Lightning weight="fill" className="w-4 h-4" />
          {t('chat.modelGroupFast') || 'Rapide'}
        </DropdownMenuLabel>

        {fastModels.map((model) => {
          const locked = !canAccessModel(model.tier, userPlan);
          return (
            <DropdownMenuItem
              key={model.model}
              onClick={() => !locked && onModelChange(model)}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                selectedModel.model === model.model && "bg-secondary/10",
                locked && "opacity-50 cursor-not-allowed"
              )}
              disabled={locked}
            >
              <ModelIcon icon={model.icon} className="w-4 h-4 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{model.label}</p>
                <p className="text-xs text-foreground/50">{model.description}</p>
              </div>
              {locked ? (
                <div className="flex items-center gap-1">
                  <Lock weight="fill" className="w-3 h-3 text-foreground/30" />
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground/40">
                    {getRequiredPlanLabel(model.tier)}
                  </span>
                </div>
              ) : selectedModel.model === model.model ? (
                <motion.div layoutId="selectedModel" className="w-2 h-2 rounded-full bg-secondary" />
              ) : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
