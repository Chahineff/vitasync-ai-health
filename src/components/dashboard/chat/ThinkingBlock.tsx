import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CaretDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface ThinkingBlockProps {
  thinking: string;
  isStreaming?: boolean;
}

export function ThinkingBlock({ thinking, isStreaming = false }: ThinkingBlockProps) {
  const [isOpen, setIsOpen] = useState(isStreaming);

  useEffect(() => {
    if (!isStreaming && isOpen && thinking.length > 0) {
      setIsOpen(false);
    }
  }, [isStreaming, isOpen, thinking.length]);

  return (
    <div className="mb-3 rounded-xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-purple-500/10 transition-colors"
      >
        {isStreaming ? (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain weight="fill" className="w-4 h-4 text-purple-400" />
          </motion.div>
        ) : (
          <Brain weight="fill" className="w-4 h-4 text-purple-400" />
        )}
        <span className="text-xs font-medium text-purple-400">
          {isStreaming ? 'Réflexion en cours...' : 'Réflexion'}
        </span>
        <CaretDown
          weight="bold"
          className={cn(
            "w-3 h-3 text-purple-400/60 ml-auto transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 text-xs text-foreground/40 font-light leading-relaxed whitespace-pre-wrap">
              {thinking}
              {isStreaming && (
                <span className="inline-block w-0.5 h-3 bg-purple-400 ml-0.5 align-middle animate-cursor-blink" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
