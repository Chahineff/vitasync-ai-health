import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendUp, TrendDown, Minus, Target, Lightning, Moon, Brain, Barbell, ShieldPlus } from "@phosphor-icons/react";
import { useDailyCheckin } from "@/hooks/useDailyCheckin";
import { useHealthProfile } from "@/hooks/useHealthProfile";

const goalConfig: Record<string, { label: string; icon: typeof Lightning; metric: "energy_level" | "sleep_quality" | "stress_level" }> = {
  energy: { label: "Énergie", icon: Lightning, metric: "energy_level" },
  sleep: { label: "Sommeil", icon: Moon, metric: "sleep_quality" },
  stress: { label: "Anti-stress", icon: Brain, metric: "stress_level" },
  performance: { label: "Performance", icon: Barbell, metric: "energy_level" },
  immunity: { label: "Immunité", icon: ShieldPlus, metric: "energy_level" },
  focus: { label: "Focus", icon: Brain, metric: "stress_level" },
  muscle: { label: "Muscle", icon: Barbell, metric: "energy_level" },
};

function mapGoalToKey(goal: string): string | null {
  const lower = goal.toLowerCase();
  if (lower.includes("énergie") || lower.includes("energy")) return "energy";
  if (lower.includes("sommeil") || lower.includes("sleep")) return "sleep";
  if (lower.includes("stress")) return "stress";
  if (lower.includes("performance")) return "performance";
  if (lower.includes("immunité") || lower.includes("immunity")) return "immunity";
  if (lower.includes("focus") || lower.includes("concentration")) return "focus";
  if (lower.includes("muscle")) return "muscle";
  return null;
}

export function WeeklyGoalsWidget() {
  const { recentCheckins } = useDailyCheckin();
  const { healthProfile } = useHealthProfile();

  const goals = useMemo(() => {
    const userGoals = healthProfile?.health_goals || [];
    if (!userGoals.length || recentCheckins.length < 2) return [];

    const now = new Date();
    const thisWeek = recentCheckins.filter(c => {
      const d = new Date(c.checkin_date);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const lastWeek = recentCheckins.filter(c => {
      const d = new Date(c.checkin_date);
      const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 7 && diff <= 14;
    });

    const avg = (arr: typeof recentCheckins, key: string) => {
      const vals = arr.map(c => (c as any)[key]).filter((v: any) => v != null) as number[];
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };

    return userGoals.slice(0, 3).map(goal => {
      const key = mapGoalToKey(goal);
      if (!key || !goalConfig[key]) return null;
      const cfg = goalConfig[key];
      const thisAvg = avg(thisWeek, cfg.metric);
      const lastAvg = avg(lastWeek, cfg.metric);
      
      // For stress, improvement is going down
      const isStress = cfg.metric === "stress_level";
      const diff = isStress ? lastAvg - thisAvg : thisAvg - lastAvg;
      const pctChange = lastAvg > 0 ? Math.round((diff / lastAvg) * 100) : 0;
      const progress = Math.min(100, Math.max(0, (thisAvg / 5) * 100));

      return { key, ...cfg, progress, pctChange, thisAvg };
    }).filter(Boolean);
  }, [recentCheckins, healthProfile]);

  if (!goals.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: 0.05 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Target weight="fill" className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">Objectifs de la semaine</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {goals.map((g: any, i: number) => {
          const Icon = g.icon;
          return (
            <motion.div
              key={g.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="glass-card rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon weight="fill" className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{g.label}</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${g.progress}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/40">{g.thisAvg.toFixed(1)}/5</span>
                  {g.pctChange !== 0 && (
                    <div className="flex items-center gap-1">
                      {g.pctChange > 0 ? (
                        <TrendUp weight="bold" className="w-3 h-3 text-primary" />
                      ) : (
                        <TrendDown weight="bold" className="w-3 h-3 text-destructive" />
                      )}
                      <span className={`text-xs font-medium ${g.pctChange > 0 ? 'text-primary' : 'text-destructive'}`}>
                        {g.pctChange > 0 ? "+" : ""}{g.pctChange}%
                      </span>
                    </div>
                  )}
                  {g.pctChange === 0 && (
                    <div className="flex items-center gap-1">
                      <Minus weight="bold" className="w-3 h-3 text-foreground/30" />
                      <span className="text-xs text-foreground/30">Stable</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
