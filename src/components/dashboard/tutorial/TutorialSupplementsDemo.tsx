import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pill, Sun, Moon, Check, ChartBar, CalendarBlank, Brain, Star, Lightning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const SUPPLEMENTS = [
  { name: "Créatine Monohydrate", dosage: "5g", group: "morning" },
  { name: "Vitamine D3", dosage: "2000 UI", group: "morning" },
  { name: "Oméga-3 EPA/DHA", dosage: "1000mg", group: "noon" },
  { name: "Magnésium Bisglycinate", dosage: "400mg", group: "evening" },
  { name: "Zinc Picolinate", dosage: "15mg", group: "evening" },
];

const GROUPS = [
  { key: "morning", label: "Matin", icon: <Sun weight="light" className="w-4 h-4 text-secondary" /> },
  { key: "noon", label: "Midi", icon: <Sun weight="fill" className="w-4 h-4 text-amber-500" /> },
  { key: "evening", label: "Soir", icon: <Moon weight="light" className="w-4 h-4 text-primary" /> },
];

export function TutorialSupplementsDemo() {
  const [checked, setChecked] = useState<string[]>([]);

  // Auto-check supplements one by one
  useEffect(() => {
    const timers = SUPPLEMENTS.map((s, i) =>
      setTimeout(() => setChecked(prev => [...prev, s.name]), 800 + i * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const takenCount = checked.length;
  const totalCount = SUPPLEMENTS.length;
  const progressPercent = Math.round((takenCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light tracking-tight text-foreground">Suppléments</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Tracker */}
        <div className="lg:col-span-3">
          <div className="glass-card-premium rounded-3xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Pill weight="light" className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-light tracking-tight text-foreground">Suivi des compléments</h3>
                  <p className="text-xs text-foreground/50 font-light">{takenCount}/{totalCount} pris aujourd'hui</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid w-full grid-cols-3 bg-white/5 rounded-xl p-1 mb-4">
              <div className="rounded-lg bg-white/10 text-foreground font-light text-sm h-9 flex items-center justify-center gap-1.5">
                <Sun weight="light" className="w-4 h-4 shrink-0" /> Jour
              </div>
              <div className="rounded-lg text-foreground/60 font-light text-sm h-9 flex items-center justify-center gap-1.5">
                <ChartBar weight="light" className="w-4 h-4 shrink-0" /> Semaine
              </div>
              <div className="rounded-lg text-foreground/60 font-light text-sm h-9 flex items-center justify-center gap-1.5">
                <CalendarBlank weight="light" className="w-4 h-4 shrink-0" /> Mois
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                />
              </div>
            </div>

            {/* Groups */}
            <div className="space-y-4">
              {GROUPS.map(group => {
                const items = SUPPLEMENTS.filter(s => s.group === group.key);
                if (!items.length) return null;
                return (
                  <div key={group.key}>
                    <div className="flex items-center gap-2 mb-3">
                      {group.icon}
                      <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">{group.label}</span>
                    </div>
                    <div className="space-y-2">
                      {items.map((s) => {
                        const isChecked = checked.includes(s.name);
                        return (
                          <motion.div
                            key={s.name}
                            animate={isChecked ? { scale: [1, 1.02, 1] } : {}}
                            transition={{ duration: 0.3 }}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border transition-all",
                              isChecked ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/10"
                            )}
                          >
                            <motion.div
                              animate={isChecked ? { scale: [1, 1.3, 1] } : {}}
                              className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                isChecked ? "bg-emerald-500 border-emerald-500" : "border-foreground/30"
                              )}
                            >
                              {isChecked && <Check weight="bold" className="w-3 h-3 text-white" />}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-light text-foreground truncate", isChecked && "line-through text-foreground/50")}>{s.name}</p>
                              <p className="text-xs text-foreground/40">{s.dosage}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Insights card */}
        <div className="lg:col-span-2">
          <div className="glass-card-premium rounded-3xl p-6 border border-white/10 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Brain weight="duotone" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-light tracking-tight text-foreground">Analyse IA</h3>
                <p className="text-xs text-foreground/50 font-light">Propulsé par VitaSync AI</p>
              </div>
            </div>

            {/* Score */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
                <Star weight="fill" className="w-4 h-4 text-secondary" />
                <span className="text-lg font-medium text-foreground">85/100</span>
              </div>
              <p className="text-sm text-foreground/50 mt-2 font-light">Score de régularité</p>
            </div>

            {/* Reviews */}
            <div className="space-y-3">
              {[
                { name: "Créatine", utility: "Essentiel", icon: "💪" },
                { name: "Magnésium", utility: "Très utile", icon: "😴" },
                { name: "Oméga-3", utility: "Recommandé", icon: "🧠" },
              ].map(r => (
                <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-lg">{r.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-light text-foreground">{r.name}</p>
                    <p className="text-xs text-foreground/40">{r.utility}</p>
                  </div>
                  <Lightning weight="fill" className="w-4 h-4 text-secondary" />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-foreground/60 font-light leading-relaxed">
                💡 Ta routine est bien équilibrée. Pense à prendre ton Oméga-3 avec un repas contenant des lipides pour une meilleure absorption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
