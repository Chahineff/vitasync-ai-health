import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUp, ArrowDown, Minus, Scales } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface AbnormalValue {
  name: string;
  value: string;
  unit: string;
  reference: string;
  status: string;
  interpretation: string;
}

interface Analysis {
  id: string;
  file_name: string;
  created_at: string;
  abnormal_values: AbnormalValue[];
  deficiencies: Array<{ name: string; severity: string; description: string }>;
}

interface AnalysisComparisonProps {
  analyses: Analysis[];
  onBack: () => void;
}

export function AnalysisComparison({ analyses, onBack }: AnalysisComparisonProps) {
  const { t } = useTranslation();
  const [leftIdx, setLeftIdx] = useState(1); // older
  const [rightIdx, setRightIdx] = useState(0); // newest

  const left = analyses[leftIdx];
  const right = analyses[rightIdx];

  if (!left || !right) return null;

  // Collect all biomarker names from both
  const allBiomarkers = new Set<string>();
  left.abnormal_values?.forEach(v => allBiomarkers.add(v.name));
  right.abnormal_values?.forEach(v => allBiomarkers.add(v.name));

  const leftMap = new Map(left.abnormal_values?.map(v => [v.name, v]));
  const rightMap = new Map(right.abnormal_values?.map(v => [v.name, v]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft weight="bold" className="w-4 h-4" />
        {t('bloodtest.backToAnalyses')}
      </button>

      <div className="flex items-center gap-3 mb-4">
        <Scales weight="duotone" className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{t('bloodtest.comparison')}</h3>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('bloodtest.olderAnalysis')}</label>
          <select
            value={leftIdx}
            onChange={(e) => setLeftIdx(Number(e.target.value))}
            className="w-full p-2 rounded-xl bg-card border border-border/50 text-sm text-foreground"
          >
            {analyses.map((a, i) => i !== rightIdx && (
              <option key={a.id} value={i}>
                {a.file_name} — {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{t('bloodtest.newerAnalysis')}</label>
          <select
            value={rightIdx}
            onChange={(e) => setRightIdx(Number(e.target.value))}
            className="w-full p-2 rounded-xl bg-card border border-border/50 text-sm text-foreground"
          >
            {analyses.map((a, i) => i !== leftIdx && (
              <option key={a.id} value={i}>
                {a.file_name} — {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison table */}
      {allBiomarkers.size > 0 ? (
        <div className="bg-card rounded-[16px] border border-border/50 overflow-hidden">
          <div className="grid grid-cols-[1fr,100px,40px,100px] gap-2 p-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
            <span>{t('bloodtest.biomarker')}</span>
            <span className="text-center">{new Date(left.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
            <span />
            <span className="text-center">{new Date(right.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          </div>
          {Array.from(allBiomarkers).map((name) => {
            const lv = leftMap.get(name);
            const rv = rightMap.get(name);
            const leftVal = lv ? parseFloat(lv.value) : null;
            const rightVal = rv ? parseFloat(rv.value) : null;
            const improved = leftVal !== null && rightVal !== null ? rightVal < leftVal : null;
            const same = leftVal !== null && rightVal !== null && leftVal === rightVal;

            return (
              <div key={name} className="grid grid-cols-[1fr,100px,40px,100px] gap-2 p-3 border-b border-border/20 items-center">
                <span className="text-sm font-medium text-foreground">{name}</span>
                <span className={cn("text-sm text-center", lv ? 'text-foreground' : 'text-muted-foreground/40')}>
                  {lv ? `${lv.value} ${lv.unit}` : '—'}
                </span>
                <span className="flex justify-center">
                  {same ? (
                    <Minus className="w-4 h-4 text-muted-foreground" />
                  ) : improved === true ? (
                    <ArrowDown className="w-4 h-4 text-green-500" />
                  ) : improved === false ? (
                    <ArrowUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <span className="text-muted-foreground/30">•</span>
                  )}
                </span>
                <span className={cn("text-sm text-center", rv ? 'text-foreground' : 'text-muted-foreground/40')}>
                  {rv ? `${rv.value} ${rv.unit}` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-[16px] border border-border/50 p-8 text-center text-muted-foreground">
          {t('bloodtest.noAbnormalToCompare')}
        </div>
      )}
    </motion.div>
  );
}
