import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TestTube, ArrowRight, CheckCircle, Clock, WarningCircle } from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Analysis {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
}

interface AnalysesPreviewWidgetProps {
  onGoToAnalyses: () => void;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; className: string }> = {
  completed: { icon: CheckCircle, label: 'Analysé', className: 'text-secondary' },
  pending: { icon: Clock, label: 'En attente', className: 'text-amber-400' },
  error: { icon: WarningCircle, label: 'Erreur', className: 'text-destructive' },
};

export function AnalysesPreviewWidget({ onGoToAnalyses }: AnalysesPreviewWidgetProps) {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    supabase
      .from('blood_test_analyses')
      .select('id, file_name, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (!error && data) setAnalyses(data);
        setLoading(false);
      });
  }, [user]);

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
          <TestTube weight="light" className="w-5 h-5 text-primary/60" />
        </div>
        <div>
          <h3 className="text-base font-medium tracking-tight text-foreground">Mes Analyses</h3>
          <p className="text-xs text-foreground/50 font-light">
            {loading ? '...' : `${analyses.length} analyse${analyses.length !== 1 ? 's' : ''}`}
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
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <TestTube weight="light" className="w-10 h-10 text-foreground/20 mb-3" />
            <p className="text-sm text-foreground/50 font-light">
              Importez votre première analyse
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {analyses.map((analysis) => {
              const config = statusConfig[analysis.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const date = new Date(analysis.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <div
                  key={analysis.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/20 border border-white/5"
                >
                  <StatusIcon weight="fill" className={`w-4 h-4 flex-shrink-0 ${config.className}`} />
                  <span className="text-sm text-foreground/80 font-light truncate flex-1">
                    {analysis.file_name}
                  </span>
                  <span className="text-[10px] text-foreground/40 flex-shrink-0">
                    {date}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={onGoToAnalyses}
        className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-medium group"
      >
        Voir mes analyses
        <ArrowRight weight="bold" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}
