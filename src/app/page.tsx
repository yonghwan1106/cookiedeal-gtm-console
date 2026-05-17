import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi/kpi-card";
import { GtmFunnel } from "@/components/charts/funnel-stages";
import { TimeSeries } from "@/components/charts/time-series";
import { BarDistribution } from "@/components/charts/bar-distribution";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { Badge } from "@/components/ui/badge";
import { COMPANIES } from "@/data/companies";
import { ACTIVITIES } from "@/data/activity";
import { ETL_RUNS } from "@/data/etl-runs";
import { TOP_MATCHES } from "@/data/matches";
import type { Industry, Region } from "@/types";

export default function OverviewPage() {
  const totalDeals = COMPANIES.length;
  const closingRate =
    (COMPANIES.filter((c) => c.stage === "Closed").length / totalDeals) * 100;
  const activeNda = COMPANIES.filter((c) =>
    ["NDA", "LOI"].includes(c.stage),
  ).length;
  const avgMatchScore =
    TOP_MATCHES.reduce((s, m) => s + m.score, 0) / TOP_MATCHES.length;
  const successRuns = ETL_RUNS.filter((r) => r.status === "success").length;
  const pipelineHealth = (successRuns / ETL_RUNS.length) * 100;

  const monthlySpark = [22, 28, 31, 27, 35, 39, 42, 38, 44, 47, 51, 50];
  const sparkClosing = [3.2, 3.8, 4.1, 5.0, 4.6, 5.8, 6.2, 6.0, 7.1, 7.4, 7.9, 8.3];
  const sparkBuyers = [18, 20, 22, 24, 23, 26, 28, 27, 29, 30, 32, 30];
  const sparkScore = [62, 64, 65, 67, 66, 70, 71, 73, 72, 75, 76, 78];
  const sparkNda = [3, 4, 4, 5, 5, 6, 7, 6, 8, 8, 9, 9];
  const sparkHealth = [97.4, 97.8, 98.1, 96.9, 98.3, 98.6, 99.0, 98.4, 99.1, 99.0, 98.7, 99.2];

  const tsData = monthlySpark.map((listed, i) => {
    const monthIdx = (((new Date().getMonth() - 11 + i) % 12) + 12) % 12;
    return {
      label: `${String(monthIdx + 1).padStart(2, "0")}월`,
      listed,
      closed: Math.round(listed * (sparkClosing[i] / 100)),
    };
  });

  const regionAgg = COMPANIES.reduce<Record<Region, number>>(
    (acc, c) => {
      acc[c.region] = (acc[c.region] || 0) + 1;
      return acc;
    },
    {} as Record<Region, number>,
  );
  const regionData = (Object.entries(regionAgg) as [Region, number][])
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const industryAgg = COMPANIES.reduce<Record<Industry, { sum: number; n: number }>>(
    (acc, c) => {
      acc[c.industry] = acc[c.industry] || { sum: 0, n: 0 };
      acc[c.industry].sum += c.askingMultiple;
      acc[c.industry].n += 1;
      return acc;
    },
    {} as Record<Industry, { sum: number; n: number }>,
  );
  const industryData = (Object.entries(industryAgg) as [Industry, { sum: number; n: number }][])
    .map(([label, v]) => ({
      label,
      value: +(v.sum / v.n).toFixed(1),
      color: "var(--accent-purple)",
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-fg-faint">
            <Badge variant="blue">DASHBOARD</Badge>
            <span className="font-mono">2026-05-17</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">
            GTM 인텔리전스 개요
          </h1>
          <p className="text-sm text-fg-muted mt-1 max-w-2xl">
            다출처 분산 기업 정보를 단일 모델로 통합한 의사결정 콘솔.
            매칭 → NDA → LOI → Closed 까지의 GTM 퍼널을 한 화면에서 추적합니다.
          </p>
        </div>
        <div className="text-xs text-fg-faint flex items-center gap-4">
          <span>데이터 신선도 <span className="text-fg-muted font-mono">실시간 ~ 24h</span></span>
          <span>·</span>
          <span>레코드 <span className="text-fg-muted font-mono">35,840</span> / 일</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="월 신규 매물" value="50" unit="건" delta={6.4} deltaLabel="MoM" sparkData={monthlySpark} accent="blue" />
        <KpiCard label="매칭 성사율" value={closingRate.toFixed(1)} unit="%" delta={1.2} deltaLabel="QoQ" sparkData={sparkClosing} accent="green" />
        <KpiCard label="활성 바이어" value="30" unit="명" delta={3.4} deltaLabel="MoM" sparkData={sparkBuyers} accent="blue" />
        <KpiCard label="평균 매칭 점수" value={avgMatchScore.toFixed(0)} unit="/100" delta={2.1} deltaLabel="MoM" sparkData={sparkScore} accent="purple" />
        <KpiCard label="진행 중 NDA·LOI" value={String(activeNda)} unit="건" delta={-1.5} deltaLabel="WoW" sparkData={sparkNda} accent="amber" />
        <KpiCard label="파이프라인 헬스" value={pipelineHealth.toFixed(1)} unit="%" delta={0.4} deltaLabel="7d" sparkData={sparkHealth} accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>월별 매물 등록 vs 거래 종결</CardTitle>
                <CardDescription>최근 12개월 추이 — 거래 종결은 lagging 지표</CardDescription>
              </div>
              <Badge variant="muted">12M</Badge>
            </div>
          </CardHeader>
          <TimeSeries
            data={tsData}
            xKey="label"
            series={[
              { key: "listed", label: "신규 매물", color: "var(--accent-blue)" },
              { key: "closed", label: "거래 종결", color: "var(--accent-green)", type: "line" },
            ]}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GTM 퍼널</CardTitle>
            <CardDescription>Lead → Closed 단계별 잔존</CardDescription>
          </CardHeader>
          <GtmFunnel />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>지역별 매물 분포</CardTitle>
            <CardDescription>50건 기준 본사 소재지</CardDescription>
          </CardHeader>
          <BarDistribution data={regionData} unit="건" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>업종별 EBITDA 멀티플 평균</CardTitle>
            <CardDescription>매각희망가 / 직전년도 EBITDA</CardDescription>
          </CardHeader>
          <BarDistribution data={industryData} unit="x" />
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>실시간 이벤트 피드</CardDescription>
              </div>
              <span className="text-[10px] text-accent-green font-mono flex items-center gap-1">
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-green live-dot" />
                LIVE
              </span>
            </div>
          </CardHeader>
          <ActivityFeed items={ACTIVITIES.slice(0, 8)} />
        </Card>
      </div>
    </div>
  );
}
