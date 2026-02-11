import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, Lightning, Brain, Sparkle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export interface AIModel {
  version: '1.0' | '2.0';
  mode: 'flash' | 'pro';
  label: string;
  description: string;
  model: string;
}

export const AI_MODELS: AIModel[] = [
  { 
    version: '1.0', 
    mode: 'flash', 
    label: 'VitaSync 1.0 Flash',
    description: 'Réponse rapide',
    model: 'google/gemini-2.5-flash'
  },
  { 
    version: '1.0', 
    mode: 'pro', 
    label: 'VitaSync 1.0 Pro',
    description: 'Réflexion approfondie',
    model: 'google/gemini-2.5-pro'
  },
  { 
    version: '2.0', 
    mode: 'flash', 
    label: 'VitaSync 2.0 Flash',
    description: 'Nouvelle génération rapide',
    model: 'google/gemini-3-flash-preview'
  },
  { 
    version: '2.0', 
    mode: 'pro', 
    label: 'VitaSync 2.0 Pro',
    description: 'Nouvelle génération avancée',
    model: 'google/gemini-3-pro-preview'
  },
];

interface ChatModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export function ChatModelSelector({ selectedModel, onModelChange }: ChatModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const v1Models = AI_MODELS.filter(m => m.version === '1.0');
  const v2Models = AI_MODELS.filter(m => m.version === '2.0');

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
          {selectedModel.version === '2.0' ? (
            <Sparkle weight="fill" className="w-4 h-4 text-primary" />
          ) : (
            <Brain weight="fill" className="w-4 h-4 text-secondary" />
          )}
          <span className="hidden sm:inline">{selectedModel.label}</span>
          <span className="sm:hidden">
            {selectedModel.version === '2.0' ? '2.0' : '1.0'} {selectedModel.mode === 'flash' ? '⚡' : '🧠'}
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
        className="w-64 bg-background/95 backdrop-blur-xl border-white/10"
      >
        {/* VitaSync 2.0 - New Generation */}
        <DropdownMenuLabel className="flex items-center gap-2 text-primary">
          <Sparkle weight="fill" className="w-4 h-4" />
          VitaSync 2.0
          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
            Nouveau
          </span>
        </DropdownMenuLabel>
        
        {v2Models.map((model) => (
          <DropdownMenuItem
            key={model.model}
            onClick={() => onModelChange(model)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              selectedModel.model === model.model && "bg-primary/10"
            )}
          >
            {model.mode === 'flash' ? (
              <Lightning weight="fill" className="w-4 h-4 text-yellow-500" />
            ) : (
              <Brain weight="fill" className="w-4 h-4 text-purple-500" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {model.mode === 'flash' ? 'Flash' : 'Pro'}
              </p>
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

        <DropdownMenuSeparator className="bg-white/10" />

        {/* VitaSync 1.0 - Classic */}
        <DropdownMenuLabel className="flex items-center gap-2 text-secondary">
          <Brain weight="fill" className="w-4 h-4" />
          VitaSync 1.0
        </DropdownMenuLabel>
        
        {v1Models.map((model) => (
          <DropdownMenuItem
            key={model.model}
            onClick={() => onModelChange(model)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              selectedModel.model === model.model && "bg-secondary/10"
            )}
          >
            {model.mode === 'flash' ? (
              <Lightning weight="fill" className="w-4 h-4 text-yellow-500" />
            ) : (
              <Brain weight="fill" className="w-4 h-4 text-purple-500" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {model.mode === 'flash' ? 'Flash' : 'Pro'}
              </p>
              <p className="text-xs text-foreground/50">{model.description}</p>
            </div>
            {selectedModel.model === model.model && (
              <motion.div
                layoutId="selectedModel"
                className="w-2 h-2 rounded-full bg-secondary"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
