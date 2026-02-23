import { motion } from 'framer-motion';
import { NextDeliveryHero } from './NextDeliveryHero';
import { CurrentStackList } from './CurrentStackList';
import { AIRecommendationCard } from './AIRecommendationCard';
import { CoachingTierSelector } from './CoachingTierSelector';
import { SettingsDangerZone } from './SettingsDangerZone';

export function MyStackSection() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      <NextDeliveryHero index={0} />
      <CurrentStackList index={1} />
      <AIRecommendationCard index={2} />
      <CoachingTierSelector index={3} />
      <SettingsDangerZone index={4} />
    </motion.div>
  );
}
