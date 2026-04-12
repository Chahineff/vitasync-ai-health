import { useState, useEffect } from 'react';
import { Eye, Package, Truck } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface SocialProofBarProps {
  productTitle: string;
}

export function SocialProofBar({ productTitle }: SocialProofBarProps) {
  const { t } = useTranslation();
  const [viewers, setViewers] = useState(0);

  // Simulate realistic viewer count
  useEffect(() => {
    const base = (productTitle.length * 7 + 12) % 30 + 8;
    setViewers(base);
    const interval = setInterval(() => {
      setViewers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(5, Math.min(50, prev + delta));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [productTitle]);

  // Calculate shipping deadline
  const now = new Date();
  const cutoffHour = 14; // 2 PM
  const hoursLeft = cutoffHour - now.getHours();
  const minutesLeft = 60 - now.getMinutes();
  const isBeforeCutoff = now.getHours() < cutoffHour;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
      {/* Stock */}
      <div className="flex items-center gap-1.5 text-xs text-foreground/50">
        <Package weight="light" className="w-3.5 h-3.5" />
        <span>{t('pdp.inStockFast')}</span>
      </div>

      {/* Shipping timer */}
      {isBeforeCutoff && (
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <Truck weight="light" className="w-3.5 h-3.5" />
          <span>
            {t('pdp.shipToday')
              .replace('{hours}', String(hoursLeft))
              .replace('{minutes}', String(minutesLeft))}
          </span>
        </div>
      )}
    </div>
  );
}
