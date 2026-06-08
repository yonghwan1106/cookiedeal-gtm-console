"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RESOLVED_ENTITIES } from "@/data/entities";
import type { EntityMemberRecord, ResolvedEntity } from "@/types";
import { formatPercent } from "@/lib/format";
import { GitMerge, AlertTriangle, BadgeCheck, Network } from "lucide-react";

// matchedBy 라벨 → 배지 색.
function matchedByBadge(by: EntityMemberRecord["matchedBy"]) {
  if (by === "biz_no") return { variant: "green" as const, label: "사업자번호 일치" };
  if (by === "name_exact") return { variant: "blue" as const, label: "회사명 정확 일치" };
  return { variant: "amber" as const, label: "회사명 유사 매칭" };
}

export default function EntitiesPage() {
  const [selectedId, setSelectedId] = useState<string>(
    RESOLVED_ENTITIES[0]?.canonicalId ?? "",
  );
  const selected: ResolvedEntity | undefined = RESOLVED_ENTITIES.find(
    (e) => e.canonicalId === selectedId,
  );

  const totalMembers = RESOLVED_ENTITIES.reduce((s, e) => s + e.members.length, 0);
  const totalConflicts = RESOLVED_ENTITIES.reduce((s, e) => s + e.conflictCount, 0);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-fg-faint flex-wrap">
          <Badge variant="purple">ENTITY RESOLUTION</Badge>
          <span className="font-mono">
            {RESOLVED_ENTITIES.length} entities · {totalMembers} records · {totalConflicts} conflicts
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">엔터티 정합 (Entity Resolution)</h1>
        <p className="text-sm text-fg-muted mt-1 max-w-2xl">
          DART·NTS·KIS·NICE·뉴스·채용 등 다출처 레코드를 <span className="text-fg">사업자등록번호 우선,
          없으면 회사명 정규화 + 유사도</span>로 동일 엔터티로 병합합니다.
          소스별 표기 불일치와 충돌을 탐지해 단일 canonical 레코드를 만듭니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 좌: 엔터티 리스트 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-accent-purple" />
              <CardTitle>병합된 엔터티</CardTitle>
            </div>
            <CardDescription>소스 병합 수 내림차순</CardDescription>
          </CardHeader>
          <div className="px-3 pb-4 space-y-1.5">
            {RESOLVED_ENTITIES.map((e) => {
              const active = e.canonicalId === selectedId;
              return (
                <button
                  key={e.canonicalId}
                  onClick={() => setSelectedId(e.canonicalId)}
                  className={
                    "w-full text-left rounded-lg border px-3 py-2.5 transition-all " +
                    (active
                      ? "border-accent-purple/50 bg-accent-purple/10"
                      : "border-border-base bg-bg-elevated/40 hover:border-border-strong")
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-fg">{e.canonicalName}</span>
                    <Badge variant={e.conflictCount > 0 ? "amber" : "green"}>
                      {e.sourceCount} 소스
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-fg-faint font-mono">
                    <span>{e.bizNo}</span>
                    <span>·</span>
                    <span>conf {formatPercent(e.confidence * 100, 0)}</span>
                    {e.conflictCount > 0 && (
                      <span className="text-accent-amber">· 충돌 {e.conflictCount}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 우: 선택 엔터티 병합 시각화 */}
        <div className="lg:col-span-2 space-y-4">
          {selected && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-4 w-4 text-accent-green" />
                        <CardTitle>Canonical 레코드</CardTitle>
                      </div>
                      <CardDescription className="mt-1">
                        {selected.members.length}개 소스 레코드를 병합한 단일 대표 엔터티
                      </CardDescription>
                    </div>
                    <Badge variant="purple">{selected.canonicalId}</Badge>
                  </div>
                </CardHeader>
                <div className="px-5 pb-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="대표 회사명" value={selected.canonicalName} />
                    <Field label="사업자번호" value={selected.bizNo} mono />
                    <Field
                      label="클러스터 신뢰도"
                      value={formatPercent(selected.confidence * 100, 0)}
                      mono
                    />
                    <Field label="필드 충돌" value={`${selected.conflictCount}건`} />
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GitMerge className="h-4 w-4 text-accent-blue" />
                    <CardTitle>소스별 멤버 레코드</CardTitle>
                  </div>
                  <CardDescription>매칭 근거(matchedBy)·유사도·충돌 하이라이트</CardDescription>
                </CardHeader>
                <div className="px-5 pb-5 space-y-2.5">
                  {selected.members.map((m, i) => {
                    const mb = matchedByBadge(m.matchedBy);
                    return (
                      <div
                        key={`${m.sourceId}-${i}`}
                        className="rounded-lg border border-border-base bg-bg-elevated/40 p-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="muted">{m.sourceId.toUpperCase()}</Badge>
                            <span className="text-sm font-mono text-fg">{m.rawName}</span>
                            {m.bizNo ? (
                              <span className="text-[11px] font-mono text-fg-faint">{m.bizNo}</span>
                            ) : (
                              <span className="text-[11px] font-mono text-accent-amber">biz_no 누락</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={mb.variant}>{mb.label}</Badge>
                            <span className="text-[11px] font-mono text-fg-muted">
                              sim {formatPercent(m.matchScore * 100, 0)}
                            </span>
                          </div>
                        </div>

                        {/* 병합된 필드 */}
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {Object.entries(m.fields).map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10.5px] font-mono px-1.5 py-0.5 rounded border border-border-base bg-bg-base text-fg-muted"
                            >
                              <span className="text-accent-blue">{k}</span>=
                              {String(v)}
                            </span>
                          ))}
                        </div>

                        {/* 충돌 하이라이트 */}
                        {m.conflicts && m.conflicts.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {m.conflicts.map((c, ci) => (
                              <div
                                key={ci}
                                className="flex items-start gap-1.5 text-[11px] text-accent-amber"
                              >
                                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border-base bg-bg-elevated/40 p-3">
      <div className="text-[11px] text-fg-faint uppercase tracking-widest mb-1">{label}</div>
      <div className={"text-sm text-fg " + (mono ? "font-mono" : "")}>{value}</div>
    </div>
  );
}
