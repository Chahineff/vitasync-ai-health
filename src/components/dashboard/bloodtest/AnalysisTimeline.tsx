import { motion } from 'framer-motion';
import { FileText, Spinner, Trash, Upload } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface Analysis {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
}

interface AnalysisTimelineProps {
  analyses: Analysis[];
  selectedId: string | null;
  analyzingId: string | null;
  onSelect: (analysis: Analysis) => void;
  onDelete: (id: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}

export function AnalysisTimeline({
  analyses, selectedId, analyzingId, onSelect, onDelete, onUpload, uploading,
}: AnalysisTimelineProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0 relative">
      {/* Vertical line */}
      {analyses.length > 1 && (
        <div className="absolute left-[19px] top-6 bottom-20 w-px bg-border/50" />
      )}

      {analyses.map((analysis, idx) => {
        const isSelected = selectedId === analysis.id;
        const isPending = analysis.status === 'pending' || analyzingId === analysis.id;

        return (
          <motion.button
            key={analysis.id}
            onClick={() => onSelect(analysis)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "w-full text-left pl-3 pr-3 py-3 flex items-start gap-3 rounded-[14px] transition-all relative",
              isSelected ? 'bg-primary/10' : 'hover:bg-muted/40'
            )}
          >
            {/* Timeline node */}
            <div className={cn(
              "relative z-10 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors",
              isSelected ? 'border-primary bg-primary/20' : isPending ? 'border-amber-500 bg-amber-500/10' : 'border-green-500 bg-green-500/10'
            )}>
              {isPending ? (
                <Spinner className="w-3 h-3 animate-spin text-amber-500" />
              ) : (
                <div className={cn("w-2 h-2 rounded-full", isSelected ? 'bg-primary' : 'bg-green-500')} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium truncate", isSelected ? 'text-foreground' : 'text-foreground/80')}>
                {analysis.file_name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(analysis.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <div className="mt-1.5">
                {isPending ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-500 font-medium">
                    <Spinner className="w-2.5 h-2.5 animate-spin" /> {t('bloodtest.analyzing')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-green-500/10 text-green-500 font-medium">
                    ✓ {t('bloodtest.analyzed')}
                  </span>
                )}
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(analysis.id); }}
              className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              style={{ opacity: isSelected ? 0.6 : undefined }}
            >
              <Trash weight="light" className="w-3.5 h-3.5" />
            </button>
          </motion.button>
        );
      })}

      {/* Upload more */}
      <label className="cursor-pointer block mt-2">
        <input type="file" accept=".pdf" onChange={onUpload} className="hidden" disabled={uploading} />
        <div className="ml-3 pl-6 py-3 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Upload weight="light" className="w-4 h-4" />
          <span className="text-xs">{t('bloodtest.addAnalysis')}</span>
        </div>
      </label>
    </div>
  );
}
