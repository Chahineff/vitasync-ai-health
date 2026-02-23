import { motion } from 'framer-motion';
import { CreditCard, MapPin } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface SettingsDangerZoneProps {
  index: number;
}

export function SettingsDangerZone({ index }: SettingsDangerZoneProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Card */}
        <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard weight="duotone" className="w-6 h-6 text-foreground/70" />
            <h3 className="text-lg font-semibold text-foreground">Moyen de paiement</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-7 bg-muted rounded flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">VISA</span>
            </div>
            <span className="text-base text-foreground font-mono">•••• 4242</span>
          </div>
          <Button
            variant="outline"
            className="rounded-xl transition-all duration-200 ease-in-out border-border"
            onClick={() => {}}
          >
            Modifier
          </Button>
        </div>

        {/* Address Card */}
        <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <MapPin weight="duotone" className="w-6 h-6 text-foreground/70" />
            <h3 className="text-lg font-semibold text-foreground">Adresse de livraison</h3>
          </div>
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">
            12 Rue de la Santé<br />
            75013 Paris, France
          </p>
          <Button
            variant="outline"
            className="rounded-xl transition-all duration-200 ease-in-out border-border"
            onClick={() => {}}
          >
            Modifier
          </Button>
        </div>
      </div>

      {/* Cancel Link */}
      <div className="text-center pt-4">
        <button
          className="text-sm text-muted-foreground hover:text-destructive transition-colors duration-200 underline-offset-4 hover:underline"
          onClick={() => {}}
        >
          Annuler mon abonnement
        </button>
      </div>
    </motion.div>
  );
}
