import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Spinner, TestTube, Warning, Pill, Trash, Eye, CloudArrowUp } from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { BloodTestViewer } from './BloodTestViewer';

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

export function BloodTestSection() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<BloodTestAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<BloodTestAnalysis | null>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<BloodTestAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  // Core upload logic (shared between click and drag-and-drop)
  const uploadFile = async (file: File) => {
    if (!user) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Seuls les fichiers PDF sont acceptés');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 20 Mo');
      return;
    }

    setUploading(true);
    try {
      // Upload to dedicated blood-tests bucket
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, { contentType: 'application/pdf' });

      if (uploadError) throw uploadError;

      // Store the storage path (not a public URL since bucket is private)
      const storagePath = `${BUCKET_NAME}/${fileName}`;

      // Create record
      const { data: record, error: insertError } = await supabase
        .from('blood_test_analyses')
        .insert({
          user_id: user.id,
          file_url: storagePath,
          file_name: file.name,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Fichier uploadé ! Lancement de l\'analyse...');
      await fetchAnalyses();

      // Trigger analysis
      if (record) {
        triggerAnalysis(record.id);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
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

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const triggerAnalysis = async (analysisId: string) => {
    setAnalyzing(analysisId);
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-blood-test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({ analysisId }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }

      toast.success('Analyse terminée !');
      await fetchAnalyses();
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Erreur lors de l\'analyse IA');
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('blood_test_analyses').delete().eq('id', id);
    if (error) {
      toast.error('Erreur de suppression');
    } else {
      toast.success('Analyse supprimée');
      if (selectedAnalysis?.id === id) setSelectedAnalysis(null);
      fetchAnalyses();
    }
  };

  const getSignedUrl = async (fileUrl: string) => {
    // fileUrl format: "blood-tests/userId/timestamp_filename.pdf"
    const path = fileUrl.replace(`${BUCKET_NAME}/`, '');
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 3600); // 1 hour

    if (error || !data?.signedUrl) {
      toast.error('Impossible d\'ouvrir le fichier');
      return null;
    }
    return data.signedUrl;
  };

  const handleViewPdf = (analysis: BloodTestAnalysis) => {
    setViewingAnalysis(analysis);
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

  return (
    <div
      ref={dropRef}
      className="space-y-6 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
              <p className="text-lg font-medium text-primary">Déposez votre PDF ici</p>
              <p className="text-sm text-muted-foreground">Formats acceptés : PDF (max 20 Mo)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light tracking-tight text-foreground">Mes Analyses</h2>
        <label className="cursor-pointer">
          <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
          <div className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
            uploading ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}>
            {uploading ? <Spinner className="w-4 h-4 animate-spin" /> : <Upload weight="bold" className="w-4 h-4" />}
            {uploading ? 'Upload...' : 'Importer un PDF'}
          </div>
        </label>
      </div>

      {analyses.length === 0 ? (
        <label className="cursor-pointer block">
          <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
          <div className={cn(
            "bg-card rounded-[20px] border-2 border-dashed p-12 text-center transition-all",
            isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
          )}>
            <CloudArrowUp weight="duotone" className="w-14 h-14 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune analyse sanguine</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Importez vos résultats d'analyses sanguines en PDF pour obtenir une analyse IA personnalisée.
            </p>
            <p className="text-xs text-muted-foreground">
              Cliquez ici ou glissez-déposez un fichier PDF (max 20 Mo)
            </p>
          </div>
        </label>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: File list */}
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <motion.button
                key={analysis.id}
                onClick={() => setSelectedAnalysis(analysis)}
                className={cn(
                  "w-full text-left p-4 rounded-[16px] border transition-all",
                  selectedAnalysis?.id === analysis.id
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-card border-border/50 hover:border-border'
                )}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start gap-3">
                  <FileText weight="duotone" className="w-8 h-8 text-primary/60 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{analysis.file_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(analysis.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {analysis.status === 'pending' || analyzing === analysis.id ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-500">
                          <Spinner className="w-3 h-3 animate-spin" /> Analyse en cours
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-500">
                          ✓ Analysé
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(analysis.id); }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash weight="light" className="w-4 h-4" />
                  </button>
                </div>
              </motion.button>
            ))}

            {/* Upload more button */}
            <label className="cursor-pointer block">
              <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" disabled={uploading} />
              <div className="w-full p-4 rounded-[16px] border-2 border-dashed border-border/50 hover:border-primary/30 text-center transition-colors">
                <Upload weight="light" className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Ajouter une analyse</p>
              </div>
            </label>
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
                  {/* PDF preview link */}
                  <button
                    onClick={() => handleViewPdf(selectedAnalysis.file_url)}
                    className="w-full flex items-center gap-3 p-4 rounded-[16px] bg-card border border-border/50 hover:border-primary/30 transition-colors text-left"
                  >
                    <Eye weight="duotone" className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedAnalysis.file_name}</p>
                      <p className="text-xs text-muted-foreground">Cliquez pour ouvrir le PDF</p>
                    </div>
                  </button>

                  {selectedAnalysis.status === 'completed' && selectedAnalysis.analysis_text ? (
                    <>
                      {/* Abnormal values */}
                      {selectedAnalysis.abnormal_values?.length > 0 && (
                        <div className="bg-card rounded-[16px] border border-border/50 p-5">
                          <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                            <Warning weight="fill" className="w-5 h-5 text-amber-500" />
                            Valeurs anormales
                          </h3>
                          <div className="space-y-3">
                            {selectedAnalysis.abnormal_values.map((v, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                                <div className={`text-lg font-bold ${severityColor(v.status)}`}>!</div>
                                <div className="flex-1">
                                  <div className="flex items-baseline gap-2">
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
                            Déficiences détectées
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
                            Compléments suggérés
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
                        <h3 className="text-base font-semibold text-foreground mb-4">Analyse complète</h3>
                        <div className="prose prose-sm dark:prose-invert max-w-none font-light">
                          <ReactMarkdown>{selectedAnalysis.analysis_text}</ReactMarkdown>
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <p className="text-xs text-muted-foreground text-center italic">
                        ⚠️ Cette analyse est fournie à titre informatif uniquement et ne remplace pas un avis médical professionnel.
                      </p>
                    </>
                  ) : (
                    <div className="bg-card rounded-[16px] border border-border/50 p-12 text-center">
                      <Spinner className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
                      <p className="text-foreground font-medium">Analyse en cours...</p>
                      <p className="text-sm text-muted-foreground mt-2">VitaSync 3 Flash analyse vos résultats sanguins</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-card rounded-[16px] border border-border/50 p-12 text-center">
                  <FileText weight="duotone" className="w-10 h-10 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="text-muted-foreground">Sélectionnez une analyse pour voir les résultats</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
