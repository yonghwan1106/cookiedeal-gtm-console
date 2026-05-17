import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Database,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StageTracker } from "@/components/deals/stage-badge";
import { TimeSeries } from "@/components/charts/time-series";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { COMPANY_BY_ID, COMPANIES } from "@/data/companies";
import { matchesForCompany } from "@/data/matches";
import { BUYER_BY_ID } from "@/data/buyers";
import { SOURCES } from "@/data/sources";
import { ACTIVITIES } from "@/data/activity";
import { formatKrwShort, formatDateKo, timeAgo } from "@/lib/format";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = COMPANY_BY_ID.get(id);
  if (!company) notFound();

  const matches = matchesForCompany(company.id, 5).map((m) => ({
    ...m,
    buyer: BUYER_BY_ID.get(m.buyerId)!,
  }));

  const sourceMap = new Map(SOURCES.map((s) => [s.id, s]));
  const usedSources = company.dataSources
    .map((id) => sourceMap.get(id))
    .filter(Boolean);

  const similar = COMPANIES.filter(
    (c) => c.id !== company.id && c.industry === company.industry,
  ).slice(0, 3);

  const tsData = company.financials.map((f) => ({
    label: `${f.year}`,
    revenue: f.revenue,
    operatingIncome: f.operatingIncome,
    ebitda: f.ebitda,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <Link
          href="/deals"
          className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg mb-3"
        >
          <ArrowLeft className="h-3 w-3" />
          매물 리스트로
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="muted">{company.industry}</Badge>
              <Badge variant="outline">{company.region}</Badge>
              <span className="text-xs text-fg-faint font-mono">{company.id}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{company.alias}</h1>
            <p className="text-sm text-fg-muted mt-1 max-w-2xl">{company.description}</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-fg-faint">매각희망가</div>
            <div className="text-2xl font-semibold font-mono tabular-nums text-accent-amber">
              {formatKrwShort(company.askingPrice)}
            </div>
            <div className="text-[11px] text-fg-faint mt-0.5 font-mono">
              EBITDA × {company.askingMultiple}
            </div>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <StageTracker current={company.stage} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetaCard icon={Building2} label="설립연도" value={`${company.foundedYear}년`} />
        <MetaCard icon={MapPin} label="본사" value={company.region} />
        <MetaCard icon={Users} label="직원수" value={`${company.employees}명`} />
        <MetaCard
          icon={Calendar}
          label="등록일"
          value={`${formatDateKo(company.registeredAt)} (${company.daysSinceListed}일)`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>최근 3년 재무 추이</CardTitle>
            <CardDescription>매출·영업이익·EBITDA (단위: 백만원)</CardDescription>
          </CardHeader>
          <TimeSeries
            data={tsData}
            xKey="label"
            height={260}
            series={[
              { key: "revenue", label: "매출", color: "var(--accent-blue)" },
              { key: "operatingIncome", label: "영업이익", color: "var(--accent-amber)", type: "line" },
              { key: "ebitda", label: "EBITDA", color: "var(--accent-green)", type: "line" },
            ]}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>매도 사유</CardTitle>
          </CardHeader>
          <div className="px-5 pb-5 space-y-3">
            <p className="text-sm text-fg">{company.reasonForSale}</p>
            <div className="pt-3 border-t border-border-base">
              <div className="text-[11px] text-fg-faint mb-1">최근년도 마진</div>
              <div className="text-3xl font-semibold font-mono tabular-nums text-accent-green">
                {company.ebitdaMargin}%
              </div>
              <div className="text-[11px] text-fg-faint mt-1">EBITDA Margin</div>
            </div>
            <div className="pt-3 border-t border-border-base">
              <div className="text-[11px] text-fg-faint mb-1">건강 상태</div>
              <Badge variant={company.health === "healthy" ? "green" : company.health === "warm" ? "amber" : "red"}>
                {company.health === "healthy" ? "신선" : company.health === "warm" ? "보통" : "장기 미체결"}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-purple" />
              <CardTitle>AI 매칭 TOP 5 바이어</CardTitle>
            </div>
            <CardDescription>점수 = 산업 0.4 + 규모 0.3 + 지역 0.2 + 기타 0.1</CardDescription>
          </CardHeader>
          <div className="px-5 pb-5 space-y-3">
            {matches.map((m, i) => (
              <div
                key={m.id}
                className="rounded-lg border border-border-base bg-bg-elevated/40 p-3"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-fg-faint">#{i + 1}</span>
                      <span className="font-medium text-fg">{m.buyer.name}</span>
                      <Badge variant="muted">{m.buyer.type}</Badge>
                    </div>
                    <div className="text-[11px] text-fg-muted mt-0.5">{m.buyer.description}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-semibold font-mono tabular-nums text-accent-purple">
                      {m.score}
                    </div>
                    <div className="text-[10px] text-fg-faint font-mono">/100</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {m.reasons.map((r) => (
                    <div
                      key={r.label}
                      className="text-[11px] text-fg-muted border border-border-base rounded px-2 py-1 bg-bg-card"
                    >
                      <span className="text-fg font-medium">{r.label}</span>
                      <span className="text-fg-faint font-mono ml-1">(w={r.weight})</span>
                      <div className="text-fg-faint text-[10px] mt-0.5">{r.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-accent-blue" />
              <CardTitle>데이터 출처</CardTitle>
            </div>
            <CardDescription>ETL 파이프라인이 통합한 소스</CardDescription>
          </CardHeader>
          <div className="px-5 pb-5 space-y-2">
            {usedSources.map((s) => s && (
              <div key={s.id} className="flex items-center justify-between text-xs border border-border-base rounded-md px-3 py-2">
                <div>
                  <div className="font-medium text-fg">{s.name}</div>
                  <div className="text-[11px] text-fg-faint">{s.fullName}</div>
                </div>
                <span className="font-mono text-fg-faint">{timeAgo(s.lastSyncAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>활동 타임라인</CardTitle>
            <CardDescription>최근 이벤트 (필터: 모든 매물)</CardDescription>
          </CardHeader>
          <ActivityFeed items={ACTIVITIES.slice(0, 6)} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>유사 매물</CardTitle>
            <CardDescription>{company.industry} 동일 업종</CardDescription>
          </CardHeader>
          <div className="px-5 pb-5 space-y-2">
            {similar.map((s) => (
              <Link
                key={s.id}
                href={`/deals/${s.id}`}
                className="block p-3 rounded-md border border-border-base bg-bg-elevated/40 hover:border-border-strong"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-fg">{s.alias}</span>
                  <span className="text-xs font-mono text-accent-purple">{s.matchScore}</span>
                </div>
                <div className="text-[11px] text-fg-faint mt-0.5 font-mono">
                  {s.region} · 매출 {formatKrwShort(s.revenue)} · 희망가 {formatKrwShort(s.askingPrice)}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetaCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-md bg-bg-elevated border border-border-base flex items-center justify-center text-fg-muted">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[11px] text-fg-faint">{label}</div>
        <div className="text-sm font-medium text-fg font-mono tabular-nums">{value}</div>
      </div>
    </Card>
  );
}
