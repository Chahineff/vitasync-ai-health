import { motion } from 'framer-motion';
import { Robot, Microphone, ArrowRight } from '@phosphor-icons/react';

interface QuickCoachWidgetProps {
  onStartChat: () => void;
  userName?: string;
}

const QuickCoachWidget = ({ onStartChat, userName }: QuickCoachWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium rounded-2xl p-6 lg:p-8"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Icon and text */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" alt="VitaSync" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h3 className="text-xl font-light tracking-tight text-foreground mb-1">
              Coach IA Personnel
            </h3>
            <p className="text-sm text-foreground/60 font-light max-w-md">
              {userName 
                ? `${userName}, posez vos questions sur votre santé, nutrition ou routine bien-être.`
                : "Posez vos questions sur votre santé, nutrition ou routine bien-être."
              }
            </p>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={onStartChat}
            className="btn-neumorphic flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
          >
            <span>Parler au Coach</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </button>
          <button
            disabled
            className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-foreground/40 cursor-not-allowed"
            title="Vocal - Bientôt disponible"
          >
            <Microphone weight="light" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick stats or last conversation preview */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-foreground/50 font-light">
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>Coach IA prêt à vous aider</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickCoachWidget;
