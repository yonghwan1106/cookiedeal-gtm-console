"use client";

import { COMPANIES } from "@/data/companies";
import { DealStage } from "@/types";
import { cn } from "@/lib/utils";

const STAGES: { stage: DealStage; color: string }[] = [
  { stage: "Lead", color: "var(--accent-blue)" },
  { stage: "Qualified", color: "var(--accent-blue)" },
  { stage: "Matched", color: "var(--accent-purple)" },
  { stage: "NDA", color: "var(--accent-purple)" },
  { stage: "LOI", color: "var(--accent-amber)" },
  { stage: "Closed", color: "var(--accent-green)" },
];

export function GtmFunnel() {
  // Cumulative funnel: count of deals at or beyond stage
  const stageIndex: Record<DealStage, number> = {
    Lead: 0,
    Qualified: 1,
    Matched: 2,
    NDA: 3,
    LOI: 4,
    Closed: 5,
  };
  const counts = STAGES.map((s, i) =>
    COMPANIES.filter((c) => stageIndex[c.stage] >= i).length,
  );
  const top = counts[0] || 1;

  return (
    <div className="space-y-2 px-5 pb-5">
      {STAGES.map((s, i) => {
        const widthPct = (counts[i] / top) * 100;
        const dropOff =
          i === 0 ? 0 : ((counts[i - 1] - counts[i]) / counts[i - 1]) * 100;
        return (
          <div key={s.stage} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="text-fg-muted">{s.stage}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-fg tabular-nums">{counts[i]}건</span>
                {i > 0 && (
                  <span
                    className={cn(
                      "text-[10px]",
                      dropOff > 40 ? "text-accent-red" : "text-fg-faint",
                    )}
                  >
                    -{dropOff.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${s.color}cc, ${s.color}66)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
