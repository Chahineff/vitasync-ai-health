import { motion } from "framer-motion";
import { Moon, BatteryFull, Brain, TrendUp, TrendDown, Minus, PencilSimple, Plus } from "@phosphor-icons/react";
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
}

function MetricCard({ icon, label, value, trend, invertTrend = false }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend || value === null) return <Minus weight="bold" className="w-3 h-3" />;
    
    // For stress, higher is worse, so we invert the trend display
    const isPositive = invertTrend ? trend < value : trend > value;
    
    return isPositive ? (
      <TrendUp weight="bold" className="w-3 h-3 text-primary" />
    ) : (
      <TrendDown weight="bold" className="w-3 h-3 text-muted-foreground" />
    );
  };

  const getValueDisplay = (val: number | null) => {
    if (val === null) return "—";
    const emojis: Record<string, string[]> = {
      "Sommeil": ["😫", "😕", "😐", "😊", "😴"],
      "Énergie": ["🔋", "🪫", "⚡", "💪", "🚀"],
      "Stress": ["😌", "🙂", "😐", "😰", "🤯"],
    };
    return emojis[label]?.[val - 1] || val.toString();
  };

  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="text-primary">{icon}</div>
      <span className="text-2xl">{getValueDisplay(value)}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {getTrendIcon()}
          <span>moy. {trend.toFixed(1)}</span>
        </div>
      )}
    </div>
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
          variant="ghost" 
          size="sm" 
          onClick={openCheckinModal}
          className="gap-2"
        >
          {todayCheckin ? (
            <>
              <PencilSimple weight="light" className="w-4 h-4" />
              Modifier
            </>
          ) : (
            <>
              <Plus weight="light" className="w-4 h-4" />
              Remplir
            </>
          )}
        </Button>
      </div>

      {todayCheckin ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          <MetricCard
            icon={<Moon weight="duotone" className="w-5 h-5" />}
            label="Sommeil"
            value={todayCheckin.sleep_quality}
            trend={trends?.avgSleep}
          />
          <MetricCard
            icon={<BatteryFull weight="duotone" className="w-5 h-5" />}
            label="Énergie"
            value={todayCheckin.energy_level}
            trend={trends?.avgEnergy}
          />
          <MetricCard
            icon={<Brain weight="duotone" className="w-5 h-5" />}
            label="Stress"
            value={todayCheckin.stress_level}
            trend={trends?.avgStress}
            invertTrend
          />
        </motion.div>
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
            <Plus weight="bold" className="w-4 h-4" />
            Commencer
          </Button>
        </motion.div>
      )}

      {/* Mood display if available */}
      {todayCheckin?.mood && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Humeur :</span>
          <span className="text-lg">
            {
              {
                great: "😄 Super",
                good: "😊 Bien",
                okay: "😐 Bof",
                bad: "😔 Pas top",
                terrible: "😫 Difficile",
              }[todayCheckin.mood] || todayCheckin.mood
            }
          </span>
        </div>
      )}
    </Card>
  );
}
