import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SOURCES } from "@/data/sources";
import { Database, FileJson, GitBranch, Layers } from "lucide-react";
import { formatNumber } from "@/lib/format";

// 공식 과제 4개 도메인 그룹핑.
const DOMAINS: { key: string; label: string; color: "blue" | "green" | "amber" | "purple"; sourceIds: string[] }[] = [
  { key: "public", label: "① 공공데이터", color: "blue", sourceIds: ["dart", "nts", "kosis"] },
  { key: "industry", label: "② 산업 도메인 데이터", color: "purple", sourceIds: ["kodit", "kis", "nice", "kb-realestate"] },
  { key: "news", label: "③ 뉴스", color: "amber", sourceIds: ["news"] },
  { key: "jobs", label: "④ 채용공고", color: "green", sourceIds: ["jobs"] },
];

export default function SourcesPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-fg-faint">
          <Badge variant="blue">DATA CATALOG</Badge>
          <span className="font-mono">{SOURCES.length} sources · {SOURCES.reduce((s, x) => s + x.schema.length, 0)} fields · 4 domains</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">데이터 소스 카탈로그</h1>
        <p className="text-sm text-fg-muted mt-1 max-w-2xl">
          각 소스의 스키마·SLA·신뢰도·샘플 row 를 한 자리에서 확인합니다.
          신규 매물 입수 시 데이터 lineage 를 추적할 수 있습니다.
        </p>
      </div>

      {/* 공식 4개 도메인 그룹핑 밴드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent-blue" />
            <CardTitle>4개 도메인 ETL</CardTitle>
          </div>
          <CardDescription>공공데이터 · 산업 도메인 데이터 · 뉴스 · 채용공고를 단일 모델로 통합</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {DOMAINS.map((d) => (
            <div key={d.key} className="rounded-lg border border-border-base bg-bg-elevated/40 p-3">
              <Badge variant={d.color}>{d.label}</Badge>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {d.sourceIds.map((id) => {
                  const s = SOURCES.find((x) => x.id === id);
                  if (!s) return null;
                  return (
                    <span
                      key={id}
                      className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-border-base bg-bg-base text-fg-muted"
                    >
                      {s.name}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-accent-blue" />
            <CardTitle>데이터 모델 (간이 ERD)</CardTitle>
          </div>
          <CardDescription>5개 핵심 테이블 + 외부 ETL 소스</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { name: "companies", pk: "id", fields: 14, color: "blue" as const },
              { name: "buyers", pk: "id", fields: 10, color: "blue" as const },
              { name: "matches", pk: "id (company, buyer)", fields: 7, color: "purple" as const },
              { name: "etl_runs", pk: "id", fields: 9, color: "green" as const },
              { name: "sources", pk: "id", fields: 15, color: "amber" as const },
            ].map((t) => (
              <div key={t.name} className="rounded-lg border border-border-base bg-bg-elevated/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-fg-muted" />
                  <span className="font-mono text-sm font-semibold">{t.name}</span>
                </div>
                <div className="text-[11px] text-fg-faint mb-1">PRIMARY KEY</div>
                <div className="text-xs font-mono text-fg mb-2">{t.pk}</div>
                <Badge variant={t.color}>{t.fields} fields</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 text-[11px] text-fg-faint font-mono leading-relaxed">
            <div><span className="text-accent-blue">companies</span>.id ← <span className="text-accent-purple">matches</span>.companyId</div>
            <div><span className="text-accent-blue">buyers</span>.id ← <span className="text-accent-purple">matches</span>.buyerId</div>
            <div><span className="text-accent-amber">sources</span>.id ← <span className="text-accent-green">etl_runs</span>.sourceId</div>
            <div><span className="text-accent-amber">sources</span>.id ← <span className="text-accent-blue">companies</span>.dataSources[]</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {SOURCES.map((s) => (
          <Card key={s.id} className="card-hover hover:border-border-strong">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{s.name}</CardTitle>
                    <Badge variant="muted">{s.category}</Badge>
                  </div>
                  <CardDescription className="mt-1">{s.fullName}</CardDescription>
                </div>
                <Badge variant={s.health === "green" ? "green" : s.health === "yellow" ? "amber" : "red"}>
                  {s.health.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <div className="px-5 pb-5 space-y-3">
              <p className="text-xs text-fg-muted">{s.description}</p>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <Stat label="갱신 주기" value={s.updateFrequency} />
                <Stat label="SLA" value={s.sla} mono />
                <Stat label="신뢰도" value={`${s.reliability}/100`} />
                <Stat label="성공률 7d" value={`${s.successRate7d.toFixed(1)}%`} />
                <Stat label="P95 지연" value={`${s.avgLatencyMs}ms`} />
                <Stat label="오늘 처리" value={formatNumber(s.recordsToday)} />
              </div>

              <div>
                <div className="text-[11px] text-fg-faint uppercase tracking-widest mb-1.5">스키마 ({s.schema.length})</div>
                <div className="rounded-md border border-border-base overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead className="text-fg-faint bg-bg-elevated/60">
                      <tr>
                        <th className="text-left px-2 py-1 font-medium">field</th>
                        <th className="text-left px-2 py-1 font-medium">type</th>
                        <th className="text-left px-2 py-1 font-medium">설명</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.schema.map((f) => (
                        <tr key={f.field} className="border-t border-border-base/40">
                          <td className="px-2 py-1 font-mono text-fg">{f.field}</td>
                          <td className="px-2 py-1 font-mono text-accent-blue">{f.type}</td>
                          <td className="px-2 py-1 text-fg-muted">{f.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-[11px] text-fg-faint uppercase tracking-widest mb-1.5">
                  <FileJson className="h-3 w-3" />
                  <span>샘플 row</span>
                </div>
                <pre className="rounded-md border border-border-base bg-bg-base p-3 text-[10.5px] font-mono text-fg-muted overflow-x-auto">
{JSON.stringify(s.sampleRow, null, 2)}
                </pre>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API 미리보기</CardTitle>
          <CardDescription>(가상) 매물 조회 엔드포인트</CardDescription>
        </CardHeader>
        <div className="px-5 pb-5 space-y-2">
          <div className="rounded-md border border-border-base bg-bg-base p-3 text-xs font-mono">
            <div className="text-accent-green">GET</div>
            <div className="text-fg">/api/v1/deals?industry=IT/SaaS&min_revenue=100&min_score=70&sort=matchScore:desc&limit=20</div>
          </div>
          <div className="text-[11px] text-fg-faint">Authorization: <span className="font-mono text-fg-muted">Bearer ckd_live_***</span></div>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-fg-faint">{label}</div>
      <div className={mono ? "font-mono text-fg" : "text-fg"}>{value}</div>
    </div>
  );
}
