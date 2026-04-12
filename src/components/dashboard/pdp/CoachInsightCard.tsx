import { Sparkle, PencilSimple, ChatCircleDots, ArrowRight, CircleNotch, ArrowClockwise } from '@phosphor-icons/react';
import { EnrichedProductData } from './types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CoachInsightCardProps {
  enrichedData: EnrichedProductData | null;
  productTitle: string;
  productHandle: string;
  onAskCoach?: () => void;
}

function CompatibilityRing({ score, analyzed }: { score: number; analyzed: boolean }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = analyzed ? c - (score / 100) * c : c;
  const color = !analyzed
    ? 'hsl(var(--muted-foreground))'
    : score >= 75 ? 'hsl(var(--primary))' : score >= 50 ? 'hsl(40 90% 50%)' : 'hsl(0 70% 55%)';

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity={0.3} />
        <circle cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} className="transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
        {analyzed ? `${score}%` : '?'}
      </span>
    </div>
  );
}

export function CoachInsightCard({ enrichedData, productTitle, productHandle, onAskCoach }: CoachInsightCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analysisState, setAnalysisState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [insight, setInsight] = useState<string | null>(null);

  // Check if analysis already exists
  useEffect(() => {
    if (!user || !productHandle) return;
    const fetchExisting = async () => {
      const { data } = await supabase
        .from('product_compatibility_analyses' as any)
        .select('compatibility_score, insight_text')
        .eq('user_id', user.id)
        .eq('product_handle', productHandle)
        .maybeSingle();
      if (data) {
        setScore((data as any).compatibility_score);
        setInsight((data as any).insight_text);
        setAnalysisState('done');
      }
    };
    fetchExisting();
  }, [user, productHandle]);

  const runAnalysis = useCallback(async () => {
    if (!user) {
      toast.error(t('pdp.loginRequired'));
      return;
    }
    setAnalysisState('loading');
    try {
      const res = await supabase.functions.invoke('product-compatibility', {
        body: {
          product_handle: productHandle,
          product_title: productTitle,
          product_summary: enrichedData?.summary || '',
          product_best_for_tags: enrichedData?.best_for_tags || [],
          product_coach_tip: enrichedData?.coach_tip || '',
        },
      });

      if (res.error) throw res.error;
      const result = res.data;
      setScore(result.score);
      setInsight(result.insight);
      setAnalysisState('done');
      toast.success(t('pdp.analysisComplete'));
    } catch (err) {
      console.error('Compatibility analysis error:', err);
      setAnalysisState('idle');
      toast.error(t('pdp.analysisError'));
    }
  }, [user, productHandle, productTitle, enrichedData, t]);

  const isAnalyzed = analysisState === 'done' && score !== null;
  const isLoading = analysisState === 'loading';

  return (
    <section className="py-6">
      <div className="relative rounded-2xl bg-background border border-border/30 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-secondary to-primary" />
        <div className="p-6 pl-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkle weight="fill" className="w-5 h-5 text-secondary" />
              <h3 className="text-sm font-semibold text-foreground tracking-wide">{t('pdp.vitaSyncInsight')}</h3>
            </div>
            <CompatibilityRing score={score ?? 0} analyzed={isAnalyzed} />
          </div>

          {isAnalyzed ? (
            <p className="text-sm font-semibold text-foreground">
              {score! >= 75 ? t('pdp.veryCompatible') : score! >= 50 ? t('pdp.compatible') : t('pdp.lowCompatibility')}
            </p>
          ) : (
            <p className="text-sm font-medium text-foreground/40 italic">
              {t('pdp.notYetAnalyzed')}
            </p>
          )}

          {isAnalyzed && insight && (
            <p className="text-sm text-foreground/60 font-light leading-relaxed line-clamp-3">{insight}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            {isAnalyzed ? (
              <button
                onClick={runAnalysis}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-foreground/60 rounded-full border border-border/30 hover:bg-muted/50 hover:text-foreground transition-all duration-200 disabled:opacity-60"
              >
                {isLoading ? (
                  <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowClockwise weight="light" className="w-4 h-4" />
                )}
                {t('pdp.reAnalyzeBtn')}
              </button>
            ) : (
              <button
                onClick={runAnalysis}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-primary-foreground rounded-full bg-gradient-to-r from-secondary to-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                ) : (
                  <ChatCircleDots weight="fill" className="w-4.5 h-4.5" />
                )}
                {isLoading ? t('pdp.analyzing') : t('pdp.analyzeCompatibility')}
                {!isLoading && <ArrowRight weight="bold" className="w-3.5 h-3.5" />}
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard', { state: { activeTab: 'profile' } })}
              className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              <PencilSimple weight="light" className="w-3.5 h-3.5" />
              {t('pdp.editMyContext')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}