import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, DownloadSimple, Spinner, Warning, TestTube, Pill, FileText, ArrowsOut, ArrowsIn, MagnifyingGlassPlus, MagnifyingGlassMinus, X } from '@phosphor-icons/react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

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
const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

const severityColor = (severity: string) => {
  switch (severity) {
    case 'important': case 'critique': return 'text-red-500';
    case 'modéré': case 'élevé': return 'text-amber-500';
    default: return 'text-yellow-500';
  }
};

// ── AI Analysis Panel (reused in both modes) ──
function AiAnalysisPanel({ analysis, hasResults }: { analysis: BloodTestAnalysis; hasResults: boolean }) {
  return (
    <>
      {hasResults ? (
        <>
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
                      "text-xs px-2 py-0.5 rounded-full font-medium shrink-0",
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
    </>
  );
}

// ── Fullscreen Overlay ──
function FullscreenViewer({ pdfUrl, fileName, analysis, hasResults, onClose }: {
  pdfUrl: string;
  fileName: string;
  analysis: BloodTestAnalysis;
  hasResults: boolean;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(2); // index into ZOOM_LEVELS → 100%

  const zoomIn = () => setZoom((z) => Math.min(z + 1, ZOOM_LEVELS.length - 1));
  const zoomOut = () => setZoom((z) => Math.max(z - 1, 0));

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const scale = ZOOM_LEVELS[zoom];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex flex-col"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <FileText weight="duotone" className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-none">{fileName}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <button onClick={zoomOut} disabled={zoom === 0}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30">
            <MagnifyingGlassMinus weight="bold" className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-muted-foreground w-12 text-center tabular-nums">{scale}%</span>
          <button onClick={zoomIn} disabled={zoom === ZOOM_LEVELS.length - 1}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30">
            <MagnifyingGlassPlus weight="bold" className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-border/50 mx-2" />

          <button onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <X weight="bold" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF */}
        <div className="flex-1 overflow-auto relative">
          <div
            className="origin-top-left transition-transform duration-200"
            style={{
              width: `${scale}%`,
              height: `${scale}%`,
              minHeight: '100%',
            }}
          >
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full"
              title={fileName}
              style={{ border: 'none', minHeight: '100vh' }}
            />
          </div>
        </div>

        {/* AI sidebar */}
        <div className="w-[380px] max-w-[40vw] border-l border-border/50 bg-card/50 overflow-y-auto p-4 space-y-4 hidden lg:block">
          <div className="px-3 py-2 rounded-[12px] bg-muted/30 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Analyse IA</p>
          </div>
          <AiAnalysisPanel analysis={analysis} hasResults={hasResults} />
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

// ── PDF Toolbar (zoom + fullscreen) ──
function PdfToolbar({ zoom, onZoomIn, onZoomOut, onFullscreen, maxZoom }: {
  zoom: number; onZoomIn: () => void; onZoomOut: () => void; onFullscreen: () => void; maxZoom: number;
}) {
  return (
    <div className="px-4 py-2 border-b border-border/50 bg-muted/30 flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aperçu du document</p>
      <div className="flex items-center gap-1">
        <button onClick={onZoomOut} disabled={zoom === 0}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30">
          <MagnifyingGlassMinus weight="bold" className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-medium text-muted-foreground w-10 text-center tabular-nums">{ZOOM_LEVELS[zoom]}%</span>
        <button onClick={onZoomIn} disabled={zoom === maxZoom}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30">
          <MagnifyingGlassPlus weight="bold" className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-border/50 mx-1" />
        <button onClick={onFullscreen}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Plein écran">
          <ArrowsOut weight="bold" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Main Viewer ──
export function BloodTestViewer({ analysis, onBack }: BloodTestViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [zoom, setZoom] = useState(2); // 100%
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 1, ZOOM_LEVELS.length - 1)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 1, 0)), []);

  const hasResults = analysis.status === 'completed' && analysis.analysis_text;
  const scale = ZOOM_LEVELS[zoom];

  return (
    <>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => pdfUrl && setIsFullscreen(true)}
              disabled={!pdfUrl}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-muted/50 text-foreground hover:bg-muted transition-colors disabled:opacity-50 border border-border/50"
            >
              <ArrowsOut weight="bold" className="w-4 h-4" />
              <span className="hidden sm:inline">Plein écran</span>
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

        {/* Split view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '70vh' }}>
          {/* PDF Preview */}
          <div className="bg-card rounded-[16px] border border-border/50 overflow-hidden flex flex-col">
            <PdfToolbar
              zoom={zoom}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onFullscreen={() => pdfUrl && setIsFullscreen(true)}
              maxZoom={ZOOM_LEVELS.length - 1}
            />
            <div className="flex-1 relative overflow-auto">
              {loadingPdf ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : pdfUrl ? (
                <div
                  className="origin-top-left transition-transform duration-200"
                  style={{
                    width: `${scale}%`,
                    height: `${scale}%`,
                    minHeight: '100%',
                  }}
                >
                  <iframe
                    src={`${pdfUrl}#toolbar=0&navpanes=0`}
                    className="w-full h-full min-h-[60vh]"
                    title={analysis.file_name}
                    style={{ border: 'none' }}
                  />
                </div>
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
            <AiAnalysisPanel analysis={analysis} hasResults={!!hasResults} />
          </div>
        </div>
      </motion.div>

      {/* Fullscreen portal */}
      <AnimatePresence>
        {isFullscreen && pdfUrl && (
          <FullscreenViewer
            pdfUrl={pdfUrl}
            fileName={analysis.file_name}
            analysis={analysis}
            hasResults={!!hasResults}
            onClose={() => setIsFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
