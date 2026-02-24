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
      transition={{ duration: 0.4, delay: index * 0.1 }}>

      





































    </motion.div>);

}