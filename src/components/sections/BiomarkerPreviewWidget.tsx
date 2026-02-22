import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, ArrowUp, ArrowDown, Minus, UploadSimple } from "@phosphor-icons/react";

interface Biomarker {
  name: string;
  value: string;
  unit: string;
  status: "optimal" | "low" | "high";
  range: string;
  bar: number;
}

const biomarkers: Biomarker[] = [
  { name: "Vitamine D", value: "28", unit: "ng/mL", status: "low", range: "30–80", bar: 30 },
  { name: "Ferritine", value: "85", unit: "ng/mL", status: "optimal", range: "30–150", bar: 55 },
  { name: "Magnésium", value: "1.7", unit: "mg/dL", status: "low", range: "1.8–2.6", bar: 20 },
  { name: "Zinc", value: "95", unit: "µg/dL", status: "optimal", range: "70–120", bar: 60 },
  { name: "B12", value: "180", unit: "pg/mL", status: "low", range: "300–900", bar: 15 },
];

const statusColors = {
  optimal: "text-emerald-500",
  low: "text-amber-500",
  high: "text-red-400",
};

const statusBg = {
  optimal: "bg-emerald-500",
  low: "bg-amber-500",
  high: "bg-red-400",
};

const StatusIcon = ({ status }: { status: string }) => {
  const cls = "w-3 h-3";
  if (status === "optimal") return <Minus weight="bold" className={`${cls} text-emerald-500`} />;
  if (status === "low") return <ArrowDown weight="bold" className={`${cls} text-amber-500`} />;
  return <ArrowUp weight="bold" className={`${cls} text-red-400`} />;
};

// Phases: dropzone → dragging → dropped → scanning → results
type Phase = "dropzone" | "dragging" | "dropped" | "scanning" | "results";

