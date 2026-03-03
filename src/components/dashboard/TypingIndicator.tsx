import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const vitasyncLogoUrl = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

const THINKING_PHRASES = [
  "Analyse en cours...",
  "Consultation des données...",
  "Préparation de la réponse...",
  "Réflexion en cours...",
];

interface TypingIndicatorProps {
  selectedModel?: string;
}

export const TypingIndicator = ({ selectedModel }: TypingIndicatorProps) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  
  // 2.5 Flash = simple dots only, no thinking phrases
  const isSimpleMode = selectedModel === 'google/gemini-2.5-flash-lite';

  useEffect(() => {
    if (isSimpleMode) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isSimpleMode]);

  return (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="relative w-10 h-10 flex-shrink-0">
        {!isSimpleMode && [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, Math.cos((i * 120 * Math.PI) / 180) * 20, 0],
              y: [0, Math.sin((i * 120 * Math.PI) / 180) * 20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
        
        <motion.div 
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 border border-border/50 dark:border-white/20 relative"
          animate={isSimpleMode ? {} : { 
            scale: [0.9, 1.1, 0.9],
            boxShadow: [
              "0 0 10px 2px rgba(0, 240, 255, 0.15)",
              "0 0 25px 6px rgba(0, 240, 255, 0.4)",
              "0 0 10px 2px rgba(0, 240, 255, 0.15)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <img src={vitasyncLogoUrl} alt="VitaSync" className="w-full h-full object-contain" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-foreground/50">VitaSync AI</span>
        </div>

        {isSimpleMode ? (
          /* Simple 3-dot indicator for 2.5 Flash */
          <div className="flex items-center gap-1.5 mb-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/60"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        ) : (
          /* Full thinking animation for 3 Flash / 3 Pro */
          <>
            <div className="relative h-5 mb-4">
              {THINKING_PHRASES.map((phrase, i) => (
                <motion.span
                  key={phrase}
                  className="absolute inset-0 text-sm font-light bg-gradient-to-r from-foreground/60 via-primary to-foreground/60 bg-[length:200%_100%] bg-clip-text text-transparent animate-text-shimmer"
                  initial={false}
                  animate={{ 
                    opacity: i === phraseIndex ? 1 : 0,
                    y: i === phraseIndex ? 0 : 8,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {phrase}
                </motion.span>
              ))}
            </div>

            <div className="relative h-0.5 bg-muted dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 h-full w-8 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ left: ['-10%', '110%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
