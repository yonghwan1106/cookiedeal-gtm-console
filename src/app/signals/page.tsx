import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EXTRACTED_SIGNALS, topicLabel, SIGNAL_MODEL_LABEL } from "@/lib/signals";
import type { ExtractedSignal, NerEntity } from "@/types";
import { formatNumber, formatDuration } from "@/lib/format";
import { Brain, ArrowRight, Cpu } from "lucide-react";

// NER 타입별 색 배지.
function nerBadge(type: NerEntity["type"]): { variant: "blue" | "green" | "amber" | "red" | "purple" | "muted"; label: string } {
  switch (type) {
    case "company": return { variant: "blue", label: "회사" };
    case "person": return { variant: "purple", label: "인물" };
    case "money": return { variant: "green", label: "금액" };
    case "role": return { variant: "amber", label: "직무" };
    case "date": return { variant: "muted", label: "날짜" };
    case "org": return { variant: "red", label: "기관" };
  }
}

function growthBadge(score: number) {
  if (score >= 75) return "green" as const;
  if (score >= 55) return "blue" as const;
  if (score >= 40) return "amber" as const;
  return "red" as const;
}

export default function SignalsPage() {
  const avgGrowth = Math.round(
    EXTRACTED_SIGNALS.reduce((s, x) => s + x.growthScore, 0) / EXTRACTED_SIGNALS.length,
  );
  const totalEntities = EXTRACTED_SIGNALS.reduce((s, x) => s + x.entities.length, 0);
  const avgLatency = Math.round(
    EXTRACTED_SIGNALS.reduce((s, x) => s + x.latencyMs, 0) / EXTRACTED_SIGNALS.length,
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-fg-faint flex-wrap">
          <Badge variant="purple">LLM SIGNAL EXTRACTION</Badge>
          <span className="font-mono">
            {EXTRACTED_SIGNALS.length} docs · {totalEntities} entities · 평균 성장 {avgGrowth}/100
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">LLM 시그널 추출</h1>
        <p className="text-sm text-fg-muted mt-1 max-w-2xl">
          뉴스·채용공고 <span className="text-fg">원문 텍스트 → NER(회사·인물·금액·직무·날짜·기관) +
          topic 분류 + 성장 시그널 스코어</span>를 산출하는 파이프라인을 시연합니다.
        </p>
        {/* 정직한 라벨링: 프로토타입은 결정론적 시뮬레이션 */}
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-accent-amber/40 bg-accent-amber/10 px-2.5 py-1 text-[11px] text-accent-amber">
          <Cpu className="h-3 w-3" />
          <span className="font-mono">{SIGNAL_MODEL_LABEL}</span>
          <span className="text-fg-muted">— 운영 환경은 Claude API, 본 데모는 결정론적 시뮬레이션입니다</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile label="처리 문서" value={`${EXTRACTED_SIGNALS.length}`} unit="건" />
        <KpiTile label="추출 엔터티" value={`${totalEntities}`} unit="개" />
        <KpiTile label="평균 성장 스코어" value={`${avgGrowth}`} unit="/100" />
        <KpiTile label="평균 지연 (sim)" value={formatDuration(avgLatency)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {EXTRACTED_SIGNALS.map((sig) => (
          <SignalCard key={sig.id} sig={sig} />
        ))}
      </div>
    </div>
  );
}

function SignalCard({ sig }: { sig: ExtractedSignal }) {
  return (
    <Card className="card-hover hover:border-border-strong">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-accent-purple" />
            <CardTitle>{sig.id}</CardTitle>
            <Badge variant={sig.sourceKind === "news" ? "blue" : "amber"}>
              {sig.sourceKind === "news" ? "뉴스" : "채용"}
            </Badge>
            <Badge variant="muted">{topicLabel(sig.topic)}</Badge>
          </div>
          <Badge variant={growthBadge(sig.growthScore)}>성장 {sig.growthScore}/100</Badge>
        </div>
      </CardHeader>
      <div className="px-5 pb-5 space-y-3">
        {/* 원문 → 추출 → 구조화 흐름 */}
        <div>
          <div className="text-[11px] text-fg-faint uppercase tracking-widest mb-1">① 원문 텍스트</div>
          <p className="text-xs text-fg-muted leading-relaxed rounded-md border border-border-base bg-bg-base p-3">
            {sig.rawText}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-fg-faint">
          <ArrowRight className="h-3 w-3" />
          <span>LLM 추출 파이프라인 (NER + topic + score)</span>
        </div>

        <div>
          <div className="text-[11px] text-fg-faint uppercase tracking-widest mb-1.5">② 추출 엔터티 (NER)</div>
          <div className="flex flex-wrap gap-1.5">
            {sig.entities.map((e, i) => {
              const nb = nerBadge(e.type);
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md border border-border-base bg-bg-elevated/40 px-1.5 py-0.5"
                >
                  <Badge variant={nb.variant}>{nb.label}</Badge>
                  <span className="text-[11px] font-mono text-fg">{e.text}</span>
                  {e.normalized && e.normalized !== e.text && (
                    <span className="text-[10px] font-mono text-fg-faint">→ {e.normalized}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-fg-faint uppercase tracking-widest mb-1">③ 성장 시그널 근거</div>
          <p className="text-xs text-fg-muted">{sig.rationale}</p>
        </div>

        {/* model / latency / tokens 메타 */}
        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-border-base text-[10.5px] font-mono text-fg-faint">
          <span>{sig.model}</span>
          <span>·</span>
          <span>latency {formatDuration(sig.latencyMs)}</span>
          <span>·</span>
          <span>tokens in {formatNumber(sig.tokensIn)} / out {formatNumber(sig.tokensOut)}</span>
        </div>
      </div>
    </Card>
  );
}

function KpiTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Card className="p-4 card-hover">
      <div className="text-xs text-fg-muted tracking-wide mb-2">{label}</div>
      <div className="flex items-baseline gap-1">
        <div className="text-xl font-semibold font-mono tabular-nums text-fg">{value}</div>
        {unit && <div className="text-xs text-fg-faint">{unit}</div>}
      </div>
    </Card>
  );
}
