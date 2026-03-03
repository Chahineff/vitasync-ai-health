import { motion } from "framer-motion";
import { TestTube, UploadSimple, FileText, CheckCircle, Clock, Warning, ArrowsClockwise, CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

const ANALYSES = [
  {
    fileName: "bilan_sanguin_fevrier_2026.pdf",
    date: "15 février 2026",
    status: "analyzed" as const,
    summary: "Bilan globalement bon. Quelques points d'attention identifiés.",
    abnormals: [
      { name: "Vitamine D", value: "18 ng/mL", ref: "30-100 ng/mL", severity: "low" },
      { name: "Ferritine", value: "12 µg/L", ref: "20-300 µg/L", severity: "low" },
    ],
    suggestions: ["Vitamine D3 2000 UI/jour", "Fer bisglycinate 25mg/jour"],
  },
  {
    fileName: "analyse_thyroide_jan_2026.pdf",
    date: "8 janvier 2026",
    status: "analyzed" as const,
    summary: "Fonction thyroïdienne normale. TSH et T4 dans les normes.",
    abnormals: [],
    suggestions: [],
  },
  {
    fileName: "bilan_complet_dec_2025.pdf",
    date: "20 décembre 2025",
    status: "pending" as const,
    summary: null,
    abnormals: [],
    suggestions: [],
  },
];

export function TutorialAnalysesDemo() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-light tracking-tight text-foreground mb-1">Mes Analyses Sanguines</h2>
        <p className="text-sm text-foreground/50 font-light">Importe tes bilans et laisse l'IA les décrypter</p>
      </div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 flex flex-col items-center gap-4"
      >
        <motion.div
          className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <UploadSimple weight="duotone" className="w-8 h-8 text-primary" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground mb-1">Glisse ton fichier PDF ici</p>
          <p className="text-xs text-foreground/40">ou clique pour sélectionner • PDF uniquement • 10 Mo max</p>
        </div>
        <div className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20">
          Importer un bilan
        </div>
      </motion.div>

      {/* Analysis List */}
      <div className="space-y-4">
        {ANALYSES.map((analysis, i) => (
          <motion.div
            key={analysis.fileName}
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass-card-premium rounded-2xl border border-white/10 overflow-hidden"
          >
            {/* Header row */}
            <div className="p-5 flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                analysis.status === "analyzed" ? "bg-emerald-500/10" : "bg-amber-500/10"
              )}>
                <FileText weight="duotone" className={cn(
                  "w-6 h-6",
                  analysis.status === "analyzed" ? "text-emerald-400" : "text-amber-400"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-light text-foreground truncate">{analysis.fileName}</p>
                <p className="text-xs text-foreground/40">{analysis.date}</p>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
                analysis.status === "analyzed"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}>
                {analysis.status === "analyzed" ? (
                  <><CheckCircle weight="bold" className="w-3.5 h-3.5" /> Analysé</>
                ) : (
                  <><Clock weight="bold" className="w-3.5 h-3.5" /> En attente</>
                )}
              </div>
            </div>

            {/* Expanded details for first analysis */}
            {i === 0 && analysis.status === "analyzed" && (
              <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
                {/* AI Summary */}
                <div className="flex items-start gap-3">
                  <img src={vitasyncLogo} alt="" className="w-6 h-6 mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/70 font-light leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Abnormal values */}
                {analysis.abnormals.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Valeurs hors normes</p>
                    {analysis.abnormals.map(ab => (
                      <div key={ab.name} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                        <Warning weight="duotone" className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-light text-foreground">{ab.name}</p>
                          <p className="text-xs text-foreground/40">Résultat: <span className="text-amber-400 font-medium">{ab.value}</span> · Réf: {ab.ref}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground/50 uppercase tracking-wider">Compléments suggérés</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.suggestions.map(s => (
                        <div key={s} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-foreground/60 text-xs font-medium border border-white/10">
                    <ArrowsClockwise weight="bold" className="w-3.5 h-3.5" /> Réanalyser
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-foreground/40 text-xs border border-white/10">
                    Modèle: Gemini 2.5 Pro <CaretDown weight="bold" className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
