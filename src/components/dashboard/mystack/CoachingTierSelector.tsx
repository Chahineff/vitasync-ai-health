import { motion } from 'framer-motion';
import { Check, Crown } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface CoachingTierSelectorProps {
  index: number;
}

export function CoachingTierSelector({ index }: CoachingTierSelectorProps) {
  const { t } = useTranslation();

  const TIERS = [
    {
      id: 'basic',
      name: 'Basic',
      price: '0',
      features: [t('tier.basic.f1'), t('tier.basic.f2'), t('tier.basic.f3')],
      isCurrent: true,
      isUpgrade: false,
    },
    {
      id: 'go-ai',
      name: 'Go AI',
      price: '7,99',
      features: [t('tier.go.f1'), t('tier.go.f2'), t('tier.go.f3')],
      isCurrent: false,
      isUpgrade: true,
    },
    {
      id: 'premium-ai',
      name: 'Premium AI',
      price: '24,99',
      features: [t('tier.premium.f1'), t('tier.premium.f2'), t('tier.premium.f3'), t('tier.premium.f4')],
      isCurrent: false,
      isUpgrade: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
        {t('tier.title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`bg-card rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-2 transition-all duration-200 relative ${
              tier.isCurrent ? 'border-primary' : 'border-border/50 hover:border-border'
            }`}
          >
            {tier.isCurrent && (
              <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground border-0">
                <Crown weight="fill" className="w-3 h-3 mr-1" />
                {t('tier.currentPlan')}
              </Badge>
            )}

            <h3 className="text-lg font-semibold text-foreground mb-1">{tier.name}</h3>
            <p className="text-2xl font-bold text-foreground mb-4">
              {tier.price === '0' ? t('tier.free') : `${tier.price} $`}
              {tier.price !== '0' && (
                <span className="text-sm font-normal text-muted-foreground">{t('tier.perMonth')}</span>
              )}
            </p>

            <ul className="space-y-2 mb-6">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check weight="bold" className={`w-4 h-4 flex-shrink-0 ${tier.isCurrent || tier.isUpgrade ? 'text-primary' : 'text-muted-foreground/50'}`} />
                  <span className={tier.isCurrent || tier.isUpgrade ? 'text-foreground' : 'text-muted-foreground'}>{feature}</span>
                </li>
              ))}
            </ul>

            {tier.isCurrent ? (
              <Button disabled variant="outline" className="w-full rounded-xl transition-all duration-200 ease-in-out">
                {t('tier.currentPlan')}
              </Button>
            ) : (
              <Button disabled className="w-full rounded-xl transition-all duration-200 ease-in-out opacity-60">
                {t('tier.comingSoon')}
              </Button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
