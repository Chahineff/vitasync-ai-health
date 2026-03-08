import { motion } from 'framer-motion';
import { NextDeliveryHero } from './NextDeliveryHero';
import { CurrentStackList } from './CurrentStackList';
import { AIRecommendationCard } from './AIRecommendationCard';
import { CoachingTierSelector } from './CoachingTierSelector';
import { SettingsDangerZone } from './SettingsDangerZone';
import { ShopifyConnectBanner } from './ShopifyConnectBanner';
import { OrderHistory } from './OrderHistory';
import { MonthlySpendBar } from './MonthlySpendBar';
import { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

export function MyStackSection() {
  const shopifyCustomer = useShopifyCustomer();
  const showConnectOnly = !shopifyCustomer.isConnected && !shopifyCustomer.isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0 }}
      className="space-y-10"
    >
      {showConnectOnly && (
        <ShopifyConnectBanner
          onConnect={shopifyCustomer.connect}
          isAuthenticating={shopifyCustomer.isAuthenticating}
          error={shopifyCustomer.error}
        />
      )}

      {!showConnectOnly && (
        <>
          <NextDeliveryHero index={0} customer={shopifyCustomer} />
          <MonthlySpendBar customer={shopifyCustomer} productCount={0} />
          <CurrentStackList index={1} customer={shopifyCustomer} />
          <AIRecommendationCard index={2} />
        </>
      )}

      <CoachingTierSelector index={showConnectOnly ? 1 : 3} />

      {!showConnectOnly && (
        <>
          <OrderHistory index={4} customer={shopifyCustomer} />
          <SettingsDangerZone index={5} customer={shopifyCustomer} />
        </>
      )}
    </motion.div>
  );
}
