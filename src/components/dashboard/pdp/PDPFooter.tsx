import { Info } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';

export function PDPFooter() {
  const { t } = useTranslation();

  return (
    <section className="py-6 space-y-4 mt-4">
      <div className="flex items-center justify-center gap-6">
        <button className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors font-light">
          {t('pdpFooter.scienceSafety')}
        </button>
        <span className="text-foreground/20">•</span>
        <button className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors font-light">
          {t('pdpFooter.privacy')}
        </button>
      </div>
      
      <div className="flex items-start gap-2 justify-center max-w-xl mx-auto">
        <Info weight="light" className="w-3.5 h-3.5 text-foreground/30 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-foreground/30 font-light leading-relaxed text-center">
          {t('pdpFooter.fdaDisclaimer')}
        </p>
      </div>
    </section>
  );
}
