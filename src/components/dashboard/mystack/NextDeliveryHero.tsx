import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarBlank, Clock, Spinner, TrendUp, Package, CurrencyDollar } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import type { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

interface NextDeliveryHeroProps {
  index: number;
  customer: ReturnType<typeof useShopifyCustomer>;
}

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function CycleProgressRing({ daysLeft, totalDays = 30 }: { daysLeft: number; totalDays?: number }) {
  const progress = Math.max(0, Math.min(1, 1 - daysLeft / totalDays));
  const radius = 52;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-[130px] h-[130px] flex items-center justify-center flex-shrink-0">
      <svg width="130" height="130" viewBox="0 0 130 130" className="absolute">
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          opacity={0.3}
        />
        <motion.circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          transform="rotate(-90 65 65)"
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="text-3xl font-bold text-foreground tabular-nums"
        >
          {daysLeft}
        </motion.span>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">jours</p>
      </div>
    </div>
  );
}

export function NextDeliveryHero({ index, customer }: NextDeliveryHeroProps) {
  const { t } = useTranslation();
  const { isConnected, isLoading, subscriptions } = customer;

  const activeContract = subscriptions.find(s => s.status === 'ACTIVE');
  const hasSubscription = !!activeContract;

  const nextBillingDate = activeContract?.nextBillingDate || null;
  const countdown = useCountdown(nextBillingDate);

  const nextDate = nextBillingDate
    ? new Date(nextBillingDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
      })
    : null;

  const statusLabel = hasSubscription
    ? (activeContract.status === 'PAUSED' ? t('mystack.paused') : t('mystack.active'))
    : t('mystack.freePlan');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <h1 className="text-2xl md:text-[36px] font-bold tracking-tight text-foreground mb-6">
        {t('mystack.title')}
      </h1>

      <div className="bg-card rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 md:p-8 border border-border/50 overflow-hidden relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.03] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center gap-6 relative z-10">
          {/* Left: Ring + Info */}
          <div className="flex items-center gap-6 flex-1">
            {hasSubscription ? (
              <CycleProgressRing daysLeft={countdown.days} />
            ) : (
              <div className="w-[130px] h-[130px] rounded-full bg-muted/20 border-2 border-dashed border-border/50 flex items-center justify-center flex-shrink-0">
                <Package weight="duotone" className="w-10 h-10 text-muted-foreground/40" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl font-semibold text-foreground mb-1.5">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="w-5 h-5 animate-spin" />
                    {t('mystack.loading')}
                  </span>
                ) : hasSubscription ? (
                  <>
                    {t('mystack.nextDelivery')} <span className="text-primary">{nextDate}</span>
                  </>
                ) : (
                  t('mystack.noSubscription')
                )}
              </h2>

              <Badge className={`${
                hasSubscription
                  ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15'
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                {statusLabel}
              </Badge>

              {/* Countdown detail */}
              {hasSubscription && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-4 mt-3"
                >
                  {[
                    { value: countdown.days, label: t('mystack.days') },
                    { value: countdown.hours, label: t('mystack.hours') },
                    { value: countdown.minutes, label: t('mystack.mins') },
                  ].map((unit) => (
                    <div key={unit.label} className="text-center">
                      <span className="text-lg font-bold text-foreground tabular-nums">{unit.value}</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{unit.label}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 lg:w-auto">
            {hasSubscription ? (
              <>
                <Button
                  className="rounded-xl transition-all duration-200"
                  disabled={!isConnected || isLoading}
                  onClick={() => {}}
                >
                  <Clock weight="bold" className="w-4 h-4 mr-1.5" />
                  {t('mystack.postpone')}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl transition-all duration-200 border-border"
                  disabled={!isConnected || isLoading}
                  onClick={() => {}}
                >
                  {t('mystack.pause')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'coach' }))}
                >
                  {t('mystack.createWithCoach')}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl transition-all duration-200 border-border"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'shop' }))}
                >
                  {t('mystack.browseShop')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
