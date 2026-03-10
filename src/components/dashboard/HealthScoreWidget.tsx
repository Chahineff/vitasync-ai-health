import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendUp, TrendDown, Minus, Heart } from "@phosphor-icons/react";
import { useDailyCheckin } from "@/hooks/useDailyCheckin";

function computeScore(checkin: { sleep_quality: number | null; energy_level: number | null; stress_level: number | null; mood: string | null }): number {
  let score = 0;
  let factors = 0;
  if (checkin.sleep_quality != null) { score += (checkin.sleep_quality / 5) * 30; factors++; }
  if (checkin.energy_level != null) { score += (checkin.energy_level / 5) * 30; factors++; }
  if (checkin.stress_level != null) { score += ((5 - checkin.stress_level) / 5) * 25; factors++; }
  const moodMap: Record<string, number> = { great: 15, good: 12, okay: 8, bad: 4, terrible: 0 };
  if (checkin.mood && moodMap[checkin.mood] !== undefined) { score += moodMap[checkin.mood]; factors++; }
  if (factors === 0) return 0;
  const maxPossible = factors === 4 ? 100 : (factors === 3 ? 85 : factors === 2 ? 60 : 30);
  return Math.round((score / maxPossible) * 100);
}

function getScoreColor(score: number): string {
  if (score >= 65) return "hsl(var(--primary))";
  if (score >= 40) return "hsl(38, 92%, 50%)";
  return "hsl(0, 72%, 51%)";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Bon";
  if (score >= 40) return "Moyen";
  return "Faible";
}

export function HealthScoreWidget({ embedded = false }: { embedded?: boolean }) {
  const { todayCheckin, recentCheckins } = useDailyCheckin();

  const { score, yesterdayScore, trend } = useMemo(() => {
    if (!todayCheckin) return { score: 0, yesterdayScore: 0, trend: "none" as const };
    const s = computeScore(todayCheckin);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split("T")[0];
    const yCheckin = recentCheckins.find(c => c.checkin_date === yDate);
    const ys = yCheckin ? computeScore(yCheckin) : 0;
    const t = !yCheckin ? "none" : s > ys ? "up" : s < ys ? "down" : "equal";
    return { score: s, yesterdayScore: ys, trend: t };
  }, [todayCheckin, recentCheckins]);

  if (!todayCheckin) return null;

  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const content = (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle
            cx="48" cy="48" r={radius}
            fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            transform="rotate(-90 48 48)"
            style={{ filter: score >= 65 ? `drop-shadow(0 0 6px ${color})` : undefined }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{score}</span>
          <span className="text-[10px] text-foreground/40 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Heart weight="fill" className="w-4 h-4" style={{ color }} />
          <h3 className="text-sm font-medium text-foreground">Score Santé</h3>
        </div>
        <p className="text-lg font-semibold text-foreground mb-1">{label}</p>
        {trend !== "none" && (
          <div className="flex items-center gap-1.5">
            {trend === "up" && <TrendUp weight="bold" className="w-3.5 h-3.5 text-primary" />}
            {trend === "down" && <TrendDown weight="bold" className="w-3.5 h-3.5 text-destructive" />}
            {trend === "equal" && <Minus weight="bold" className="w-3.5 h-3.5 text-foreground/40" />}
            <span className="text-xs text-foreground/50">
              {trend === "up" && `+${score - yesterdayScore} vs hier`}
              {trend === "down" && `${score - yesterdayScore} vs hier`}
              {trend === "equal" && "Stable vs hier"}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="glass-card rounded-2xl p-5"
    >
      {content}
    </motion.div>
  );
}
