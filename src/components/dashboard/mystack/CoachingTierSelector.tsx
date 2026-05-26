import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, Crown, Lightning, Brain, ChatsCircle, Microphone, ChartLine, Headset, CircleNotch, Gear, ArrowUp } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { useSubscription, startCheckout, openCustomerPortal } from '@/hooks/useSubscription';
import { TIER_PRICE_ID, type Tier } from '@/lib/subscription-tier';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CoachingTierSelectorProps {
  index: number;
}

const featureIcons = [ChatsCircle, ChatsCircle, Microphone, Brain, ChartLine, Headset, Headset];

export function CoachingTierSelector({ index }: CoachingTierSelectorProps) {
  const { t } = useTranslation();
  const { tier: currentTier, isActive, subscription } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleUpgrade = async (targetTier: Exclude<Tier, 'free'>) => {
    if (!user) {
      sessionStorage.setItem('pending_subscription_price', TIER_PRICE_ID[targetTier]);
      navigate('/auth?mode=signup');
      return;
    }
    setLoadingTier(targetTier);
    try {
      await startCheckout(TIER_PRICE_ID[targetTier], `${window.location.origin}/dashboard`);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'ouverture du checkout");
      setLoadingTier(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal(`${window.location.origin}/dashboard`);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'ouverture du portail");
    } finally {
      setPortalLoading(false);
    }
  };

  const TIERS = [
    {
      id: 'basic',
      tierKey: 'free' as Tier,
      name: 'Basic',
      price: '0',
      features: [t('tier.basic.f1'), t('tier.basic.f2'), t('tier.basic.f3')],
      featureIcons: [ChatsCircle, ChartLine, Brain],
      isCurrent: currentTier === 'free',
      isUpgrade: false,
      isPopular: false,
    },
    {
      id: 'go-ai',
      tierKey: 'go' as Tier,
      name: 'Go AI',
      price: '7,99',
      features: [t('tier.go.f1'), t('tier.go.f2'), t('tier.go.f3')],
      featureIcons: [ChatsCircle, ChartLine, Brain],
      isCurrent: currentTier === 'go',
      isUpgrade: currentTier !== 'go',
      isPopular: true,
    },
    {
      id: 'premium-ai',
      tierKey: 'premium' as Tier,
      name: 'Premium AI',
      price: '24,99',
      features: [t('tier.premium.f1'), t('tier.premium.f2'), t('tier.premium.f3'), t('tier.premium.f4')],
      featureIcons: [ChatsCircle, ChartLine, Microphone, ChartLine],
      isCurrent: currentTier === 'premium',
      isUpgrade: currentTier !== 'premium',
      isPopular: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">
          {t('tier.title')}
        </h2>
        {isActive && (
          <Button
            onClick={handleManage}
            disabled={portalLoading}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            {portalLoading ? <CircleNotch className="w-4 h-4 animate-spin" /> : <Gear weight="bold" className="w-4 h-4" />}
            Gérer mon abonnement
          </Button>
        )}
      </div>
      {subscription?.cancel_at_period_end && subscription.current_period_end && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-4">
          Abonnement annulé — accès actif jusqu'au {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: (index * 0.1) + i * 0.1 }}
            className={cn(
              "rounded-3xl p-6 border-2 transition-all duration-300 relative group",
              "bg-card shadow-[0_4px_12px_rgba(0,0,0,0.03)]",
              tier.isCurrent && "border-primary shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
              tier.isPopular && !tier.isCurrent && "border-secondary/50 hover:border-secondary hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
              !tier.isCurrent && !tier.isPopular && "border-border/50 hover:border-border",
              tier.id === 'premium-ai' && "md:-mt-2 md:pb-8"
            )}
          >
            {/* Premium gradient background */}
            {tier.id === 'premium-ai' && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-secondary/[0.04] rounded-3xl pointer-events-none" />
            )}

            {/* Badges */}
            {tier.isCurrent && (
              <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground border-0 shadow-md">
                <Crown weight="fill" className="w-3 h-3 mr-1" />
                {t('tier.currentPlan')}
              </Badge>
            )}
            {tier.isPopular && !tier.isCurrent && (
              <Badge className="absolute -top-3 left-6 bg-secondary text-secondary-foreground border-0 shadow-md">
                <Lightning weight="fill" className="w-3 h-3 mr-1" />
                {t('tier.popular')}
              </Badge>
            )}

            <div className="relative z-10">
              {/* Tier icon */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-4",
                  tier.isCurrent ? "bg-primary/10" : tier.isPopular ? "bg-secondary/10" : "bg-muted/50"
                )}
              >
                {tier.id === 'basic' && <ChatsCircle weight="duotone" className="w-6 h-6 text-primary" />}
                {tier.id === 'go-ai' && <Lightning weight="duotone" className="w-6 h-6 text-secondary" />}
                {tier.id === 'premium-ai' && <Crown weight="duotone" className="w-6 h-6 text-primary" />}
              </motion.div>

              <h3 className="text-lg font-bold text-foreground mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-3xl font-bold text-foreground">
                  {tier.price === '0' ? t('tier.free') : `${tier.price}$`}
                </span>
                {tier.price !== '0' && (
                  <span className="text-sm text-muted-foreground">{t('tier.perMonth')}</span>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, fi) => {
                  const FeatureIcon = tier.featureIcons[fi] || Check;
                  return (
                    <li key={fi} className="flex items-start gap-2.5">
                      <div className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5",
                        tier.isCurrent || tier.isUpgrade ? "bg-primary/10" : "bg-muted/50"
                      )}>
                        <Check weight="bold" className={cn(
                          "w-3 h-3",
                          tier.isCurrent || tier.isUpgrade ? "text-primary" : "text-muted-foreground/50"
                        )} />
                      </div>
                      <span className={cn(
                        "text-sm leading-tight",
                        tier.isCurrent || tier.isUpgrade ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {tier.isCurrent ? (
                <Button disabled variant="outline" className="w-full rounded-xl">
                  {t('tier.currentPlan')}
                </Button>
              ) : tier.tierKey === 'free' ? (
                <Button
                  onClick={handleManage}
                  disabled={portalLoading}
                  variant="outline"
                  className="w-full rounded-xl"
                >
                  {portalLoading ? <CircleNotch className="w-4 h-4 animate-spin" /> : null}
                  Rétrograder
                </Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade(tier.tierKey as Exclude<Tier, 'free'>)}
                  disabled={loadingTier !== null}
                  className={cn(
                    "w-full rounded-xl",
                    tier.isPopular && "bg-gradient-to-r from-secondary to-primary text-primary-foreground hover:opacity-90"
                  )}
                >
                  {loadingTier === tier.tierKey ? (
                    <CircleNotch className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp weight="bold" className="w-4 h-4" />
                  )}
                  {currentTier === 'free' ? `Passer à ${tier.name}` : 'Changer de plan'}
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
