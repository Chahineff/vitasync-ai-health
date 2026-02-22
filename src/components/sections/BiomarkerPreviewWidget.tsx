import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, ArrowUp, ArrowDown, Minus } from "@phosphor-icons/react";

interface Biomarker {
  name: string;
  value: string;
  unit: string;
  status: "optimal" | "low" | "high";
  range: string;
  bar: number; // 0-100 position in range
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

export function BiomarkerPreviewWidget() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showScan, setShowScan] = useState(true);

  useEffect(() => {
    // Show scan phase first, then reveal lines
    const scanTimer = setTimeout(() => {
      setShowScan(false);
    }, 1800);

    return () => clearTimeout(scanTimer);
  }, []);

  useEffect(() => {
    if (showScan) return;
    if (visibleLines >= biomarkers.length + 1) {
      const resetTimer = setTimeout(() => {
        setVisibleLines(0);
        setShowScan(true);
      }, 4000);
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(() => {
      setVisibleLines((v) => v + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [showScan, visibleLines]);

  return (
    <div className="w-full h-full flex flex-col gap-2.5 p-1">
      {/* Upload/scan phase */}
      {showScan && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl p-4 shadow-xl flex flex-col items-center justify-center gap-3 flex-1"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20"
          >
            <FileText weight="light" className="w-6 h-6 text-primary" />
          </motion.div>
          <span className="text-xs font-medium text-foreground/60">Analyse du PDF...</span>
          <div className="w-full max-w-[140px] h-1 bg-muted/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* Results */}
      {!showScan && (
        <>
          {/* Summary header */}
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

          {/* Biomarker list */}
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
                      {/* Range bar */}
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
        </>
      )}
    </div>
  );
}
