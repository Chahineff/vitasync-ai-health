import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Lightning, Brain, ArrowRight, Microphone, TrendUp, Package, TestTube, Storefront } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

/* ── Circular Progress ── */
function CircularProgress({ value, max, colorClass, delay = 0 }: { value: number; max: number; colorClass: string; delay?: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90">
      <circle cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
      <motion.circle
        cx="24" cy="24" r={radius} fill="none" strokeWidth="3" strokeLinecap="round"
        className={colorClass}
        stroke="currentColor"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - progress }}
        transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ── MetricCard ── */
function MetricCard({ icon, label, value, trend, colorClass, bgClass, delay = 0 }: {
  icon: React.ReactNode; label: string; value: number; trend: number;
  colorClass: string; bgClass: string; delay?: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <div className={cn("p-2 rounded-lg", bgClass)}>{icon}</div>
      <div className="relative flex items-center justify-center">
        <CircularProgress value={value} max={5} colorClass={colorClass} delay={delay} />
        <motion.span
          className="absolute text-sm font-bold text-foreground"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.3 }}
          style={{ transform: "rotate(90deg)" }}
        >
          {value}
        </motion.span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <TrendUp weight="bold" className="w-3 h-3 text-primary" />
        <span>moy. {trend.toFixed(1)}</span>
      </div>
    </motion.div>
  );
}

export function TutorialHomeDemo() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-foreground mb-1">
          Bonjour <span className="text-primary font-medium">User</span>, prêt pour ta routine ?
        </h1>
        <p className="text-sm text-foreground/50 font-light capitalize">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* DailyCheckinWidget replica */}
      <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.1 }}>
        <Card className="glass-card-premium rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-foreground">Mon suivi du jour</h3>
              <p className="text-sm text-muted-foreground">Tendances sur 7 jours</p>
            </div>
            <button className="gap-2 px-3 py-1.5 rounded-lg text-sm text-foreground/60 bg-white/5 border border-white/10 flex items-center">
              ✏️ Modifier
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard
              icon={<Moon weight="duotone" className="w-5 h-5 text-indigo-400" />}
              label="Sommeil" value={4} trend={3.8}
              colorClass="text-indigo-400" bgClass="bg-indigo-500/15" delay={0}
            />
            <MetricCard
              icon={<Lightning weight="duotone" className="w-5 h-5 text-amber-400" />}
              label="Énergie" value={3} trend={3.2}
              colorClass="text-amber-400" bgClass="bg-amber-500/15" delay={0.08}
            />
            <MetricCard
              icon={<Brain weight="duotone" className="w-5 h-5 text-rose-400" />}
              label="Stress" value={2} trend={2.5}
              colorClass="text-rose-400" bgClass="bg-rose-500/15" delay={0.16}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Humeur :</span>
            <span className="text-sm font-medium text-foreground">Bien</span>
          </div>
        </Card>
      </motion.div>

      {/* QuickCoachWidget replica */}
      <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.22 }}>
        <div className="glass-card-premium rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <motion.div
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={vitasyncLogo} alt="VitaSync" className="w-8 h-8 object-contain" />
              </motion.div>
              <div>
                <h3 className="text-xl font-light tracking-tight text-foreground mb-1">Coach IA Personnel</h3>
                <p className="text-sm text-foreground/60 font-light max-w-md">
                  User, posez vos questions sur votre santé, nutrition ou routine bien-être.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="group flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25">
                <span>Parler au Coach</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-foreground/40">
                <Microphone weight="light" className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-foreground/50 font-light">
              <div className="w-2 h-2 rounded-full bg-secondary animate-breathe" />
              <span>Coach IA prêt à vous aider</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 1: Supplement Tracker + Shop Preview */}
      <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.34 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supplement Tracker preview */}
          <div className="glass-card-premium rounded-3xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <span className="text-secondary text-lg">💊</span>
              </div>
              <div>
                <h3 className="text-lg font-light tracking-tight text-foreground">Suivi des compléments</h3>
                <p className="text-xs text-foreground/50 font-light">2/3 pris aujourd'hui</p>
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div initial={{ width: 0 }} animate={{ width: "66%" }} transition={{ duration: 0.5, delay: 0.4 }}
                className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" />
            </div>
            <div className="space-y-2">
              {[
                { name: "Créatine Monohydrate", time: "Matin", checked: true },
                { name: "Magnésium Bisglycinate", time: "Soir", checked: true },
                { name: "Oméga-3 EPA/DHA", time: "Midi", checked: false },
              ].map((s) => (
                <div key={s.name} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all",
                  s.checked ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/10"
                )}>
                  <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    s.checked ? "bg-emerald-500 border-emerald-500" : "border-foreground/30"
                  )}>
                    {s.checked && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-foreground truncate">{s.name}</p>
                    <p className="text-xs text-foreground/40">{s.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shop/Boutique preview widget */}
          <div className="glass-card-premium rounded-3xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Storefront weight="light" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-light tracking-tight text-foreground">Boutique</h3>
                <p className="text-xs text-foreground/50 font-light">Compléments adaptés à ton profil</p>
              </div>
            </div>
            <div className="space-y-3">
              {["Créatine Monohydrate", "Whey Isolate", "Ashwagandha KSM-66"].map((name, i) => (
                <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">💊</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-foreground truncate">{name}</p>
                    <p className="text-xs text-foreground/40">{["29,99 €", "44,99 €", "27,99 €"][i]}</p>
                  </div>
                  <div className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-medium border border-primary/20">
                    Voir
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 2: MyStack Preview + Analyses Preview */}
      <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.46 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MyStack Preview */}
          <div className="glass-card-premium rounded-3xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Package weight="light" className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-light tracking-tight text-foreground">Mon Stack</h3>
                <p className="text-xs text-foreground/50 font-light">4 compléments actifs</p>
              </div>
            </div>
            <div className="space-y-2">
              {["Créatine", "Whey Isolate", "Magnésium", "Oméga-3"].map(name => (
                <div key={name} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                  <p className="text-sm font-light text-foreground">{name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Analyses Preview */}
          <div className="glass-card-premium rounded-3xl p-4 md:p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TestTube weight="light" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-light tracking-tight text-foreground">Mes Analyses</h3>
                <p className="text-xs text-foreground/50 font-light">Dernier bilan analysé</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-light text-foreground">bilan_fevrier_2026.pdf</p>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                  Analysé ✓
                </div>
              </div>
              <p className="text-xs text-foreground/40">2 valeurs hors normes · 2 compléments suggérés</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
