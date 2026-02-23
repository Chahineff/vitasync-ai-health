import { motion } from 'framer-motion';
import { CalendarBlank, Clock } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface NextDeliveryHeroProps {
  index: number;
}

export function NextDeliveryHero({ index }: NextDeliveryHeroProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <h1 className="text-2xl md:text-[36px] font-bold tracking-tight text-foreground mb-6">
        Mon Stack Mensuel
      </h1>

      <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6 border border-border/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: Date & Status */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CalendarBlank weight="duotone" className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-semibold text-foreground">
                Prochaine livraison le 15 Novembre
              </h2>
              <Badge className="mt-1 bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                Statut : Actif
              </Badge>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button
              className="rounded-xl transition-all duration-200 ease-in-out"
              onClick={() => {}}
            >
              <Clock weight="bold" className="w-4 h-4 mr-1" />
              Repousser de 15 jours
            </Button>
            <Button
              variant="outline"
              className="rounded-xl transition-all duration-200 ease-in-out border-border"
              onClick={() => {}}
            >
              Mettre en pause
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
