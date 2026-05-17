"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarDistributionProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  defaultColor?: string;
  unit?: string;
}

export function BarDistribution({
  data,
  height = 220,
  defaultColor = "var(--accent-blue)",
  unit = "건",
}: BarDistributionProps) {
  return (
    <div className="px-5 pb-5">
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
            <CartesianGrid stroke="var(--border-base)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--text-faint)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis
              stroke="var(--text-faint)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "var(--bg-elevated)" }}
              formatter={(v) => [`${v}${unit}`, "값"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color ?? defaultColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
