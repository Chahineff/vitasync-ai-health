import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';

// Official VitaSync PNG Logo
const vitasyncLogoUrl = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

export const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-4">
      {/* Animated Avatar */}
      <motion.div 
        className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 p-2 flex-shrink-0 border border-white/20 relative"
        animate={{ 
          boxShadow: [
            "0 0 10px 2px rgba(0, 240, 255, 0.2)",
            "0 0 20px 4px rgba(0, 240, 255, 0.4)",
            "0 0 10px 2px rgba(0, 240, 255, 0.2)"
          ]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <img src={vitasyncLogoUrl} alt="VitaSync" className="w-full h-full object-contain" />
      </motion.div>

      {/* Thinking content without bubble */}
      <div className="flex-1 pt-2">
        {/* Label */}
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkle weight="fill" className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-foreground/60">VitaSync AI</span>
        </div>

        {/* Shimmer text */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-light animate-text-shimmer bg-gradient-to-r from-foreground/60 via-primary to-foreground/60 bg-[length:200%_100%] bg-clip-text text-transparent">
            En cours de réflexion
          </span>
          
          {/* Wave dots */}
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/60"
                animate={{ 
                  y: [-3, 3, -3],
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

        {/* Animated line */}
        <motion.div 
          className="h-0.5 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-full mt-4"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
    </div>
  );
};
