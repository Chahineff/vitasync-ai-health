import { motion } from "framer-motion";
import { Moon, Lightning, Brain, TrendUp, TrendDown, Minus, PencilSimple, Plus } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDailyCheckin } from "@/hooks/useDailyCheckin";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  trend?: number;
  invertTrend?: boolean;
  delay?: number;
  colorClass: string;
  bgClass: string;
}

function CircularProgress({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = ((value || 0) / max) * circumference;

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
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      />
    </svg>
  );
}

function MetricCard({ icon, label, value, trend, invertTrend = false, delay = 0, colorClass, bgClass }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend || value === null) return <Minus weight="bold" className="w-3 h-3" />;
    const isPositive = invertTrend ? trend < value : trend > value;
    return isPositive ? (
      <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: delay + 0.3 }}>
        <TrendUp weight="bold" className="w-3 h-3 text-primary" />
      </motion.div>
    ) : (
      <motion.div initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: delay + 0.3 }}>
        <TrendDown weight="bold" className="w-3 h-3 text-muted-foreground" />
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <div className={cn("p-2 rounded-lg", bgClass)}>{icon}</div>
      <div className="relative flex items-center justify-center">
        <CircularProgress value={value || 0} max={5} colorClass={colorClass} />
        <motion.span 
          className="absolute text-sm font-bold text-foreground"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.3 }}
          style={{ transform: "rotate(90deg)" }}
        >
          {value ?? "—"}
        </motion.span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {getTrendIcon()}
          <span>moy. {trend.toFixed(1)}</span>
        </div>
      )}
    </motion.div>
  );
}

export function DailyCheckinWidget() {
  const { todayCheckin, getTrends, openCheckinModal } = useDailyCheckin();
  const trends = getTrends();

  return (
    <Card className="glass-card-premium rounded-3xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-foreground">Mon suivi du jour</h3>
          <p className="text-sm text-muted-foreground">
            {todayCheckin ? "Tendances sur 7 jours" : "Comment te sens-tu aujourd'hui ?"}
          </p>
        </div>
        <Button 
          variant={todayCheckin ? "ghost" : "default"} 
          size={todayCheckin ? "sm" : "default"}
          onClick={openCheckinModal} 
          className={cn(
            "gap-2",
            !todayCheckin && "px-5 py-3 text-base font-medium shadow-lg shadow-primary/20"
          )}
        >
          {todayCheckin ? (
            <><PencilSimple weight="light" className="w-4 h-4" /> Modifier</>
          ) : (
            <><Plus weight="bold" className="w-5 h-5" /> Check-in du jour</>
          )}
        </Button>
      </div>

      {todayCheckin ? (
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            icon={<Moon weight="duotone" className="w-5 h-5 text-indigo-400" />}
            label="Sommeil"
            value={todayCheckin.sleep_quality}
            trend={trends?.avgSleep}
            colorClass="text-indigo-400"
            bgClass="bg-indigo-500/15"
            delay={0}
          />
          <MetricCard
            icon={<Lightning weight="duotone" className="w-5 h-5 text-amber-400" />}
            label="Énergie"
            value={todayCheckin.energy_level}
            trend={trends?.avgEnergy}
            colorClass="text-amber-400"
            bgClass="bg-amber-500/15"
            delay={0.08}
          />
          <MetricCard
            icon={<Brain weight="duotone" className="w-5 h-5 text-rose-400" />}
            label="Stress"
            value={todayCheckin.stress_level}
            trend={trends?.avgStress}
            invertTrend
            colorClass="text-rose-400"
            bgClass="bg-rose-500/15"
            delay={0.16}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Moon weight="duotone" className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Fais ton check-in quotidien pour suivre ta santé
          </p>
          <Button onClick={openCheckinModal} className="gap-2">
            <Plus weight="bold" className="w-4 h-4" /> Commencer
          </Button>
        </motion.div>
      )}

      {todayCheckin?.mood && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Humeur :</span>
          <span className="text-sm font-medium text-foreground">
            {{ great: "Super", good: "Bien", okay: "Bof", bad: "Pas top", terrible: "Difficile" }[todayCheckin.mood] || todayCheckin.mood}
          </span>
        </div>
      )}
    </Card>
  );
}
