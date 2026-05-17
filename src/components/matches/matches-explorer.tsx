"use client";

import * as React from "react";
import { Sliders } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMPANIES } from "@/data/companies";
import { BUYERS } from "@/data/buyers";
import { DEFAULT_WEIGHTS, scoreMatch, type MatchWeights } from "@/lib/matching";

export function MatchesExplorer() {
  const [weights, setWeights] = React.useState<MatchWeights>(DEFAULT_WEIGHTS);

  const allScores = React.useMemo(() => {
    const out: { companyId: string; buyerId: string; score: number }[] = [];
    for (const c of COMPANIES) {
      for (const b of BUYERS) {
        out.push({
          companyId: c.id,
          buyerId: b.id,
          score: scoreMatch(c, b, weights).score,
        });
      }
    }
    return out;
  }, [weights]);

  const topMatches = React.useMemo(
    () => [...allScores].sort((a, b) => b.score - a.score).slice(0, 10),
    [allScores],
  );

  const histogramBins = React.useMemo(() => {
    const bins = new Array(10).fill(0) as number[];
    for (const m of allScores) {
      const idx = Math.min(9, Math.floor(m.score / 10));
      bins[idx]++;
    }
    return bins;
  }, [allScores]);
  const histMax = Math.max(...histogramBins);

  // Matrix subset: top 12 companies × top 12 buyers
  const top12C = COMPANIES.slice(0, 12);
  const top12B = BUYERS.slice(0, 12);
  const matrixScore = (cId: string, bId: string) =>
    allScores.find((s) => s.companyId === cId && s.buyerId === bId)?.score ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-accent-purple" />
            <CardTitle>매칭 알고리즘 가중치</CardTitle>
          </div>
          <CardDescription>슬라이더 조정 시 전체 점수 재계산</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5 space-y-5">
          {(Object.keys(weights) as (keyof MatchWeights)[]).map((key) => (
            <WeightSlider
              key={key}
              label={LABEL[key]}
              value={weights[key]}
              onChange={(v) => setWeights({ ...weights, [key]: v })}
              color={COLOR[key]}
            />
          ))}
          <div className="pt-3 border-t border-border-base text-[11px] text-fg-faint">
            합계: <span className="font-mono text-fg">
              {(weights.industry + weights.size + weights.region + weights.other).toFixed(2)}
            </span>
            <span className="ml-2">(정규화되어 적용)</span>
          </div>
          <button
            type="button"
            onClick={() => setWeights(DEFAULT_WEIGHTS)}
            className="w-full h-8 rounded-md border border-border-base bg-bg-card text-xs hover:bg-bg-elevated"
          >
            기본값으로 재설정
          </button>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>점수 분포 (50 × 30 = 1,500건)</CardTitle>
          <CardDescription>구간별 매칭 건수</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5">
          <div className="flex items-end gap-1.5 h-40">
            {histogramBins.map((c, i) => {
              const h = (c / histMax) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-accent-purple/30 to-accent-purple"
                      style={{ height: `${h}%` }}
                      title={`${i * 10}-${i * 10 + 9}: ${c}건`}
                    />
                  </div>
                  <div className="text-[10px] text-fg-faint font-mono">
                    {i * 10}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 text-[11px] text-fg-faint flex items-center justify-between">
            <span>최저 0</span>
            <span>점수 (10 단위)</span>
            <span>최고 100</span>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>매칭 히트맵 (Top 12 매물 × Top 12 바이어)</CardTitle>
          <CardDescription>색상이 진할수록 매칭 점수 높음</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5 overflow-x-auto">
          <table className="text-[11px] border-separate border-spacing-0.5">
            <thead>
              <tr>
                <th className="text-left p-1 text-fg-faint sticky left-0 bg-bg-card min-w-[160px]">매물 \ 바이어</th>
                {top12B.map((b) => (
                  <th key={b.id} className="p-1 text-fg-faint font-normal min-w-[60px] text-center">
                    <div className="truncate max-w-[56px]" title={b.name}>{b.id}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top12C.map((c) => (
                <tr key={c.id}>
                  <th className="text-left p-1 sticky left-0 bg-bg-card text-fg text-[11px] font-normal">
                    <div className="truncate max-w-[160px]" title={c.alias}>
                      <span className="font-mono text-fg-faint mr-1">{c.id}</span>
                      {c.alias}
                    </div>
                  </th>
                  {top12B.map((b) => {
                    const s = matrixScore(c.id, b.id);
                    const intensity = s / 100;
                    return (
                      <td
                        key={b.id}
                        className="p-0 text-center"
                        title={`${c.alias} × ${b.name} = ${s}`}
                      >
                        <div
                          className="h-7 w-full rounded text-[10px] font-mono tabular-nums flex items-center justify-center transition-colors"
                          style={{
                            background: `color-mix(in srgb, var(--accent-purple) ${intensity * 80}%, transparent)`,
                            color: intensity > 0.55 ? "white" : "var(--text-muted)",
                          }}
                        >
                          {s}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>상위 매칭 10건</CardTitle>
          <CardDescription>현재 가중치 기준 실시간 정렬</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5">
          <table className="w-full text-xs">
            <thead className="text-fg-faint text-[11px]">
              <tr className="border-b border-border-base">
                <th className="text-left py-2">#</th>
                <th className="text-left py-2">매물</th>
                <th className="text-left py-2">업종</th>
                <th className="text-left py-2">바이어</th>
                <th className="text-left py-2">타입</th>
                <th className="text-right py-2">점수</th>
              </tr>
            </thead>
            <tbody>
              {topMatches.map((m, i) => {
                const c = COMPANIES.find((x) => x.id === m.companyId)!;
                const b = BUYERS.find((x) => x.id === m.buyerId)!;
                return (
                  <tr key={`${m.companyId}-${m.buyerId}`} className="border-b border-border-base/40">
                    <td className="py-2 font-mono text-fg-faint">#{i + 1}</td>
                    <td className="py-2 text-fg">{c.alias}</td>
                    <td className="py-2"><Badge variant="muted">{c.industry}</Badge></td>
                    <td className="py-2 text-fg">{b.name}</td>
                    <td className="py-2"><Badge variant="purple">{b.type}</Badge></td>
                    <td className="py-2 text-right font-mono text-accent-purple font-semibold">{m.score}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const LABEL: Record<keyof MatchWeights, string> = {
  industry: "산업 일치",
  size: "규모 적합",
  region: "지역 근접",
  other: "기타 (단계·인력)",
};

const COLOR: Record<keyof MatchWeights, string> = {
  industry: "var(--accent-blue)",
  size: "var(--accent-green)",
  region: "var(--accent-amber)",
  other: "var(--accent-purple)",
};

function WeightSlider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          <span className="text-xs text-fg">{label}</span>
        </div>
        <span className="text-xs font-mono text-fg-muted tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full"
        style={{ accentColor: color }}
      />
    </div>
  );
}
