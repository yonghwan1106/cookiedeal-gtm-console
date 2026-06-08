"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface QualityRadarProps {
  data: { axis: string; value: number }[];
  height?: number;
  color?: string;
}

// 데이터 품질 4축 레이더. 기존 차트 톤(토큰 색·11px·라운드) 유지.
export function QualityRadar({
  data,
  height = 240,
  color = "var(--accent-blue)",
}: QualityRadarProps) {
  return (
    <div className="px-5 pb-5">
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid stroke="var(--border-base)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "var(--text-muted)", fontSize: 11 }}
            />
            <PolarRadiusAxis
              domain={[0, 100]}
              tick={{ fill: "var(--text-faint)", fontSize: 10 }}
              axisLine={false}
            />
            <Tooltip cursor={{ stroke: "var(--border-strong)", strokeDasharray: "4 4" }} />
            <Radar
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
