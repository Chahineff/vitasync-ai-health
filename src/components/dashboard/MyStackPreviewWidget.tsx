import { motion } from 'framer-motion';
import { Package, ArrowRight, Sun, Moon, Coffee } from '@phosphor-icons/react';
import { useSupplementTracking } from '@/hooks/useSupplementTracking';

interface MyStackPreviewWidgetProps {
  onGoToStack: () => void;
}

const timeIcons: Record<string, typeof Sun> = {
  morning: Sun,
  afternoon: Coffee,
  evening: Moon,
};

const timeLabels: Record<string, string> = {
  morning: 'Matin',
  afternoon: 'Midi',
  evening: 'Soir',
};

export function MyStackPreviewWidget({ onGoToStack }: MyStackPreviewWidgetProps) {
  const { supplements, loading } = useSupplementTracking();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium rounded-3xl p-6 h-full border border-white/10 flex flex-col min-h-[280px]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package weight="light" className="w-5 h-5 text-primary/60" />
        </div>
        <div>
          <h3 className="text-base font-medium tracking-tight text-foreground">Mon Stack</h3>
          <p className="text-xs text-foreground/50 font-light">
            {loading ? '...' : `${supplements.length} complément${supplements.length !== 1 ? 's' : ''} actif${supplements.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mb-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : supplements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <Package weight="light" className="w-10 h-10 text-foreground/20 mb-3" />
            <p className="text-sm text-foreground/50 font-light">
              Commencez à construire votre stack
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {supplements.slice(0, 4).map((supp) => {
              const TimeIcon = timeIcons[supp.time_of_day] || Sun;
              return (
                <div
                  key={supp.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/20 border border-white/5"
                >
                  <TimeIcon weight="light" className="w-4 h-4 text-foreground/40 flex-shrink-0" />
                  <span className="text-sm text-foreground/80 font-light truncate flex-1">
                    {supp.product_name}
                  </span>
                  {supp.dosage && (
                    <span className="text-[10px] text-foreground/40 bg-foreground/5 px-2 py-0.5 rounded-full flex-shrink-0">
                      {supp.dosage}
                    </span>
                  )}
                </div>
              );
            })}
            {supplements.length > 4 && (
              <p className="text-xs text-foreground/40 text-center pt-1">
                +{supplements.length - 4} autre{supplements.length - 4 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onGoToStack}
        className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-medium group"
      >
        Voir mon stack
        <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}
