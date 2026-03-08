import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Spinner, TestTube, Warning, Pill, Trash, Eye, CloudArrowUp, ArrowsClockwise, CaretDown, Scales, Fire, Info } from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { BloodTestViewer } from './BloodTestViewer';
import { AI_MODELS, type AIModel } from './chat/ChatModelSelector';
import { useTranslation } from '@/hooks/useTranslation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HealthScoreCard, calculateHealthScore, StatCards, AnalysisTimeline, DeleteConfirmDialog, AnalysisComparison } from './bloodtest';

interface BloodTestAnalysis {
  id: string;
  file_url: string;
  file_name: string;
  analysis_text: string | null;
  suggested_supplements: Array<{ name: string; reason: string; dosage_suggestion?: string }>;
  deficiencies: Array<{ name: string; severity: string; description: string }>;
  abnormal_values: Array<{ name: string; value: string; unit: string; reference: string; status: string; interpretation: string }>;
  status: string;
  created_at: string;
  analyzed_at: string | null;
}

const BUCKET_NAME = 'blood-tests';
const POLL_INTERVAL = 5000;

export function BloodTestSection() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [analyses, setAnalyses] = useState<BloodTestAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<BloodTestAnalysis | null>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<BloodTestAnalysis | null>(null);
  const [comparingMode, setComparingMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  const fetchAnalyses = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('blood_test_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analyses:', error);
    } else {
      setAnalyses((data as unknown as BloodTestAnalysis[]) || []);
      if (data && data.length > 0 && !selectedAnalysis) {
        setSelectedAnalysis(data[0] as unknown as BloodTestAnalysis);
      }
    }
    setLoading(false);
  }, [user, selectedAnalysis]);

  useEffect(() => { fetchAnalyses(); }, [fetchAnalyses]);

  // Auto-polling for pending analyses
  useEffect(() => {
    const hasPending = analyses.some(a => a.status === 'pending') || analyzing !== null;
    if (!hasPending) return;

    const interval = setInterval(fetchAnalyses, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [analyses, analyzing, fetchAnalyses]);

  // Core upload logic
  const uploadFile = async (file: File) => {
    if (!user) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error(t('bloodtest.pdfOnly'));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error(t('bloodtest.fileTooLarge'));
      return;
    }

    setUploading(true);
    try {
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, { contentType: 'application/pdf' });
      if (uploadError) throw uploadError;

      const storagePath = `${BUCKET_NAME}/${fileName}`;
      const { data: record, error: insertError } = await supabase
        .from('blood_test_analyses')
        .insert({ user_id: user.id, file_url: storagePath, file_name: file.name, status: 'pending' })
        .select()
        .single();
      if (insertError) throw insertError;

      toast.success(t('bloodtest.uploadSuccess'));
      await fetchAnalyses();
      if (record) triggerAnalysis(record.id);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('bloodtest.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current++; if (e.dataTransfer.items?.length) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current--; if (dragCounter.current === 0) setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false); dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  };

  const triggerAnalysis = async (analysisId: string, model?: string) => {
    setAnalyzing(analysisId);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-blood-test`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.data.session?.access_token}` },
          body: JSON.stringify({ analysisId, model }),
        }
      );
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Analysis failed'); }
      toast.success(t('bloodtest.analysisComplete'));
      await fetchAnalyses();
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('bloodtest.analysisError'));
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDeleteRequest = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('blood_test_analyses').delete().eq('id', deleteTarget.id);
    if (error) {
      toast.error(t('bloodtest.deleteError'));
    } else {
      toast.success(t('bloodtest.deleteSuccess'));
      if (selectedAnalysis?.id === deleteTarget.id) setSelectedAnalysis(null);
      fetchAnalyses();
    }
    setDeleteTarget(null);
  };

  const handleViewPdf = (analysis: BloodTestAnalysis) => { setViewingAnalysis(analysis); };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'important': case 'critique': return <Fire weight="fill" className="w-5 h-5 text-red-500" />;
      case 'modéré': case 'élevé': return <Warning weight="fill" className="w-5 h-5 text-amber-500" />;
      default: return <Info weight="fill" className="w-5 h-5 text-yellow-500" />;
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'important': case 'critique': return 'text-red-500';
      case 'modéré': case 'élevé': return 'text-amber-500';
      default: return 'text-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (viewingAnalysis) {
    return <BloodTestViewer analysis={viewingAnalysis} onBack={() => setViewingAnalysis(null)} />;
  }

  if (comparingMode && analyses.length >= 2) {
    return <AnalysisComparison analyses={analyses as any} onBack={() => setComparingMode(false)} />;
  }

  // Compute stats for selected analysis
  const latestCompleted = analyses.find(a => a.status === 'completed' && a.analysis_text);
  const previousCompleted = analyses.filter(a => a.status === 'completed' && a.analysis_text)[1];
  const currentScore = latestCompleted ? calculateHealthScore(latestCompleted) : null;
  const previousScore = previousCompleted ? calculateHealthScore(previousCompleted) : undefined;

  return (
    <div
      ref={dropRef}
      className="space-y-6 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        fileName={deleteTarget?.name || ''}
      />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-primary/10 border-2 border-dashed border-primary backdrop-blur-sm"
          >
            <div className="text-center">
              <CloudArrowUp weight="duotone" className="w-16 h-16 text-primary mx-auto mb-3" />
              <p className="text-lg font-medium text-primary">{t('bloodtest.dropHere')}</p>
              <p className="text-sm text-muted-foreground">{t('bloodtest.acceptedFormats')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light tracking-tight text-foreground">{t('bloodtest.title')}</h2>
        <div className="flex items-center gap-2">
          {analyses.length >= 2 && (
            <button
              onClick={() => setComparingMode(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-muted/50 text-foreground hover:bg-muted transition-all border border-border/50"
            >
              <Scales weight="bold" className="w-4 h-4" />
              <span className="hidden sm:inline">{t('bloodtest.compare')}</span>
            </button>
          )}
          <label className="cursor-pointer">
            <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
            <div className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              uploading ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}>
              {uploading ? <Spinner className="w-4 h-4 animate-spin" /> : <Upload weight="bold" className="w-4 h-4" />}
              {uploading ? 'Upload...' : t('bloodtest.importPdf')}
            </div>
          </label>
        </div>
      </div>

      {analyses.length === 0 ? (
        /* Enhanced empty state */
        <label className="cursor-pointer block">
          <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
          <div className={cn(
            "bg-card rounded-[20px] border-2 border-dashed p-12 text-center transition-all",
            isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
          )}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <CloudArrowUp weight="duotone" className="w-16 h-16 mx-auto mb-4 text-primary/40" />
            </motion.div>
            <h3 className="text-lg font-medium text-foreground mb-2">{t('bloodtest.emptyTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              {t('bloodtest.emptyDescription')}
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              <Upload weight="bold" className="w-4 h-4" />
              {t('bloodtest.importPdf')}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {t('bloodtest.dropHint')}
            </p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          {/* Health Score Hero */}
          {currentScore !== null && latestCompleted && (
            <HealthScoreCard
              score={currentScore}
              previousScore={previousScore}
              lastAnalysisDate={latestCompleted.created_at}
              totalAnalyses={analyses.length}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Timeline */}
            <div>
              <AnalysisTimeline
                analyses={analyses}
                selectedId={selectedAnalysis?.id || null}
                analyzingId={analyzing}
                onSelect={(a) => setSelectedAnalysis(a as BloodTestAnalysis)}
                onDelete={(id) => {
                  const a = analyses.find(x => x.id === id);
                  if (a) handleDeleteRequest(id, a.file_name);
                }}
                onUpload={handleUpload}
                uploading={uploading}
              />
            </div>

            {/* Right: Analysis details */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedAnalysis ? (
                  <motion.div
                    key={selectedAnalysis.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* PDF preview + Réanalyser */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewPdf(selectedAnalysis)}
                        className="flex-1 flex items-center gap-3 p-4 rounded-[16px] bg-card border border-border/50 hover:border-primary/30 transition-colors text-left"
                      >
                        <Eye weight="duotone" className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{selectedAnalysis.file_name}</p>
                          <p className="text-xs text-muted-foreground">{t('bloodtest.clickToOpen')}</p>
                        </div>
                      </button>

                      {selectedAnalysis.status === 'completed' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              disabled={analyzing === selectedAnalysis.id}
                              className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-[16px] border text-sm font-medium transition-all whitespace-nowrap",
                                analyzing === selectedAnalysis.id
                                  ? "bg-muted text-muted-foreground border-border/50"
                                  : "bg-card border-border/50 hover:border-primary/30 text-foreground"
                              )}
                            >
                              {analyzing === selectedAnalysis.id ? (
                                <Spinner className="w-4 h-4 animate-spin" />
                              ) : (
                                <ArrowsClockwise weight="bold" className="w-4 h-4" />
                              )}
                              {t('bloodtest.reanalyze')}
                              <CaretDown weight="bold" className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-border/50">
                            {AI_MODELS.map((m) => (
                              <DropdownMenuItem
                                key={m.model}
                                onClick={() => triggerAnalysis(selectedAnalysis.id, m.model)}
                                className="cursor-pointer"
                              >
                                <div>
                                  <p className="text-sm font-medium">{m.label}</p>
                                  <p className="text-xs text-muted-foreground">{m.description}</p>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {selectedAnalysis.status === 'completed' && selectedAnalysis.analysis_text ? (
                      <>
                        {/* Stat cards */}
                        <StatCards
                          abnormalCount={selectedAnalysis.abnormal_values?.length || 0}
                          deficiencyCount={selectedAnalysis.deficiencies?.length || 0}
                          supplementCount={selectedAnalysis.suggested_supplements?.length || 0}
                        />

                        {/* Abnormal values with improved badges */}
                        {selectedAnalysis.abnormal_values?.length > 0 && (
                          <div className="bg-card rounded-[16px] border border-border/50 p-5">
                            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                              <Warning weight="fill" className="w-5 h-5 text-amber-500" />
                              {t('bloodtest.abnormalValues')}
                            </h3>
                            <div className="space-y-3">
                              {selectedAnalysis.abnormal_values.map((v, i) => (
                                <div key={i} className={cn(
                                  "flex items-start gap-3 p-3 rounded-xl bg-muted/30 border-l-3",
                                  v.status === 'important' || v.status === 'critique' ? 'border-l-red-500' :
                                  v.status === 'modéré' || v.status === 'élevé' ? 'border-l-amber-500' :
                                  'border-l-yellow-500'
                                )}>
                                  {severityIcon(v.status)}
                                  <div className="flex-1">
                                    <div className="flex items-baseline gap-2 flex-wrap">
                                      <span className="font-medium text-foreground">{v.name}</span>
                                      <span className={`text-sm font-semibold ${severityColor(v.status)}`}>
                                        {v.value} {v.unit}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Réf: {v.reference}</p>
                                    <p className="text-sm text-foreground/80 mt-1">{v.interpretation}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Deficiencies */}
                        {selectedAnalysis.deficiencies?.length > 0 && (
                          <div className="bg-card rounded-[16px] border border-border/50 p-5">
                            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                              <TestTube weight="fill" className="w-5 h-5 text-primary" />
                              {t('bloodtest.deficiencies')}
                            </h3>
                            <div className="space-y-2">
                              {selectedAnalysis.deficiencies.map((d, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    d.severity === 'important' ? 'bg-red-500/10 text-red-500' :
                                    d.severity === 'modéré' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-yellow-500/10 text-yellow-500'
                                  )}>{d.severity}</span>
                                  <div>
                                    <p className="font-medium text-foreground">{d.name}</p>
                                    <p className="text-sm text-muted-foreground">{d.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested supplements */}
                        {selectedAnalysis.suggested_supplements?.length > 0 && (
                          <div className="bg-card rounded-[16px] border border-border/50 p-5">
                            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                              <Pill weight="fill" className="w-5 h-5 text-green-500" />
                              {t('bloodtest.suggestedSupplements')}
                            </h3>
                            <div className="space-y-2">
                              {selectedAnalysis.suggested_supplements.map((s, i) => (
                                <div key={i} className="p-3 rounded-xl bg-muted/30">
                                  <p className="font-medium text-foreground">{s.name}</p>
                                  <p className="text-sm text-muted-foreground">{s.reason}</p>
                                  {s.dosage_suggestion && (
                                    <p className="text-xs text-primary mt-1">💊 {s.dosage_suggestion}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Full analysis text */}
                        <div className="bg-card rounded-[16px] border border-border/50 p-5">
                          <h3 className="text-base font-semibold text-foreground mb-4">{t('bloodtest.fullAnalysis')}</h3>
                          <div className="prose prose-sm dark:prose-invert max-w-none font-light">
                            <ReactMarkdown>{selectedAnalysis.analysis_text}</ReactMarkdown>
                          </div>
                        </div>

                        {/* Disclaimer */}
                        <p className="text-xs text-muted-foreground text-center italic">
                          ⚠️ {t('bloodtest.disclaimer')}
                        </p>
                      </>
                    ) : (
                      <div className="bg-card rounded-[16px] border border-border/50 p-12 text-center">
                        <Spinner className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-foreground font-medium">{t('bloodtest.analyzing')}...</p>
                        <p className="text-sm text-muted-foreground mt-2">{t('bloodtest.analyzingDescription')}</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="bg-card rounded-[16px] border border-border/50 p-12 text-center">
                    <FileText weight="duotone" className="w-10 h-10 mx-auto mb-4 text-muted-foreground/40" />
                    <p className="text-muted-foreground">{t('bloodtest.selectAnalysis')}</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
