import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner, Trash, Plus, X, NotePencil, Sparkle, Info } from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { DeleteConfirmDialog } from './bloodtest';

interface JournalEntry {
  id: string;
  file_name: string;
  analysis_text: string | null;
  status: string;
  created_at: string;
  analyzed_at: string | null;
}

interface NutrientInput {
  name: string;
  value: string;
  unit: string;
}

const UNIT_OPTIONS = ['ng/mL', 'µg/L', 'mg/dL', 'mmol/L', 'IU/L', 'g/L', 'other'];

const emptyNutrient = (): NutrientInput => ({ name: '', value: '', unit: 'ng/mL' });

export function BloodTestSection() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nutrients, setNutrients] = useState<NutrientInput[]>([emptyNutrient()]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('blood_test_analyses')
      .select('id,file_name,analysis_text,status,created_at,analyzed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEntries(data as JournalEntry[]);
      if (data.length > 0 && !selectedEntry) {
        setSelectedEntry(data[0] as JournalEntry);
      }
    }
    setLoading(false);
  }, [user, selectedEntry]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const updateNutrient = (idx: number, field: keyof NutrientInput, value: string) => {
    setNutrients((curr) => curr.map((n, i) => (i === idx ? { ...n, [field]: value } : n)));
  };

  const addRow = () => setNutrients((c) => [...c, emptyNutrient()]);
  const removeRow = (idx: number) =>
    setNutrients((c) => (c.length > 1 ? c.filter((_, i) => i !== idx) : c));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nutrients
      .map(n => ({ ...n, name: n.name.trim(), value: n.value.trim() }))
      .filter(n => n.name);
    if (!clean.length) {
      toast.error(t('bloodtest.nameRequired'));
      return;
    }
    setSubmitting(true);
    try {
      const session = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wellness-nutrient-info`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({ nutrients: clean }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Request failed');
      }
      toast.success(t('bloodtest.analysisComplete'));
      setNutrients([emptyNutrient()]);
      // Re-fetch and select newest
      const { data } = await supabase
        .from('blood_test_analyses')
        .select('id,file_name,analysis_text,status,created_at,analyzed_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (data) {
        setEntries(data as JournalEntry[]);
        setSelectedEntry((data[0] as JournalEntry) || null);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('bloodtest.analysisError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = (id: string, name: string) => setDeleteTarget({ id, name });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from('blood_test_analyses')
      .delete()
      .eq('id', deleteTarget.id);
    if (error) {
      toast.error(t('bloodtest.deleteError'));
    } else {
      toast.success(t('bloodtest.deleteSuccess'));
      if (selectedEntry?.id === deleteTarget.id) setSelectedEntry(null);
      fetchEntries();
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        fileName={deleteTarget?.name || ''}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-light tracking-tight text-foreground">
          {t('bloodtest.title')}
        </h2>
      </div>

      {/* Persistent disclaimer (always visible) */}
      <div className="flex items-start gap-3 p-4 rounded-[16px] border border-amber-500/30 bg-amber-500/5">
        <Info weight="fill" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-foreground/80">
          <strong>{t('bloodtest.title')}</strong> — {t('bloodtest.legalDisclaimer')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Manual entry form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-[20px] border border-border/50 p-5">
            <div className="flex items-center gap-2 mb-4">
              <NotePencil weight="duotone" className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                {t('bloodtest.logNutrients')}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <AnimatePresence initial={false}>
                {nutrients.map((n, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="space-y-2 p-3 rounded-[14px] bg-muted/30 border border-border/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        #{idx + 1}
                      </span>
                      {nutrients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive transition"
                          aria-label="Remove nutrient"
                        >
                          <X weight="bold" className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={t('bloodtest.nutrientNamePlaceholder')}
                      value={n.name}
                      onChange={(e) => updateNutrient(idx, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      maxLength={80}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={t('bloodtest.valuePlaceholder')}
                        value={n.value}
                        onChange={(e) => updateNutrient(idx, 'value', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary/50"
                        maxLength={30}
                      />
                      <select
                        value={n.unit}
                        onChange={(e) => updateNutrient(idx, 'unit', e.target.value)}
                        className="px-3 py-2 rounded-lg bg-background border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary/50"
                      >
                        {UNIT_OPTIONS.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={addRow}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-dashed border-border/50 hover:border-primary/40 transition"
              >
                <Plus weight="bold" className="w-4 h-4" />
                {t('bloodtest.addAnotherNutrient')}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition",
                  submitting
                    ? 'bg-muted text-muted-foreground cursor-wait'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                )}
              >
                {submitting ? (
                  <>
                    <Spinner className="w-4 h-4 animate-spin" />
                    {t('bloodtest.analyzing')}
                  </>
                ) : (
                  <>
                    <Sparkle weight="fill" className="w-4 h-4" />
                    {t('bloodtest.saveAndGetInfo')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History list */}
          <div className="bg-card rounded-[20px] border border-border/50 p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 px-1">
              {t('bloodtest.wellnessHistory')}
            </h3>
            {entries.length === 0 ? (
              <p className="text-xs text-muted-foreground px-1 py-6 text-center">
                {t('bloodtest.emptyDescription')}
              </p>
            ) : (
              <div className="space-y-1 max-h-[320px] overflow-y-auto">
                {entries.map((entry) => {
                  const isSelected = selectedEntry?.id === entry.id;
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "group flex items-start gap-2 p-2 rounded-lg cursor-pointer transition",
                        isSelected ? 'bg-primary/10' : 'hover:bg-muted/40'
                      )}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {entry.file_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString(undefined, {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteRequest(entry.id, entry.file_name); }}
                        className="p-1 rounded text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition"
                        aria-label="Delete entry"
                      >
                        <Trash weight="light" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Selected wellness info */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {selectedEntry ? (
              <motion.div
                key={selectedEntry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card rounded-[20px] border border-border/50 p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {t('bloodtest.personalizedWellnessInfo')}
                    </p>
                    <h3 className="text-lg font-medium text-foreground">
                      {selectedEntry.file_name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(selectedEntry.created_at).toLocaleDateString(undefined, {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {selectedEntry.status === 'completed' && selectedEntry.analysis_text ? (
                  <>
                    <div className="prose prose-sm dark:prose-invert max-w-none font-light chat-markdown">
                      <ReactMarkdown>{selectedEntry.analysis_text}</ReactMarkdown>
                    </div>
                    <div className="pt-4 border-t border-border/30">
                      <p className="text-[10px] text-muted-foreground/80 italic leading-snug">
                        {t('bloodtest.legalDisclaimer')}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <Spinner className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{t('bloodtest.analyzing')}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-card rounded-[20px] border border-dashed border-border/50 p-10 text-center">
                <NotePencil weight="duotone" className="w-12 h-12 text-primary/40 mx-auto mb-3" />
                <h3 className="text-base font-medium text-foreground mb-1">
                  {t('bloodtest.emptyTitle')}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {t('bloodtest.emptyDescription')}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}