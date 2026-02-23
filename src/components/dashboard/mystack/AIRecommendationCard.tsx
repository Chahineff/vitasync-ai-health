import { motion } from 'framer-motion';
import { Sparkle, Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface AIRecommendationCardProps {
  index: number;
}

export function AIRecommendationCard({ index }: AIRecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="rounded-[20px] border border-primary p-6 bg-primary/5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkle weight="fill" className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Analyse VitaSync 2.5 Flash
          </h3>
        </div>

        {/* AI Text */}
        <p className="text-base text-muted-foreground leading-relaxed mb-6">
          Basé sur vos check-ins récents indiquant une baisse d'énergie l'après-midi,
          je recommande d'ajuster votre routine. L'ajout de Coenzyme Q10 pourrait
          significativement améliorer votre métabolisme énergétique.
        </p>

        {/* Suggested Product */}
        <div className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src="/placeholder.svg"
              alt="Coenzyme Q10"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-medium text-foreground">Coenzyme Q10</h4>
            <p className="text-sm text-muted-foreground">+14 €/mois</p>
          </div>
          <Button
            className="rounded-xl transition-all duration-200 ease-in-out"
            onClick={() => {}}
          >
            <Plus weight="bold" className="w-4 h-4 mr-1" />
            Ajouter au Stack
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
