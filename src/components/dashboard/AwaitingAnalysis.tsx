import { motion } from 'framer-motion';
import { Robot, ArrowRight } from '@phosphor-icons/react';

interface AwaitingAnalysisProps {
  title: string;
  onStartDiagnostic: () => void;
}

export const AwaitingAnalysis = ({ title, onStartDiagnostic }: AwaitingAnalysisProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-premium rounded-3xl p-6 h-full border border-white/10 flex flex-col items-center justify-center text-center min-h-[280px]"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Robot weight="light" className="w-8 h-8 text-primary/60" />
      </div>
      
      <h3 className="text-lg font-light tracking-tight text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-foreground/50 font-light mb-6 max-w-[200px]">
        Discutez avec le Coach IA pour recevoir des recommandations personnalisées
      </p>
      
      <button
        onClick={onStartDiagnostic}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-medium group"
      >
        Lancer le diagnostic
        <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};
