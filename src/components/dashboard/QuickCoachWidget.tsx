import { motion } from 'framer-motion';
import { Microphone, ArrowRight } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';

interface QuickCoachWidgetProps {
  onStartChat: () => void;
  userName?: string;
}

const QuickCoachWidget = ({ onStartChat, userName }: QuickCoachWidgetProps) => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium rounded-2xl p-6 lg:p-8"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <motion.div 
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" alt="VitaSync" className="w-8 h-8 object-contain" />
          </motion.div>
          <div>
            <h3 className="text-xl font-light tracking-tight text-foreground mb-1">
              {t("coach.title")}
            </h3>
            <p className="text-sm text-foreground/60 font-light max-w-md">
              {userName 
                ? `${userName}, ${t("coach.descWithName")}`
                : t("coach.descGeneric")
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <motion.button
            onClick={onStartChat}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group btn-neumorphic flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
          >
            <span>{t("coach.talkToCoach")}</span>
            <motion.div className="transition-transform group-hover:translate-x-1">
              <ArrowRight weight="bold" className="w-4 h-4" />
            </motion.div>
          </motion.button>
          <motion.button
            onClick={onStartChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/30 transition-all duration-300"
            title={t("coach.vocalSoon")}
            aria-label={t("coach.vocalSoon")}
          >
            <Microphone weight="light" className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-foreground/50 font-light">
          <div className="w-2 h-2 rounded-full bg-secondary animate-breathe" />
          <span>{t("coach.ready")}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickCoachWidget;
