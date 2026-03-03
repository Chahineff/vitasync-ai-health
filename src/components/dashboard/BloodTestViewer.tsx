import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DownloadSimple, Spinner, Warning, TestTube, Pill, FileText } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

interface BloodTestViewerProps {
  analysis: BloodTestAnalysis;
  onBack: () => void;
}

const BUCKET_NAME = 'blood-tests';

const severityColor = (severity: string) => {
  switch (severity) {
    case 'important': case 'critique': return 'text-red-500';
    case 'modéré': case 'élevé': return 'text-amber-500';
    default: return 'text-yellow-500';
  }
};

export function BloodTestViewer({ analysis, onBack }: BloodTestViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      setLoadingPdf(true);
      const path = analysis.file_url.replace(`${BUCKET_NAME}/`, '');
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(path, 3600);

      if (error || !data?.signedUrl) {
        toast.error("Impossible de charger le PDF");
        setLoadingPdf(false);
        return;
      }
      setPdfUrl(data.signedUrl);
      setLoadingPdf(false);
    };
    loadPdf();
  }, [analysis.file_url]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = analysis.file_name;
    a.target = '_blank';
    a.click();
  };

  const hasResults = analysis.status === 'completed' && analysis.analysis_text;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft weight="bold" className="w-4 h-4" />
          Retour aux analyses
        </button>
        <button
          onClick={handleDownload}
          disabled={!pdfUrl}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <DownloadSimple weight="bold" className="w-4 h-4" />
          Télécharger
        </button>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <FileText weight="duotone" className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-lg font-medium text-foreground">{analysis.file_name}</h3>
          <p className="text-xs text-muted-foreground">
            {new Date(analysis.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Split view: PDF left, AI right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '70vh' }}>
        {/* PDF Preview */}
        <div className="bg-card rounded-[16px] border border-border/50 overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-border/50 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aperçu du document</p>
          </div>
          <div className="flex-1 relative">
            {loadingPdf ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full min-h-[60vh]"
                title={analysis.file_name}
                style={{ border: 'none' }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Impossible de charger le PDF
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-1">
          <div className="px-4 py-2.5 rounded-[12px] bg-muted/30 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analyse IA</p>
          </div>

          {hasResults ? (
            <>
              {/* Abnormal values */}
              {analysis.abnormal_values?.length > 0 && (
                <div className="bg-card rounded-[16px] border border-border/50 p-5">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                    <Warning weight="fill" className="w-5 h-5 text-amber-500" />
                    Valeurs anormales
                  </h3>
                  <div className="space-y-3">
                    {analysis.abnormal_values.map((v, i) => (
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
              {analysis.deficiencies?.length > 0 && (
                <div className="bg-card rounded-[16px] border border-border/50 p-5">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                    <TestTube weight="fill" className="w-5 h-5 text-primary" />
                    Déficiences détectées
                  </h3>
                  <div className="space-y-2">
                    {analysis.deficiencies.map((d, i) => (
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
              {analysis.suggested_supplements?.length > 0 && (
                <div className="bg-card rounded-[16px] border border-border/50 p-5">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-foreground mb-4">
                    <Pill weight="fill" className="w-5 h-5 text-green-500" />
                    Compléments suggérés
                  </h3>
                  <div className="space-y-2">
                    {analysis.suggested_supplements.map((s, i) => (
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
                  <ReactMarkdown>{analysis.analysis_text!}</ReactMarkdown>
                </div>
              </div>

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
        </div>
      </div>
    </motion.div>
  );
}
