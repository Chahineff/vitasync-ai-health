import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Sparkle, Leaf, ArrowRight } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";

interface Nutrient {
  name: string;
  value: string;
  unit: string;
  note: string;
}

const nutrients: Nutrient[] = [
  { name: "Vitamin D", value: "25", unit: "ng/mL", note: "Often explored for mood & bone wellness" },
  { name: "Magnesium", value: "1.7", unit: "mg/dL", note: "Linked to sleep & relaxation routines" },
  { name: "B12", value: "320", unit: "pg/mL", note: "Commonly explored for daily energy" },
];

type Phase = "form" | "typing" | "thinking" | "results";

export function BiomarkerPreviewWidget() {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("form");
  const [typedName, setTypedName] = useState("");
  const [typedValue, setTypedValue] = useState("");
  const [visibleLines, setVisibleLines] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  const targetName = nutrients[0].name;
  const targetValue = nutrients[0].value;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (phase === "form") timer = setTimeout(() => setPhase("typing"), 900);
    return () => clearTimeout(timer!);
  }, [phase]);

  useEffect(() => {
    if (phase !== "typing") return;
    if (typedName.length < targetName.length) {
      const timer = setTimeout(() => setTypedName(targetName.slice(0, typedName.length + 1)), 90);
      return () => clearTimeout(timer);
    }
    if (typedValue.length < targetValue.length) {
      const timer = setTimeout(() => setTypedValue(targetValue.slice(0, typedValue.length + 1)), 140);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setPhase("thinking"), 600);
    return () => clearTimeout(timer);
  }, [phase, typedName, typedValue, targetName, targetValue]);

  useEffect(() => {
    if (phase !== "thinking") return;
    if (scanProgress >= 100) {
      const timer = setTimeout(() => setPhase("results"), 400);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setScanProgress((p) => Math.min(p + 5, 100)), 45);
    return () => clearTimeout(timer);
  }, [phase, scanProgress]);

  useEffect(() => {
    if (phase !== "results") return;
    if (visibleLines >= nutrients.length + 1) {
      const timer = setTimeout(() => {
        setPhase("form");
        setVisibleLines(0);
        setScanProgress(0);
        setTypedName("");
        setTypedValue("");
      }, 4000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleLines((v) => v + 1), 450);
    return () => clearTimeout(timer);
  }, [phase, visibleLines]);

  const showForm = phase === "form" || phase === "typing";
  const showThinking = phase === "thinking";
  const showResults = phase === "results";

  return (
    <div className="w-full h-full flex flex-col gap-1.5 sm:gap-2.5 p-0.5 sm:p-1">
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }}
            className="rounded-xl sm:rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl flex flex-col gap-2 sm:gap-2.5 flex-1 p-3 sm:p-4 shadow-xl">
            <div className="flex items-center gap-1.5">
              <Leaf weight="duotone" className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60">
                {t("preview.biomarker.dropHere")}
              </span>
            </div>

            {/* Nutrient name field */}
            <div className="space-y-0.5">
              <span className="text-[8px] uppercase tracking-wider text-foreground/40">Nutrient</span>
              <div className="h-7 rounded-md border border-border/60 bg-background/60 px-2 flex items-center text-xs text-foreground">
                {typedName}
                {phase === "typing" && typedName.length < targetName.length && (
                  <motion.span className="inline-block w-px h-3 bg-primary ml-0.5" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                )}
              </div>
            </div>

            {/* Value + unit */}
            <div className="flex gap-1.5">
              <div className="flex-1 space-y-0.5">
                <span className="text-[8px] uppercase tracking-wider text-foreground/40">Value</span>
                <div className="h-7 rounded-md border border-border/60 bg-background/60 px-2 flex items-center text-xs text-foreground">
                  {typedValue}
                  {phase === "typing" && typedName.length >= targetName.length && typedValue.length < targetValue.length && (
                    <motion.span className="inline-block w-px h-3 bg-primary ml-0.5" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                  )}
                </div>
              </div>
              <div className="w-[68px] space-y-0.5">
                <span className="text-[8px] uppercase tracking-wider text-foreground/40">Unit</span>
                <div className="h-7 rounded-md border border-border/60 bg-background/60 px-2 flex items-center justify-between text-[10px] text-foreground">
                  ng/mL
                </div>
              </div>
            </div>

            <button className="mt-0.5 flex items-center gap-1 text-[10px] text-foreground/50 hover:text-foreground/70 transition-colors">
              <Plus weight="bold" className="w-3 h-3" />
              <span>{t("preview.biomarker.dropFile")}</span>
            </button>

            <div className="mt-auto h-8 rounded-md bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-primary-foreground shadow">
              <Sparkle weight="fill" className="w-3 h-3" />
              Get wellness info
              <ArrowRight weight="bold" className="w-3 h-3" />
            </div>
          </motion.div>
        )}

        {showThinking && (
          <motion.div key="thinking" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-xl sm:rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl p-3 sm:p-4 shadow-xl flex flex-col items-center justify-center gap-2 sm:gap-3 flex-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}>
                <Sparkle weight="duotone" className="w-6 h-6 text-primary" />
              </motion.div>
            </div>
            <span className="text-[10px] font-medium text-foreground/60">{t("preview.biomarker.extracting")}</span>
            <div className="w-full max-w-[160px] space-y-1">
              <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full" style={{ width: `${scanProgress}%` }} />
              </div>
              <div className="text-[9px] text-foreground/40 text-center">{scanProgress}%</div>
            </div>
          </motion.div>
        )}

        {showResults && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2.5 flex-1">
            {visibleLines >= 1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl p-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-foreground/50">
                    {t("preview.biomarker.detected")}
                  </span>
                  <div className="flex gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 font-medium">{t("preview.biomarker.low")}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-medium">{t("preview.biomarker.ok")}</span>
                  </div>
                </div>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-2xl border border-border/40 bg-card/90 backdrop-blur-xl overflow-hidden shadow-xl flex-1">
              <div className="divide-y divide-border/20">
                {nutrients.map((nut, i) =>
                  visibleLines >= i + 2 ? (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="px-2 py-1.5 sm:px-3 sm:py-2 flex items-start gap-2">
                      <Leaf weight="duotone" className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-medium text-foreground truncate">{nut.name}</span>
                          <span className="text-[10px] font-semibold text-foreground/70 whitespace-nowrap">
                            {nut.value} <span className="text-[9px] font-normal text-foreground/40">{nut.unit}</span>
                          </span>
                        </div>
                        <p className="text-[9px] text-foreground/45 leading-snug mt-0.5">{nut.note}</p>
                      </div>
                    </motion.div>
                  ) : null
                )}
              </div>
            </motion.div>
            <p className="text-[8px] text-foreground/35 italic leading-snug px-1">
              General educational wellness info only — not a clinical interpretation or diagnosis.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