export function BiomarkerPreviewWidget() {
  const [phase, setPhase] = useState<Phase>("dropzone");
  const [visibleLines, setVisibleLines] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  // Phase machine
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "dropzone") {
      timer = setTimeout(() => setPhase("dragging"), 1200);
    } else if (phase === "dragging") {
      timer = setTimeout(() => setPhase("dropped"), 1400);
    } else if (phase === "dropped") {
      timer = setTimeout(() => setPhase("scanning"), 600);
    } else if (phase === "scanning") {
      // handled by scan progress effect
    } else if (phase === "results") {
      // handled by visible lines effect
    }

    return () => clearTimeout(timer);
  }, [phase]);

  // Scan progress
  useEffect(() => {
    if (phase !== "scanning") return;
    if (scanProgress >= 100) {
      const timer = setTimeout(() => setPhase("results"), 400);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setScanProgress((p) => Math.min(p + 4, 100)), 50);
    return () => clearTimeout(timer);
  }, [phase, scanProgress]);

  // Results reveal
  useEffect(() => {
    if (phase !== "results") return;
    if (visibleLines >= biomarkers.length + 1) {
      const timer = setTimeout(() => {
        setPhase("dropzone");
        setVisibleLines(0);
        setScanProgress(0);
      }, 4000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleLines((v) => v + 1), 400);
    return () => clearTimeout(timer);
  }, [phase, visibleLines]);

  const showDropzone = phase === "dropzone" || phase === "dragging" || phase === "dropped";
  const showScanning = phase === "scanning";
  const showResults = phase === "results";

  return (
    <div className="w-full h-full flex flex-col gap-2.5 p-1">
      <AnimatePresence mode="wait">
        {/* Drop zone phase */}
        {showDropzone && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border-2 border-dashed border-border/50 bg-card/60 backdrop-blur-xl flex flex-col items-center justify-center gap-3 flex-1 relative overflow-hidden"
          >
            {/* Pulsing drop zone highlight when dragging */}
            {phase === "dragging" && (
              <motion.div
                className="absolute inset-0 bg-primary/5 rounded-2xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}

            {/* Upload icon */}
            <motion.div
              animate={phase === "dragging" ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center"
            >
              <UploadSimple weight="light" className="w-5 h-5 text-foreground/30" />
            </motion.div>

            <span className="text-[10px] text-foreground/40 font-medium">
              {phase === "dropzone" ? "Glissez votre PDF ici" : phase === "dragging" ? "Déposez le fichier..." : ""}
            </span>

            {/* The dragging file thumbnail */}
            {(phase === "dragging" || phase === "dropped") && (
              <motion.div
                className="absolute"
                initial={{ x: 80, y: -60, rotate: -8, scale: 0.7, opacity: 0 }}
                animate={
                  phase === "dropped"
                    ? { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
                    : { x: 30, y: -20, rotate: -5, scale: 0.85, opacity: 1 }
                }
                transition={
                  phase === "dropped"
                    ? { type: "spring", stiffness: 300, damping: 20 }
                    : { duration: 0.6, ease: "easeOut" }
                }
              >
                <div className="w-16 h-20 rounded-lg bg-card border border-border shadow-xl flex flex-col items-center justify-center gap-1 relative">
                  {/* PDF corner fold */}
                  <div className="absolute top-0 right-0 w-4 h-4 bg-muted rounded-bl-lg border-l border-b border-border/50" />
                  <FileText weight="fill" className="w-6 h-6 text-red-400" />
                  <span className="text-[7px] font-bold text-red-400 uppercase">PDF</span>
                  <span className="text-[6px] text-foreground/40 truncate max-w-[50px]">bilan_sang.pdf</span>
                </div>
              </motion.div>
            )}

            {/* Drop ripple effect */}
            {phase === "dropped" && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary/40"
                initial={{ opacity: 1, scale: 0.95 }}
                animate={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </motion.div>
        )}

        {/* Scanning phase */}
        {showScanning && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl p-4 shadow-xl flex flex-col items-center justify-center gap-3 flex-1"
          >
            {/* Animated file with scan line */}
            <div className="relative w-14 h-18">
              <div className="w-14 h-[72px] rounded-lg bg-card border border-border/60 flex flex-col items-center justify-center gap-1 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-4 h-4 bg-muted rounded-bl-lg border-l border-b border-border/50" />
                {/* Fake text lines */}
                <div className="space-y-1 px-2 w-full mt-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[2px] bg-foreground/10 rounded-full" style={{ width: `${60 + i * 8}%` }} />
                  ))}
                </div>
                {/* Scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>

            <span className="text-[10px] font-medium text-foreground/60">
              Extraction des biomarqueurs...
            </span>

            {/* Progress */}
            <div className="w-full max-w-[160px] space-y-1">
              <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="text-[9px] text-foreground/40 text-center">{scanProgress}%</div>
            </div>
          </motion.div>
        )}

        {/* Results phase */}
        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2.5 flex-1"
          >
            {visibleLines >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl p-3 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/50">
                    5 biomarqueurs détectés
                  </span>
                  <div className="flex gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-medium">3 bas</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-medium">2 ok</span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl overflow-hidden shadow-xl flex-1"
            >
              <div className="divide-y divide-border/20">
                {biomarkers.map((bm, i) =>
                  visibleLines >= i + 2 ? (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="px-3 py-2 flex items-center gap-2"
                    >
                      <StatusIcon status={bm.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-medium text-foreground">{bm.name}</span>
                          <span className={`text-xs font-semibold ${statusColors[bm.status]}`}>
                            {bm.value} <span className="text-[9px] font-normal text-foreground/40">{bm.unit}</span>
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <div className="flex-1 h-1 bg-muted/60 rounded-full relative overflow-hidden">
                            <motion.div
                              className={`absolute inset-y-0 left-0 rounded-full ${statusBg[bm.status]}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${bm.bar}%` }}
                              transition={{ duration: 0.6, delay: 0.1 }}
                            />
                          </div>
                          <span className="text-[8px] text-foreground/30 whitespace-nowrap">{bm.range}</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : null
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
