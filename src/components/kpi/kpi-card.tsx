"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Sparkline } from "./sparkline";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number; // % change
  deltaLabel?: string;
  sparkData?: number[];
  accent?: "blue" | "green" | "amber" | "red" | "purple";
  unit?: string;
}

const ACCENT_HEX: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  blue: "var(--accent-blue)",
  green: "var(--accent-green)",
  amber: "var(--accent-amber)",
  red: "var(--accent-red)",
  purple: "var(--accent-purple)",
};

export function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  sparkData,
  accent = "blue",
  unit,
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="p-4 card-hover">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-fg-muted tracking-wide">{label}</span>
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: ACCENT_HEX[accent] }}
        />
      </div>
      <div className="flex items-baseline gap-1">
        <div className="text-2xl font-semibold font-mono tabular-nums animate-count-up text-fg">
          {value}
        </div>
        {unit && <div className="text-xs text-fg-faint">{unit}</div>}
      </div>
      <div className="flex items-center justify-between mt-2 h-10">
        {delta !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-mono",
              positive ? "text-accent-green" : "text-accent-red",
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span>
              {positive ? "+" : ""}
              {delta.toFixed(1)}%
            </span>
            {deltaLabel && (
              <span className="ml-1 text-fg-faint">· {deltaLabel}</span>
            )}
          </div>
        )}
        {sparkData && (
          <div className="ml-auto w-24 h-10">
            <Sparkline data={sparkData} color={ACCENT_HEX[accent]} />
          </div>
        )}
      </div>
    </Card>
  );
}
