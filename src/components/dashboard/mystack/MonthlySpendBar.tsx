import { motion } from 'framer-motion';
import { CurrencyDollar, Package, TrendDown } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';
import type { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

interface MonthlySpendBarProps {
  customer: ReturnType<typeof useShopifyCustomer>;
  productCount: number;
}

export function MonthlySpendBar({ customer, productCount }: MonthlySpendBarProps) {
  const { t } = useTranslation();
  const { subscriptions } = customer;

  const activeContract = subscriptions.find(s => s.status === 'ACTIVE');
  if (!activeContract) return null;

  // Estimate monthly spend from subscription lines (simplified)
  const monthlyTotal = 0; // Would come from actual subscription data
  const savings = monthlyTotal * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-4 md:gap-6 px-5 py-3 bg-card rounded-2xl border border-border/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
    >
      <div className="flex items-center gap-2">
        <Package weight="duotone" className="w-4 h-4 text-primary" />
        <span className="text-sm text-foreground">
          <span className="font-semibold">{productCount}</span>{' '}
          <span className="text-muted-foreground">{t('mystack.products')}</span>
        </span>
      </div>

      {monthlyTotal > 0 && (
        <>
          <div className="w-px h-4 bg-border/50" />
          <div className="flex items-center gap-2">
            <CurrencyDollar weight="duotone" className="w-4 h-4 text-foreground/60" />
            <span className="text-sm">
              <span className="font-semibold text-foreground">{monthlyTotal.toFixed(2)}$</span>
              <span className="text-muted-foreground">/{t('mystack.month')}</span>
            </span>
          </div>

          {savings > 0 && (
            <>
              <div className="w-px h-4 bg-border/50" />
              <div className="flex items-center gap-1.5">
                <TrendDown weight="bold" className="w-4 h-4 text-secondary" />
                <span className="text-sm text-secondary font-medium">
                  -{savings.toFixed(2)}$ {t('mystack.saved')}
                </span>
              </div>
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
