import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowsOutSimple, X } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKeys: string[];
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

export function parseChartBlocks(content: string): {
  text: string;
  charts: ChartData[];
} {
  const charts: ChartData[] = [];
  
  const marker = /\[\[CHART:(bar|line|pie):/g;
  let result = '';
  let lastIndex = 0;
  let m;
  
  while ((m = marker.exec(content)) !== null) {
    const type = m[1] as 'bar' | 'line' | 'pie';
    const jsonStart = m.index + m[0].length;
    
    let depth = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          if (content.substring(i + 1, i + 3) === ']]') {
            jsonEnd = i + 1;
            break;
          }
        }
      }
    }
    
    if (jsonEnd === -1) continue;
    
    const rawData = content.substring(jsonStart, jsonEnd);
    result += content.substring(lastIndex, m.index);
    lastIndex = jsonEnd + 2;
    
    try {
      const parsed = JSON.parse(rawData) as {
        title?: string;
        data?: Array<Record<string, string | number>>;
        xKey?: string;
        yKeys?: string[];
      };
      
      if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
        const xKey = parsed.xKey || Object.keys(parsed.data[0])[0];
        const yKeys = parsed.yKeys || Object.keys(parsed.data[0]).filter(k => k !== xKey);
        
        charts.push({
          type,
          title: parsed.title || 'Graphique',
          data: parsed.data,
          xKey,
          yKeys,
        });
        result += `__CHART_${charts.length - 1}__`;
      }
    } catch (e) {
      console.warn('Failed to parse chart data:', e);
    }
  }
  
  result += content.substring(lastIndex);
  return { text: result, charts };
}

function ChartRenderer({ chart, height }: { chart: ChartData; height: number }) {
  switch (chart.type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={chart.xKey} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Legend />
            {chart.yKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case 'line':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chart.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={chart.xKey} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Legend />
            {chart.yKeys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chart.data}
              dataKey={chart.yKeys[0]}
              nameKey={chart.xKey}
              cx="50%"
              cy="50%"
              outerRadius={height * 0.35}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chart.data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}

export function ChatChartBlock({ chart }: { chart: ChartData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="my-4 p-4 rounded-2xl bg-card border border-border/50 group relative">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">{chart.title}</h4>
          <button
            onClick={() => setExpanded(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Agrandir"
          >
            <ArrowsOutSimple weight="bold" className="w-4 h-4" />
          </button>
        </div>
        <ChartRenderer chart={chart} height={250} />
      </div>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-w-4xl w-[95vw] p-6">
          <DialogTitle className="text-lg font-semibold mb-4">{chart.title}</DialogTitle>
          <ChartRenderer chart={chart} height={450} />
        </DialogContent>
      </Dialog>
    </>
  );
}
