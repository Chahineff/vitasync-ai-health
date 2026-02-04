import { Truck, ArrowCounterClockwise, Headset, Info } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';

export function PDPFooter() {
  const { t } = useTranslation();
  
  return (
    <section className="py-8 space-y-6 border-t border-border/30 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Truck weight="light" className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-foreground">{t('pdp.shipping')}</h3>
          </div>
          <p className="text-xs text-foreground/60 font-light leading-relaxed">
            {t('pdp.shippingDesc')}
          </p>
        </div>

        {/* Returns */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowCounterClockwise weight="light" className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-foreground">{t('pdp.returns')}</h3>
          </div>
          <p className="text-xs text-foreground/60 font-light leading-relaxed">
            {t('pdp.returnsDesc')}
          </p>
        </div>

        {/* Support */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Headset weight="light" className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-foreground">{t('pdp.support')}</h3>
          </div>
          <p className="text-xs text-foreground/60 font-light leading-relaxed">
            {t('pdp.supportDesc')}
            <br />
            <span className="text-primary">contact@vitasync.com</span> (placeholder)
          </p>
        </div>
      </div>

      {/* Final Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/20 border border-border/20">
        <div className="flex items-start gap-2">
          <Info weight="light" className="w-4 h-4 text-foreground/40 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/40 font-light leading-relaxed">
            {t('pdp.fullDisclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
}
