import { motion } from 'framer-motion';
import { NextDeliveryHero } from './NextDeliveryHero';
import { CurrentStackList } from './CurrentStackList';
import { AIRecommendationCard } from './AIRecommendationCard';
import { CoachingTierSelector } from './CoachingTierSelector';
import { SettingsDangerZone } from './SettingsDangerZone';
import { ShopifyConnectBanner } from './ShopifyConnectBanner';
import { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

export function MyStackSection() {
  const shopifyCustomer = useShopifyCustomer();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      {!shopifyCustomer.isConnected && !shopifyCustomer.isLoading && (
        <ShopifyConnectBanner
          onConnect={shopifyCustomer.connect}
          isAuthenticating={shopifyCustomer.isAuthenticating}
          error={shopifyCustomer.error}
        />
      )}
      <NextDeliveryHero index={0} customer={shopifyCustomer} />
      <CurrentStackList index={1} customer={shopifyCustomer} />
      <AIRecommendationCard index={2} />
      <CoachingTierSelector index={3} />
      <SettingsDangerZone index={4} customer={shopifyCustomer} />
    </motion.div>
  );
}
