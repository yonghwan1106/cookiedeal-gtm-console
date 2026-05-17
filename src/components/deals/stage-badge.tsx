import { Badge } from "@/components/ui/badge";
import type { DealStage } from "@/types";

const STAGE_VARIANT: Record<DealStage, "muted" | "blue" | "purple" | "amber" | "green"> = {
  Lead: "muted",
  Qualified: "blue",
  Matched: "blue",
  NDA: "purple",
  LOI: "amber",
  Closed: "green",
};

const STAGE_LABEL: Record<DealStage, string> = {
  Lead: "Lead",
  Qualified: "Qualified",
  Matched: "Matched",
  NDA: "NDA",
  LOI: "LOI",
  Closed: "Closed",
};

export function StageBadge({ stage }: { stage: DealStage }) {
  return <Badge variant={STAGE_VARIANT[stage]}>{STAGE_LABEL[stage]}</Badge>;
}

const STAGES: DealStage[] = ["Lead", "Qualified", "Matched", "NDA", "LOI", "Closed"];

export function StageTracker({ current }: { current: DealStage }) {
  const idx = STAGES.indexOf(current);
  return (
    <div className="flex items-center gap-1">
      {STAGES.map((s, i) => {
        const active = i <= idx;
        const isCurrent = i === idx;
        return (
          <div key={s} className="flex items-center gap-1">
            <div
              className={`px-2 py-1 rounded-md text-[10px] font-mono border ${
                isCurrent
                  ? "bg-accent-blue/15 border-accent-blue/40 text-accent-blue"
                  : active
                    ? "bg-bg-elevated border-border-base text-fg"
                    : "bg-transparent border-border-base text-fg-faint"
              }`}
            >
              {s}
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={`h-px w-4 ${active ? "bg-accent-blue/40" : "bg-border-base"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
