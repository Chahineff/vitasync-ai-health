import { motion } from 'framer-motion';
import { Check, Crown } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Tier {
  id: string;
  name: string;
  price: string;
  priceLabel: string;
  features: string[];
  isCurrent: boolean;
  isUpgrade: boolean;
}

const TIERS: Tier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '0',
    priceLabel: 'Gratuit',
    features: ['5 conversations/jour', 'Historique 7 jours', 'Chat texte uniquement'],
    isCurrent: true,
    isUpgrade: false,
  },
  {
    id: 'go-ai',
    name: 'Go AI',
    price: '7,99',
    priceLabel: '7,99 $/mois',
    features: ['20 conversations/jour', 'Historique 14 jours', 'Analyse de documents (5/mois)'],
    isCurrent: false,
    isUpgrade: true,
  },
  {
    id: 'premium-ai',
    name: 'Premium AI',
    price: '24,99',
    priceLabel: '24,99 $/mois',
    features: ['Conversations illimitées', 'Historique 90 jours', 'Support voix + modèles avancés', 'Suivi proactif'],
    isCurrent: false,
    isUpgrade: true,
  },
];

interface CoachingTierSelectorProps {
  index: number;
}

export function CoachingTierSelector({ index }: CoachingTierSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
        Mon abonnement Coaching IA
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`bg-card rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-2 transition-all duration-200 relative ${
              tier.isCurrent
                ? 'border-primary'
                : 'border-border/50 hover:border-border'
            }`}
          >
            {tier.isCurrent && (
              <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground border-0">
                <Crown weight="fill" className="w-3 h-3 mr-1" />
                Plan Actuel
              </Badge>
            )}

            <h3 className="text-lg font-semibold text-foreground mb-1">{tier.name}</h3>
            <p className="text-2xl font-bold text-foreground mb-4">
              {tier.price === '0' ? 'Gratuit' : `${tier.price} $`}
              {tier.price !== '0' && (
                <span className="text-sm font-normal text-muted-foreground">/mois</span>
              )}
            </p>

            <ul className="space-y-2 mb-6">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check
                    weight="bold"
                    className={`w-4 h-4 flex-shrink-0 ${
                      tier.isCurrent || tier.isUpgrade ? 'text-primary' : 'text-muted-foreground/50'
                    }`}
                  />
                  <span className={tier.isCurrent || tier.isUpgrade ? 'text-foreground' : 'text-muted-foreground'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {tier.isCurrent ? (
              <Button
                disabled
                variant="outline"
                className="w-full rounded-xl transition-all duration-200 ease-in-out"
              >
                Plan Actuel
              </Button>
            ) : tier.isUpgrade ? (
              <Button
                className="w-full rounded-xl transition-all duration-200 ease-in-out"
                onClick={() => {}}
              >
                Mettre à niveau
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full rounded-xl transition-all duration-200 ease-in-out border-border"
                onClick={() => {}}
              >
                Rétrograder
              </Button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
