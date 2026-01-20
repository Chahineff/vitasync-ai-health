import { motion } from 'framer-motion';
import { ChartDonut, TrendUp, Calendar } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ProgressChart = () => {
  const adherenceRate = 78;
  const data = [
    { name: 'Complété', value: adherenceRate },
    { name: 'Restant', value: 100 - adherenceRate },
  ];

  const weeklyData = [
    { day: 'L', value: 100 },
    { day: 'M', value: 80 },
    { day: 'M', value: 100 },
    { day: 'J', value: 60 },
    { day: 'V', value: 100 },
    { day: 'S', value: 40 },
    { day: 'D', value: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-premium rounded-2xl p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <ChartDonut weight="light" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-light tracking-tight text-foreground">
              Progression Santé
            </h3>
            <p className="text-xs text-foreground/50 font-light">
              Cette semaine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-secondary text-sm font-medium">
          <TrendUp weight="bold" className="w-4 h-4" />
          <span>+12%</span>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill="hsl(var(--secondary))" />
                <Cell fill="rgba(255,255,255,0.2)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-light text-foreground">{adherenceRate}%</span>
            <span className="text-xs text-foreground/50">Adhérence</span>
          </div>
        </div>
      </div>

      {/* Weekly bars */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar weight="light" className="w-4 h-4 text-foreground/50" />
          <span className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
            7 derniers jours
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 h-16">
          {weeklyData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${item.value}%` }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                className={`w-full rounded-t-sm ${
                  item.value === 100
                    ? 'bg-secondary'
                    : item.value >= 60
                    ? 'bg-primary/60'
                    : item.value > 0
                    ? 'bg-amber-400/60'
                    : 'bg-white/20'
                }`}
                style={{ minHeight: item.value > 0 ? '4px' : '2px' }}
              />
              <span className="text-[10px] text-foreground/40 font-light">
                {item.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressChart;
