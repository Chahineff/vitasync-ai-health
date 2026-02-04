import { motion } from 'framer-motion';
import { Brain } from '@phosphor-icons/react';

export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-3 px-1 py-1">
      {/* Pulsing brain icon */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <Brain weight="duotone" className="w-5 h-5 text-primary" />
      </motion.div>
      
      {/* Shimmer text */}
      <span className="text-sm font-light animate-text-shimmer bg-gradient-to-r from-foreground/60 via-primary to-foreground/60 bg-[length:200%_100%] bg-clip-text text-transparent">
        VitaSync réfléchit...
      </span>
      
      {/* Wave dots */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary/60"
            animate={{ 
              y: [-2, 2, -2],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  );
};
