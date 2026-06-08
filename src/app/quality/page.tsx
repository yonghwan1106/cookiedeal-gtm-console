"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QualityRadar } from "@/components/charts/quality-radar";
import { SOURCES } from "@/data/sources";
import { RESOLVED_ENTITIES } from "@/data/entities";
import { scoreAllSources } from "@/lib/data-quality";
import type { QualityScore } from "@/types";
import { ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";

// 결정론적 — ANCHOR_DATE 기준으로 빌드마다 동일.
const SCORES: QualityScore[] = scoreAllSources(SOURCES, RESOLVED_ENTITIES);

function overallBadge(overall: number) {
  if (overall >= 90) return "green" as const;
  if (overall >= 75) return "blue" as const;
  if (overall >= 60) return "amber" as const;
  return "red" as const;
}

const AXIS_LABEL: Record<string, string> = {
  completeness: "완전성",
  freshness: "신선도",
  consistency: "일관성",
  validity: "유효성",
};

export default function QualityPage() {
  const [selectedId, setSelectedId] = useState<string>(SCORES[0]?.sourceId ?? "");
  const selected = SCORES.find((s) => s.sourceId === selectedId) ?? SCORES[0];

  const avgOverall = Math.round(
    SCORES.reduce((s, x) => s + x.overall, 0) / SCORES.length,
  );
  const worst = [...SCORES].sort((a, b) => a.overall - b.overall).slice(0, 3);

  const radarData = selected
    ? [
        { axis: AXIS_LABEL.completeness, value: selected.completeness },
        { axis: AXIS_LABEL.freshness, value: selected.freshness },
        { axis: AXIS_LABEL.consistency, value: selected.consistency },
        { axis: AXIS_LABEL.validity, value: selected.validity },
      ]
    : [];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-fg-faint flex-wrap">
          <Badge variant="green">DATA QUALITY</Badge>
          <span className="font-mono">{SCORES.length} sources · 4 axes · 평균 {avgOverall}/100</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">데이터 품질 스코어링</h1>
        <p className="text-sm text-fg-muted mt-1 max-w-2xl">
          소스별 <span className="text-fg">완전성·신선도·일관성·유효성</span> 4축을 메타데이터에서 결정론적으로
          산출합니다. Entity Resolution 충돌이 일관성 점수에 반영되며, 갱신 주기 대비 신선도를 측정합니다.
        </p>
      </div>

      {/* KPI 밴드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile label="평균 종합 점수" value={`${avgOverall}`} unit="/100" accent="green" icon={<ShieldCheck className="h-4 w-4 text-accent-green" />} />
        <KpiTile label="최고 품질 소스" value={SCORES[0]?.sourceName ?? "-"} sub={`${SCORES[0]?.overall ?? 0}/100`} accent="blue" icon={<TrendingUp className="h-4 w-4 text-accent-blue" />} />
        <KpiTile label="최저 품질 소스" value={worst[0]?.sourceName ?? "-"} sub={`${worst[0]?.overall ?? 0}/100`} accent="amber" icon={<AlertTriangle className="h-4 w-4 text-accent-amber" />} />
        <KpiTile label="이슈 보유 소스" value={`${SCORES.filter((s) => !s.issues[0]?.startsWith("이상 없음")).length}`} unit="개" accent="red" icon={<AlertTriangle className="h-4 w-4 text-accent-red" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 좌: 소스별 점수표 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>소스별 4축 점수</CardTitle>
            <CardDescription>행 클릭 시 우측 레이더에 반영</CardDescription>
          </CardHeader>
          <div className="px-5 pb-5">
            <div className="rounded-md border border-border-base overflow-hidden">
              <table className="w-full text-[11px]">
                <thead className="text-fg-faint bg-bg-elevated/60">
                  <tr>
                    <th className="text-left px-2.5 py-1.5 font-medium">소스</th>
                    <th className="text-right px-2 py-1.5 font-medium">완전성</th>
                    <th className="text-right px-2 py-1.5 font-medium">신선도</th>
                    <th className="text-right px-2 py-1.5 font-medium">일관성</th>
                    <th className="text-right px-2 py-1.5 font-medium">유효성</th>
                    <th className="text-right px-2.5 py-1.5 font-medium">종합</th>
                  </tr>
                </thead>
                <tbody>
                  {SCORES.map((s) => {
                    const active = s.sourceId === selectedId;
                    return (
                      <tr
                        key={s.sourceId}
                        onClick={() => setSelectedId(s.sourceId)}
                        className={
                          "border-t border-border-base/40 cursor-pointer transition-colors " +
                          (active ? "bg-accent-blue/10" : "hover:bg-bg-elevated/60")
                        }
                      >
                        <td className="px-2.5 py-1.5 font-mono text-fg">{s.sourceName}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-fg-muted">{s.completeness}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-fg-muted">{s.freshness}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-fg-muted">{s.consistency}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-fg-muted">{s.validity}</td>
                        <td className="px-2.5 py-1.5 text-right">
                          <Badge variant={overallBadge(s.overall)}>{s.overall}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* 우: 선택 소스 레이더 + 이슈 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selected?.sourceName} 4축 프로파일</CardTitle>
                <CardDescription>completeness·freshness·consistency·validity</CardDescription>
              </div>
              <Badge variant={overallBadge(selected?.overall ?? 0)}>{selected?.overall}/100</Badge>
            </div>
          </CardHeader>
          <QualityRadar data={radarData} color="var(--accent-green)" />
          <div className="px-5 pb-5">
            <div className="text-[11px] text-fg-faint uppercase tracking-widest mb-1.5">진단</div>
            <div className="space-y-1.5">
              {selected?.issues.map((iss, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-fg-muted">
                  <span className="text-accent-amber mt-0.5">•</span>
                  <span>{iss}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 최저 점수 소스 (worst offenders) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-accent-amber" />
            <CardTitle>품질 취약 소스 (Worst Offenders)</CardTitle>
          </div>
          <CardDescription>종합 점수 하위 3개 — 개선 우선순위</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {worst.map((s) => (
            <div key={s.sourceId} className="rounded-lg border border-border-base bg-bg-elevated/40 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono font-semibold text-fg">{s.sourceName}</span>
                <Badge variant={overallBadge(s.overall)}>{s.overall}/100</Badge>
              </div>
              <div className="text-[11px] text-fg-muted leading-relaxed">{s.issues[0]}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function KpiTile({
  label,
  value,
  unit,
  sub,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accent?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4 card-hover">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-fg-muted tracking-wide">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <div className="text-xl font-semibold font-mono tabular-nums text-fg truncate">{value}</div>
        {unit && <div className="text-xs text-fg-faint">{unit}</div>}
      </div>
      {sub && <div className="text-[11px] text-fg-faint font-mono mt-1">{sub}</div>}
    </Card>
  );
}
