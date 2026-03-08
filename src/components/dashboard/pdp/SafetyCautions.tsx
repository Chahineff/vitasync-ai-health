import { Warning } from '@phosphor-icons/react';
import { ParsedProductData } from '@/lib/shopify-parser';
import { EnrichedSafetyWarnings } from './types';
import { useTranslation } from '@/hooks/useTranslation';

interface SafetyCautionsProps {
  parsedData: ParsedProductData | null;
  enrichedSafety?: EnrichedSafetyWarnings;
}

export function SafetyCautions({ parsedData, enrichedSafety }: SafetyCautionsProps) {
  const { t } = useTranslation();
  const hasEnriched = !!enrichedSafety;
  const warnings = parsedData?.warnings || [];

  const bullets: string[] = [];
  if (hasEnriched) {
    bullets.push(...enrichedSafety.contraindications.slice(0, 2));
    if (enrichedSafety.interactions.length > 0) {
      bullets.push(`${t('safety.drugInteractions')}: ${enrichedSafety.interactions.slice(0, 2).join(', ')}`);
    }
    if (!enrichedSafety.pregnancy_safe) {
      bullets.push(t('safety.pregnancyWarning'));
    }
  } else if (warnings.length > 0) {
    bullets.push(...warnings.slice(0, 3));
  } else {
    bullets.push(t('safety.consultDoctor'));
    bullets.push(t('safety.dontExceed'));
  }

  return (
    <section className="py-6">
      <div className="rounded-2xl bg-[#FFF7ED] dark:bg-amber-500/5 border border-[#F59E0B]/40 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Warning weight="fill" className="w-5 h-5 text-[#F59E0B]" />
          <h2 className="text-sm font-semibold text-foreground">{t('safety.title')}</h2>
        </div>

        <ul className="space-y-2">
          {bullets.slice(0, 3).map((bullet, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-foreground/70 font-light">
              <span className="text-[#F59E0B] mt-0.5">•</span>
              {bullet}
            </li>
          ))}
        </ul>

        <p className="text-xs text-foreground/40 font-light pt-1 border-t border-[#F59E0B]/20">
          {t('safety.disclaimer')}
        </p>
      </div>
    </section>
  );
}
