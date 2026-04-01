import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, Lightning, Brain, Sparkle, SlidersHorizontal } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface AIModel {
  version: '2.5' | '3.0';
  mode: 'flash' | 'pro';
  label: string;
  description: string;
  model: string;
  provider: 'google';
}

export const AI_MODELS: AIModel[] = [
  { 
    version: '2.5', 
    mode: 'flash', 
    label: 'VitaSync 2.5 Flash',
    description: 'Conseils rapides · Recommandations',
    model: 'google/gemini-2.5-flash-lite',
    provider: 'google',
  },
  { 
    version: '3.0', 
    mode: 'flash', 
    label: 'VitaSync 3 Flash',
    description: 'Quiz · Graphiques · Stack IA',
    model: 'google/gemini-3-flash-preview',
    provider: 'google',
  },
  { 
    version: '3.0', 
    mode: 'pro', 
    label: 'VitaSync 3 Pro',
    description: 'Analyse complète · Sang · Science',
    model: 'google/gemini-3.1-pro-preview',
    provider: 'google',
  },
];

interface ChatModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

function ModelIcon({ model }: { model: AIModel }) {
  if (model.mode === 'pro') return <Brain weight="fill" className="w-4 h-4 text-purple-500" />;
  if (model.version === '3.0') return <Sparkle weight="fill" className="w-4 h-4 text-primary" />;
  return <Lightning weight="fill" className="w-4 h-4 text-yellow-500" />;
}

export function ChatModelSelector({ selectedModel, onModelChange }: ChatModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl",
            "bg-muted/50 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 border border-border/50 dark:border-white/10 hover:border-border dark:hover:border-white/20",
            "transition-all duration-200",
            "text-sm font-medium text-foreground/80"
          )}
        >
          <ModelIcon model={selectedModel} />
          <span className="hidden sm:inline">{selectedModel.label}</span>
          <span className="sm:hidden">
            {selectedModel.version === '3.0' ? '3' : '2.5'} {selectedModel.mode === 'pro' ? '🧠' : '⚡'}
          </span>
          <CaretDown 
            weight="bold" 
            className={cn(
              "w-3 h-3 transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
          />
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="start" 
        className="w-64 bg-background/95 backdrop-blur-xl border-border/50"
      >
        {AI_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.model}
            onClick={() => onModelChange(model)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              selectedModel.model === model.model && "bg-primary/10"
            )}
          >
            <ModelIcon model={model} />
            <div className="flex-1">
              <p className="text-sm font-medium">{model.label}</p>
              <p className="text-xs text-foreground/50">{model.description}</p>
            </div>
            {selectedModel.model === model.model && (
              <motion.div
                layoutId="selectedModel"
                className="w-2 h-2 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
