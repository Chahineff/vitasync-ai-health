import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
  
  // Find [[CHART:type: markers and then extract balanced JSON
  const marker = /\[\[CHART:(bar|line|pie):/g;
  let result = '';
  let lastIndex = 0;
  let m;
  
  while ((m = marker.exec(content)) !== null) {
    const type = m[1] as 'bar' | 'line' | 'pie';
    const jsonStart = m.index + m[0].length;
    
    // Find the matching closing by counting braces
    let depth = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') {
        depth--;
        if (depth === 0) {
          // Check if followed by ]]
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
    lastIndex = jsonEnd + 2; // skip ]]
    
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

export function ChatChartBlock({ chart }: { chart: ChartData }) {
  const chartElement = useMemo(() => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={250}>
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
              {chart.yKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={250}>
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
              {chart.yKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chart.data}
                dataKey={chart.yKeys[0]}
                nameKey={chart.xKey}
                cx="50%"
                cy="50%"
                outerRadius={90}
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
  }, [chart]);

  return (
    <div className="my-4 p-4 rounded-2xl bg-card border border-border/50">
      <h4 className="text-sm font-semibold text-foreground mb-3">{chart.title}</h4>
      {chartElement}
    </div>
  );
}
