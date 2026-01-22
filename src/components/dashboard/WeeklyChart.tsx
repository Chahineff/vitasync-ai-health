import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WeeklyChartProps {
  getWeeklyStats: () => Promise<{ day: string; count: number; total: number }[]>;
}

export function WeeklyChart({ getWeeklyStats }: WeeklyChartProps) {
  const [data, setData] = useState<{ day: string; count: number; total: number; percentage: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const stats = await getWeeklyStats();
      
      const weekData = stats.map(stat => ({
        ...stat,
        percentage: stat.total > 0 ? Math.round((stat.count / stat.total) * 100) : 0
      }));
      
      setData(weekData);
    } catch (error) {
      console.error('Failed to load weekly stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'hsl(var(--secondary))';
    if (percentage >= 50) return 'hsl(var(--primary))';
    return 'hsl(var(--muted-foreground) / 0.3)';
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

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between px-2">
        <div>
          <p className="text-2xl font-light text-foreground">{averagePercentage}%</p>
          <p className="text-xs text-foreground/50 font-light">Moyenne hebdomadaire</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-foreground/60 font-light">
            {data.reduce((sum, d) => sum + d.count, 0)} / {data.reduce((sum, d) => sum + d.total, 0)}
          </p>
          <p className="text-xs text-foreground/50 font-light">compléments pris</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
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
                      <p className="text-sm font-medium text-foreground">{d.percentage}%</p>
                      <p className="text-xs text-foreground/60">{d.count}/{d.total} pris</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="percentage" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-foreground/50">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          <span>≥80%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>50-79%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span>&lt;50%</span>
        </div>
      </div>
    </div>
  );
}
