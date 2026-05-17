"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function Sparkline({
  data,
  color = "#60a5fa",
}: {
  data: number[];
  color?: string;
}) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
