import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Lightning, Brain, ArrowRight, Microphone, ChartDonut, TrendUp, Calendar } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

/* ── Circular Progress (replica of DailyCheckinWidget) ── */
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

/* ── MetricCard (replica) ── */
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

/* ── CountUp (replica of ProgressChart) ── */
function CountUpNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span className="text-2xl font-light text-foreground">{display}%</span>;
}

export function TutorialHomeDemo() {
  const weeklyData = [
    { day: "L", value: 100 }, { day: "M", value: 80 }, { day: "M", value: 100 },
    { day: "J", value: 60 }, { day: "V", value: 100 }, { day: "S", value: 40 }, { day: "D", value: 0 },
  ];

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

      {/* Grid: SupplementTracker + ProgressChart replicas */}
      <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.34 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simplified Supplement Tracker preview */}
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
              ].map((s, i) => (
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

          {/* ProgressChart replica */}
          <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ChartDonut weight="light" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-light tracking-tight text-foreground">Progression Santé</h3>
                  <p className="text-xs text-foreground/50 font-light">Cette semaine</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-secondary text-sm font-medium">
                <TrendUp weight="bold" className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </div>
            {/* Donut */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                  <motion.circle cx="60" cy="60" r="48" fill="none" strokeWidth="8" strokeLinecap="round"
                    className="text-secondary" stroke="currentColor"
                    strokeDasharray={2 * Math.PI * 48}
                    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - 0.78) }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <CountUpNumber value={78} />
                  <span className="text-xs text-foreground/50">Adhérence</span>
                </div>
              </div>
            </div>
            {/* Weekly bars */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar weight="light" className="w-4 h-4 text-foreground/50" />
                <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">7 derniers jours</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-16">
                {weeklyData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${item.value}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.08, type: "spring", bounce: 0.3 }}
                      className={cn("w-full rounded-t-sm",
                        item.value === 100 ? "bg-secondary" : item.value >= 60 ? "bg-primary/60" : item.value > 0 ? "bg-amber-400/60" : "bg-white/20"
                      )}
                      style={{ minHeight: item.value > 0 ? "4px" : "2px" }}
                    />
                    <span className="text-[10px] text-foreground/40 font-light">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
