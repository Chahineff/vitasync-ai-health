import { Info } from '@phosphor-icons/react';

export function PDPFooter() {
  return (
    <section className="py-6 space-y-4 mt-4">
      <div className="flex items-center justify-center gap-6">
        <button className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors font-light">
          Science & Safety
        </button>
        <span className="text-foreground/20">•</span>
        <button className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors font-light">
          Privacy
        </button>
      </div>
      
      <div className="flex items-start gap-2 justify-center max-w-xl mx-auto">
        <Info weight="light" className="w-3.5 h-3.5 text-foreground/30 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-foreground/30 font-light leading-relaxed text-center">
          These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
        </p>
      </div>
    </section>
  );
}
