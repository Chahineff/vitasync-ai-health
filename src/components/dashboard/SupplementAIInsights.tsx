import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowClockwise, SpinnerGap, TrendUp, Star, Lightning } from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SupplementReview {
  name: string;
  utility: string;
  comment: string;
}

interface InsightsData {
  regularity_score: number;
  regularity_comment: string;
  supplement_reviews: SupplementReview[];
  recommendations: string;
}

const CACHE_KEY = 'vitasync_supplement_insights';

export function SupplementAIInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoadedToday, setHasLoadedToday] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const today = new Date().toISOString().split('T')[0];
        if (parsed.date === today && parsed.userId === user.id && parsed.data) {
          setInsights(parsed.data);
          setHasLoadedToday(true);
          return;
        }
      }
    } catch {}
    // Auto-load on mount
    fetchInsights();
  }, [user]);

  const fetchInsights = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('supplement-insights', { body: {} });
      if (error) throw error;
      if (data?.insights) {
        setInsights(data.insights);
        // Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          userId: user.id,
          data: data.insights,
        }));
        setHasLoadedToday(true);
      }
    } catch (err) {
      console.error('Supplement insights error:', err);
      toast.error("Impossible de générer l'analyse");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (hasLoadedToday) {
      toast.info("Analyse déjà générée aujourd'hui", { position: 'top-center' });
      return;
    }
    fetchInsights();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-500/5';
    if (score >= 50) return 'from-yellow-500/20 to-yellow-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  const getUtilityBadge = (utility: string) => {
    const u = utility.toLowerCase();
    if (u.includes('élevé') || u.includes('high') || u.includes('excellent') || u.includes('très')) {
      return { bg: 'bg-green-500/15 text-green-400 border-green-500/20', label: utility };
    }
    if (u.includes('moyen') || u.includes('medium') || u.includes('modéré')) {
      return { bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', label: utility };
    }
    return { bg: 'bg-foreground/10 text-foreground/60 border-white/10', label: utility };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium rounded-3xl p-6 h-full border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Brain weight="light" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-light tracking-tight text-foreground">
              Analyse IA
            </h3>
            <p className="text-xs text-foreground/50 font-light">
              Propulsé par Gemini 2.5 Flash
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Rafraîchir"
        >
          <ArrowClockwise className={`w-5 h-5 text-foreground/60 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center animate-pulse">
              <Brain weight="light" className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
          </div>
          <p className="text-sm text-foreground/60 text-center">Analyse en cours...</p>
        </div>
      ) : insights ? (
        <div className="space-y-5">
          {/* Regularity Score */}
          <div className={`rounded-2xl p-4 bg-gradient-to-br ${getScoreBg(insights.regularity_score)} border border-white/5`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendUp weight="bold" className={`w-5 h-5 ${getScoreColor(insights.regularity_score)}`} />
                <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Régularité</span>
              </div>
              <span className={`text-2xl font-light ${getScoreColor(insights.regularity_score)}`}>
                {insights.regularity_score}%
              </span>
            </div>
            <p className="text-sm text-foreground/70 font-light">{insights.regularity_comment}</p>
          </div>

          {/* Supplement Reviews */}
          {insights.supplement_reviews.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star weight="light" className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                  Évaluation par complément
                </span>
              </div>
              <div className="space-y-2">
                {insights.supplement_reviews.map((review, i) => {
                  const badge = getUtilityBadge(review.utility);
                  return (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground truncate flex-1">{review.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${badge.bg} ml-2 whitespace-nowrap`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/50 font-light">{review.comment}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations && (
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Lightning weight="light" className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                  Recommandations
                </span>
              </div>
              <p className="text-sm text-foreground/70 font-light leading-relaxed">
                {insights.recommendations}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain weight="light" className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
          <p className="text-foreground/60 font-light text-sm">
            Aucune analyse disponible
          </p>
          <button
            onClick={fetchInsights}
            className="mt-3 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-light hover:bg-primary/20 transition-colors"
          >
            Générer l'analyse
          </button>
        </div>
      )}
    </motion.div>
  );
}
