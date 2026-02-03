import { Truck, ArrowCounterClockwise, Headset, Info } from '@phosphor-icons/react';

export function PDPFooter() {
  return (
    <section className="py-8 space-y-6 border-t border-border/30 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Truck weight="light" className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Livraison</h3>
          </div>
          <p className="text-xs text-foreground/60 font-light leading-relaxed">
            Expédition sous 24-48h. Livraison standard 3-5 jours ouvrés. 
            Livraison express disponible. Frais de port offerts dès 50€.
          </p>
        </div>

        {/* Returns */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowCounterClockwise weight="light" className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Retours</h3>
          </div>
          <p className="text-xs text-foreground/60 font-light leading-relaxed">
            Satisfait ou remboursé sous 30 jours. Retours gratuits pour les produits 
            non ouverts. Contactez-nous pour toute demande.
          </p>
        </div>

        {/* Support */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Headset weight="light" className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Support</h3>
          </div>
          <p className="text-xs text-foreground/60 font-light leading-relaxed">
            Notre équipe est disponible du lundi au vendredi, 9h-18h.
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
            <strong className="font-medium">Avertissement :</strong> Les compléments alimentaires ne peuvent 
            se substituer à une alimentation variée et équilibrée et à un mode de vie sain. Les résultats 
            peuvent varier d'une personne à l'autre. Ces produits ne sont pas destinés à diagnostiquer, 
            traiter, guérir ou prévenir une maladie. Consultez un professionnel de santé avant de commencer 
            tout programme de supplémentation, en particulier si vous êtes enceinte, allaitez, prenez des 
            médicaments ou avez une condition médicale. Ne pas dépasser la dose journalière recommandée. 
            Tenir hors de portée des enfants.
          </p>
        </div>
      </div>
    </section>
  );
}
