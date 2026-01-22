import { motion } from 'framer-motion';
import { Brain } from '@phosphor-icons/react';

export const TypingIndicator = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-2"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Brain weight="duotone" className="w-4 h-4 text-primary" />
      </motion.div>
      <span className="text-sm text-foreground/60 italic font-light">
        En cours de réflexion...
      </span>
    </motion.div>
  );
};
