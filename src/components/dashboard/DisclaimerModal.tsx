import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info, ShieldCheck, Stethoscope, HeartBreak } from '@phosphor-icons/react';

interface DisclaimerModalProps {
  trigger?: React.ReactNode;
}

export function DisclaimerModal({ trigger }: DisclaimerModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors underline underline-offset-2">
            En savoir plus
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck weight="duotone" className="w-5 h-5 text-primary" />
            Avertissement Santé
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm text-foreground/80">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-start gap-3">
              <Info weight="fill" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">VitaSync est un outil de bien-être</p>
                <p className="text-foreground/60">
                  Les conseils fournis par VitaSync AI sont à titre informatif uniquement et ne constituent 
                  pas un avis médical, un diagnostic ou un traitement.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Stethoscope weight="duotone" className="w-5 h-5 text-foreground/60 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Consultez un professionnel</p>
                <p className="text-foreground/60">
                  Pour tout problème de santé, consultez toujours un médecin ou un professionnel 
                  de santé qualifié avant de prendre des compléments alimentaires.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HeartBreak weight="duotone" className="w-5 h-5 text-foreground/60 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">En cas d'urgence</p>
                <p className="text-foreground/60">
                  Si vous ressentez des symptômes graves ou une réaction indésirable, 
                  arrêtez immédiatement la prise et contactez les services d'urgence.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-foreground/40">
              Les compléments alimentaires ne remplacent pas une alimentation équilibrée et un mode 
              de vie sain. VitaSync ne prétend pas guérir, traiter ou prévenir une quelconque maladie.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
