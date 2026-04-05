import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendUp, TrendDown, Minus, Heart, ChartLine } from "@phosphor-icons/react";
import { useTranslation } from "@/hooks/useTranslation";
import { useDailyCheckin } from "@/hooks/useDailyCheckin";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

/** Rolling average score using recent check-ins for stability */
function computeStableScore(todayCheckin: any, recentCheckins: any[]): number {
  const allCheckins = [...recentCheckins];
  // Ensure today's check-in is included
  const todayDate = new Date().toISOString().split("T")[0];
  if (todayCheckin && !allCheckins.find(c => c.checkin_date === todayDate)) {
    allCheckins.unshift({ ...todayCheckin, checkin_date: todayDate });
  }

  // Use last 7 days with exponential weighting (recent days matter more)
  const sorted = allCheckins
    .filter(c => c.sleep_quality != null || c.energy_level != null || c.stress_level != null)
    .sort((a, b) => b.checkin_date.localeCompare(a.checkin_date))
    .slice(0, 7);

  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return computeScore(sorted[0]);

  // Exponential weights: today=1.0, yesterday=0.7, day before=0.5, etc.
  const weights = [1.0, 0.7, 0.5, 0.35, 0.25, 0.2, 0.15];
  let weightedSum = 0;
  let totalWeight = 0;

  sorted.forEach((checkin, i) => {
    const w = weights[i] || 0.1;
    weightedSum += computeScore(checkin) * w;
    totalWeight += w;
  });

  return Math.round(weightedSum / totalWeight);
}

function getScoreColor(score: number): string {
  if (score >= 65) return "hsl(var(--primary))";
  if (score >= 40) return "hsl(38, 92%, 50%)";
  return "hsl(0, 72%, 51%)";
}

function getScoreLabel(score: number, t: (key: string) => string): string {
  if (score >= 80) return t("healthScore.excellent");
  if (score >= 65) return t("healthScore.good");
  if (score >= 40) return t("healthScore.average");
  return t("healthScore.low");
}

function ScoreHistoryChart({ recentCheckins, todayCheckin }: { recentCheckins: any[]; todayCheckin: any }) {
  const { t } = useTranslation();
  const chartData = useMemo(() => {
    const allCheckins = [...recentCheckins];
    const todayDate = new Date().toISOString().split("T")[0];
    if (todayCheckin && !allCheckins.find(c => c.checkin_date === todayDate)) {
      allCheckins.unshift({ ...todayCheckin, checkin_date: todayDate });
    }

    return allCheckins
      .filter(c => c.sleep_quality != null || c.energy_level != null || c.stress_level != null)
      .sort((a, b) => a.checkin_date.localeCompare(b.checkin_date))
      .slice(-14)
      .map(c => {
        const date = new Date(c.checkin_date);
        return {
          date: `${date.getDate()}/${date.getMonth() + 1}`,
          score: computeScore(c),
        };
      });
  }, [recentCheckins, todayCheckin]);

  if (chartData.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-foreground/40 text-sm">
        {t("healthScore.notEnoughData")}
      </div>
    );
  }

  return (
    <div className="h-56 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(var(--foreground))', opacity: 0.4, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--foreground))', opacity: 0.4, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              fontSize: '13px',
            }}
            formatter={(value: number) => [`${value}/100`, 'Score']}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="none"
            fill="url(#scoreGradient)"
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HealthScoreWidget({ embedded = false }: { embedded?: boolean }) {
  const { todayCheckin, recentCheckins } = useDailyCheckin();
  const [chartOpen, setChartOpen] = useState(false);
  const { t } = useTranslation();

  const { score, yesterdayScore, trend } = useMemo(() => {
    if (!todayCheckin) return { score: 0, yesterdayScore: 0, trend: "none" as const };

    // Use stable rolling average instead of single-day score
    const s = computeStableScore(todayCheckin, recentCheckins);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split("T")[0];
    const yCheckin = recentCheckins.find(c => c.checkin_date === yDate);

    // Yesterday's stable score (simulate by excluding today)
    const pastCheckins = recentCheckins.filter(c => c.checkin_date !== new Date().toISOString().split("T")[0]);
    const ys = yCheckin ? computeStableScore(yCheckin, pastCheckins) : 0;

    const t = !yCheckin ? "none" : s > ys ? "up" : s < ys ? "down" : "equal";
    return { score: s, yesterdayScore: ys, trend: t };
  }, [todayCheckin, recentCheckins]);

  if (!todayCheckin) return null;

  const color = getScoreColor(score);
  const label = getScoreLabel(score, t);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const content = (
    <Dialog open={chartOpen} onOpenChange={setChartOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-left group cursor-pointer">
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
                <h3 className="text-sm font-medium text-foreground">{t("healthScore.title")}</h3>
                <ChartLine weight="bold" className="w-3.5 h-3.5 text-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">{label}</p>
              {trend !== "none" && (
                <div className="flex items-center gap-1.5">
                  {trend === "up" && <TrendUp weight="bold" className="w-3.5 h-3.5 text-primary" />}
                  {trend === "down" && <TrendDown weight="bold" className="w-3.5 h-3.5 text-destructive" />}
                  {trend === "equal" && <Minus weight="bold" className="w-3.5 h-3.5 text-foreground/40" />}
                  <span className="text-xs text-foreground/50">
                    {trend === "up" && `+${score - yesterdayScore} ${t("healthScore.vsYesterday")}`}
                    {trend === "down" && `${score - yesterdayScore} ${t("healthScore.vsYesterday")}`}
                    {trend === "equal" && t("healthScore.stable")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart weight="fill" className="w-5 h-5 text-primary" />
            {t("healthScore.chartTitle")}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-foreground/50">
          {t("healthScore.chartDesc")}
        </p>
        <ScoreHistoryChart recentCheckins={recentCheckins} todayCheckin={todayCheckin} />
      </DialogContent>
    </Dialog>
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
