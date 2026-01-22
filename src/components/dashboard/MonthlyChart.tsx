import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react';

interface MonthlyChartProps {
  getMonthlyStats: () => Promise<{ week: string; percentage: number }[]>;
}

export function MonthlyChart({ getMonthlyStats }: MonthlyChartProps) {
  const [data, setData] = useState<{ week: string; percentage: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const stats = await getMonthlyStats();
      setData(stats);
      
      // Calculate trend
      if (stats.length >= 2) {
        const lastWeek = stats[stats.length - 1].percentage;
        const prevWeek = stats[stats.length - 2].percentage;
        if (lastWeek > prevWeek + 5) setTrend('up');
        else if (lastWeek < prevWeek - 5) setTrend('down');
        else setTrend('neutral');
      }
    } catch (error) {
      console.error('Failed to load monthly stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const averagePercentage = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.percentage, 0) / data.length)
    : 0;

  const TrendIcon = trend === 'up' ? TrendUp : trend === 'down' ? TrendDown : Minus;
  const trendColor = trend === 'up' ? 'text-secondary' : trend === 'down' ? 'text-destructive' : 'text-foreground/50';

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between px-2">
        <div>
          <p className="text-2xl font-light text-foreground">{averagePercentage}%</p>
          <p className="text-xs text-foreground/50 font-light">Moyenne mensuelle</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendIcon weight="bold" className={`w-5 h-5 ${trendColor}`} />
          <span className={`text-sm font-light ${trendColor}`}>
            {trend === 'up' ? 'En progression' : trend === 'down' ? 'En baisse' : 'Stable'}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="week" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(var(--foreground) / 0.5)', fontSize: 11, fontWeight: 300 }}
            />
            <YAxis 
              hide 
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-background/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 shadow-xl">
                      <p className="text-xs text-foreground/60 mb-1">{d.week}</p>
                      <p className="text-sm font-medium text-foreground">{d.percentage}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="percentage"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#monthlyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-white/5">
          <p className="text-lg font-light text-foreground">{averagePercentage}%</p>
          <p className="text-xs text-foreground/50 font-light">Moyenne</p>
        </div>
        <div className="p-2 rounded-xl bg-white/5">
          <p className="text-lg font-light text-foreground">
            {data.length > 0 ? Math.max(...data.map(d => d.percentage)) : 0}%
          </p>
          <p className="text-xs text-foreground/50 font-light">Meilleur</p>
        </div>
        <div className="p-2 rounded-xl bg-white/5">
          <p className="text-lg font-light text-foreground">{data.length}</p>
          <p className="text-xs text-foreground/50 font-light">Semaines</p>
        </div>
      </div>
    </div>
  );
}
