"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Series {
  key: string;
  label: string;
  color: string;
  type?: "area" | "line";
}

interface TimeSeriesProps {
  data: Record<string, unknown>[];
  xKey: string;
  series: Series[];
  height?: number;
}

export function TimeSeries({ data, xKey, series, height = 280 }: TimeSeriesProps) {
  return (
    <div className="px-5 pb-5">
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.key}
                  id={`grad-${s.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--border-base)" strokeDasharray="3 6" />
            <XAxis
              dataKey={xKey}
              stroke="var(--text-faint)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--text-faint)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ stroke: "var(--border-strong)", strokeDasharray: "4 4" }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "var(--text-muted)" }}
            />
            {series.map((s) =>
              s.type === "line" ? (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 0, fill: s.color }}
                  activeDot={{ r: 4 }}
                />
              ) : (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#grad-${s.key})`}
                />
              ),
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
