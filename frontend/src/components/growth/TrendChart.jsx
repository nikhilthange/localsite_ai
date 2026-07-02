import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';

export default function TrendChart({ data, metrics, height = 300, showLegend = true }) {
  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[rgb(var(--color-text-muted))] text-sm">
        No trend data available yet
      </div>
    );
  }

  const chartData = data.labels.map((label, i) => {
    const point = { label };
    metrics.forEach((metric) => {
      point[metric.key] = data[metric.key]?.[i] || 0;
    });
    return point;
  });

  const colors = ['#6366f1', '#14b8a6', '#f97316', '#ef4444', '#22c55e', '#3b82f6'];

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              padding: '8px 12px',
            }}
          />
          {showLegend && <Legend />}
          {metrics.map((metric, i) => (
            <Line
              key={metric.key}
              type="monotone"
              dataKey={metric.key}
              name={metric.label || metric.key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AreaTrendChart({ data, dataKey = 'value', label = 'Score', color = '#6366f1', height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[rgb(var(--color-text-muted))] text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis dataKey="label" stroke="#9ca3af" fontSize={11} tickLine={false} />
          <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={`url(#gradient-${dataKey})`}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
