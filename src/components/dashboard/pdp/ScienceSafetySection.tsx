import { ShieldCheck, Warning, Pill, ChatCircle, Flask } from '@phosphor-icons/react';
import { useProductResearch } from '@/hooks/useProductResearch';

interface Props {
  handle: string;
  productTitle: string;
  onAskCoach?: () => void;
}

export function ScienceSafetySection({ handle, productTitle, onAskCoach }: Props) {
  const { research } = useProductResearch(handle);
  if (!research) return null;
  const d = research.data || {};
  const eff = d.efficacy || {};
  const safe = d.safety || {};
  const fit = d.vitasync_fit || {};
  const reg = d.regulation || {};
  const allowed: string[] = reg.fda_claims_allowed || eff.key_benefits || [];
  const avoid = [...(safe.contraindications || []), ...(fit.do_not_recommend_when || [])];
  const interactions: string[] = safe.drug_interactions || [];

  const handleAsk = () => {
    if (onAskCoach) return onAskCoach();
    try {
      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: 'coach', context: { type: 'product_research', handle, productTitle, research: d } } }));
    } catch {/* noop */}
  };

  return (
    <section className="py-6 space-y-5">
      <div className="flex items-center gap-2">
        <Flask weight="duotone" className="w-5 h-5 text-primary" />
        <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">Science & Safety</h2>
        {eff.evidence_level && (
          <span className="ml-2 text-[11px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            Evidence: {eff.evidence_level}
          </span>
        )}
      </div>

      {allowed.length > 0 && (
        <div className="rounded-2xl bg-[#F8FAFC] dark:bg-muted/20 border border-[#E2E8F0] dark:border-border/30 p-5">
          <p className="text-xs uppercase tracking-wider text-foreground/50 font-medium mb-2">Key benefits</p>
          <ul className="space-y-1.5">
            {allowed.slice(0, 6).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 font-light">
                <ShieldCheck weight="fill" className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(eff.effective_dose || eff.onset) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {eff.effective_dose && (
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30">
              <div className="flex items-center gap-2 mb-1"><Pill weight="light" className="w-4 h-4 text-primary" /><p className="text-xs uppercase tracking-wider text-foreground/50 font-medium">Effective dose</p></div>
              <p className="text-sm text-foreground/80 font-light">{eff.effective_dose}</p>
            </div>
          )}
          {eff.onset && (
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-muted/30 border border-[#E2E8F0] dark:border-border/30">
              <p className="text-xs uppercase tracking-wider text-foreground/50 font-medium mb-1">Onset</p>
              <p className="text-sm text-foreground/80 font-light">{eff.onset}</p>
            </div>
          )}
        </div>
      )}

      {avoid.length > 0 && (
        <div className="rounded-2xl bg-[#FFF7ED] dark:bg-amber-500/5 border border-[#F59E0B]/40 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Warning weight="fill" className="w-5 h-5 text-[#F59E0B]" />
            <p className="text-sm font-semibold text-foreground">Who should avoid this</p>
          </div>
          <ul className="space-y-1.5">
            {avoid.slice(0, 8).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 font-light">
                <span className="text-[#F59E0B] mt-0.5">•</span><span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {interactions.length > 0 && (
        <div className="rounded-2xl bg-[#F8FAFC] dark:bg-muted/20 border border-[#E2E8F0] dark:border-border/30 p-5">
          <p className="text-xs uppercase tracking-wider text-foreground/50 font-medium mb-2">Drug interactions</p>
          <ul className="space-y-1.5">
            {interactions.slice(0, 6).map((b, i) => (
              <li key={i} className="text-sm text-foreground/80 font-light">• {b}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleAsk}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
      >
        <ChatCircle weight="fill" className="w-4 h-4" />
        Ask VitaSync about {productTitle}
      </button>

      <p className="text-[11px] text-foreground/40 font-light italic leading-relaxed">
        * These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
      </p>
    </section>
  );
}