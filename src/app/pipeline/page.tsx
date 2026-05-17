import { AlertTriangle, CheckCircle2, Clock, Database, RefreshCw, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarDistribution } from "@/components/charts/bar-distribution";
import { SOURCES } from "@/data/sources";
import { ETL_RUNS } from "@/data/etl-runs";
import { formatDuration, formatNumber, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SourceHealth } from "@/types";

const HEALTH_COLOR: Record<SourceHealth, string> = {
  green: "var(--accent-green)",
  yellow: "var(--accent-amber)",
  red: "var(--accent-red)",
};

const HEALTH_LABEL: Record<SourceHealth, string> = {
  green: "정상",
  yellow: "주의",
  red: "장애",
};

export default function PipelinePage() {
  const total = ETL_RUNS.length;
  const success = ETL_RUNS.filter((r) => r.status === "success").length;
  const failed = ETL_RUNS.filter((r) => r.status === "failed").length;
  const delayed = ETL_RUNS.filter((r) => r.status === "delayed").length;
  const rowsToday = SOURCES.reduce((s, x) => s + x.recordsToday, 0);

  // 7-day hourly throughput (sum across all sources)
  const hourBuckets = new Array(7 * 24).fill(0) as number[];
  const anchor = new Date("2026-05-17T12:00:00+09:00").getTime();
  for (const r of ETL_RUNS) {
    const t = new Date(r.startedAt).getTime();
    const hoursAgo = Math.floor((anchor - t) / (60 * 60 * 1000));
    if (hoursAgo >= 0 && hoursAgo < 7 * 24) {
      hourBuckets[7 * 24 - 1 - hoursAgo] += r.rowsProcessed;
    }
  }
  // Sample every 6 hours for chart
  const chartData: { label: string; value: number }[] = [];
  for (let i = 0; i < 7 * 24; i += 6) {
    const sum = hourBuckets.slice(i, i + 6).reduce((s, x) => s + x, 0);
    const day = Math.floor(i / 24);
    const hh = i % 24;
    chartData.push({ label: `D-${6 - day}·${String(hh).padStart(2, "0")}h`, value: sum });
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-fg-faint">
          <Badge variant="green">ETL PIPELINE</Badge>
          <span className="font-mono">8 sources · {formatNumber(total)} runs · 7d</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">파이프라인 모니터링</h1>
        <p className="text-sm text-fg-muted mt-1 max-w-2xl">
          8개 외부 데이터 소스의 동기화 상태·지연·실패를 한 화면에서 추적합니다.
          알림은 P95 지연시간 임계 또는 연속 실패 3회 시 발화합니다.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard icon={CheckCircle2} label="성공" value={success.toLocaleString()} color="var(--accent-green)" />
        <SummaryCard icon={XCircle} label="실패" value={failed.toLocaleString()} color="var(--accent-red)" />
        <SummaryCard icon={Clock} label="지연" value={delayed.toLocaleString()} color="var(--accent-amber)" />
        <SummaryCard icon={Database} label="오늘 처리행" value={formatNumber(rowsToday)} color="var(--accent-blue)" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>데이터 소스 상태판</CardTitle>
          <CardDescription>최근 동기화 · 헬스 · SLA</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {SOURCES.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-border-base bg-bg-elevated/40 p-3 hover:border-border-strong card-hover"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: HEALTH_COLOR[s.health] }}
                    />
                    <span className="text-sm font-medium text-fg">{s.name}</span>
                    <Badge variant="muted">{s.category}</Badge>
                  </div>
                  <div className="text-[11px] text-fg-faint mt-0.5">{s.fullName}</div>
                </div>
                <span
                  className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ color: HEALTH_COLOR[s.health], background: `${HEALTH_COLOR[s.health]}15` }}
                >
                  {HEALTH_LABEL[s.health]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] mt-3">
                <Metric label="마지막 동기화" value={timeAgo(s.lastSyncAt)} />
                <Metric label="다음 실행" value={timeAgo(s.nextRunAt)} />
                <Metric label="성공률 7일" value={`${s.successRate7d.toFixed(1)}%`} accent />
                <Metric label="P95 지연" value={`${s.avgLatencyMs}ms`} />
                <Metric label="처리 (오늘)" value={formatNumber(s.recordsToday)} />
                <Metric label="신뢰도" value={`${s.reliability}/100`} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>7일 시간별 처리량</CardTitle>
            <CardDescription>6시간 buckets · 총 처리 행수</CardDescription>
          </CardHeader>
          <BarDistribution data={chartData} unit="행" defaultColor="var(--accent-blue)" />
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent-amber" />
              <CardTitle>알림</CardTitle>
            </div>
            <CardDescription>최근 실패·지연 7건</CardDescription>
          </CardHeader>
          <div className="px-5 pb-5 space-y-2">
            {ETL_RUNS.filter((r) => r.status !== "success").slice(0, 7).map((r) => {
              const src = SOURCES.find((s) => s.id === r.sourceId);
              return (
                <div
                  key={r.id}
                  className="border border-border-base rounded-md p-2.5 text-xs bg-bg-elevated/40"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-fg">{src?.name}</span>
                    <Badge variant={r.status === "failed" ? "red" : "amber"}>
                      {r.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-fg-faint font-mono">{timeAgo(r.startedAt)}</div>
                  {r.errorMessage && (
                    <div className="text-[11px] text-accent-red mt-1 truncate" title={r.errorMessage}>
                      {r.errorMessage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>실행 로그 (최근 50건)</CardTitle>
              <CardDescription>전체 소스 · 시작시각 내림차순</CardDescription>
            </div>
            <span className="text-[10px] text-accent-green font-mono flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> 5s 자동 갱신
            </span>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-fg-faint text-[11px] uppercase tracking-wider">
              <tr className="border-b border-border-base bg-bg-elevated/40">
                <th className="text-left px-4 py-2.5 font-medium">실행 ID</th>
                <th className="text-left px-4 py-2.5 font-medium">소스</th>
                <th className="text-left px-4 py-2.5 font-medium">상태</th>
                <th className="text-right px-4 py-2.5 font-medium">시작</th>
                <th className="text-right px-4 py-2.5 font-medium">소요</th>
                <th className="text-right px-4 py-2.5 font-medium">처리</th>
                <th className="text-right px-4 py-2.5 font-medium">실패</th>
                <th className="text-left px-4 py-2.5 font-medium">메시지</th>
              </tr>
            </thead>
            <tbody>
              {ETL_RUNS.slice(0, 50).map((r) => {
                const src = SOURCES.find((s) => s.id === r.sourceId);
                return (
                  <tr key={r.id} className="border-b border-border-base/40 hover:bg-bg-elevated/60">
                    <td className="px-4 py-2 font-mono text-fg-faint">{r.id}</td>
                    <td className="px-4 py-2 text-fg">{src?.name}</td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={
                          r.status === "success" ? "green" :
                          r.status === "delayed" ? "amber" :
                          r.status === "running" ? "blue" : "red"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-fg-faint">{timeAgo(r.startedAt)}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatDuration(r.durationMs)}</td>
                    <td className="px-4 py-2 text-right font-mono">{formatNumber(r.rowsProcessed)}</td>
                    <td className={cn("px-4 py-2 text-right font-mono", r.rowsFailed > 0 && "text-accent-red")}>
                      {r.rowsFailed}
                    </td>
                    <td className="px-4 py-2 text-fg-faint truncate max-w-[260px]" title={r.errorMessage || ""}>
                      {r.errorMessage || "—"}
                    </td>
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

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-md flex items-center justify-center"
        style={{ background: `${color}15`, color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[11px] text-fg-faint">{label}</div>
        <div className="text-xl font-semibold font-mono tabular-nums text-fg">{value}</div>
      </div>
    </Card>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-fg-faint">{label}</div>
      <div className={cn("font-mono tabular-nums", accent ? "text-accent-green" : "text-fg")}>{value}</div>
    </div>
  );
}
