import type { DataSource, QualityScore, ResolvedEntity } from "@/types";
import { ANCHOR_DATE } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// 데이터 품질 스코어링 — 소스별 4축(completeness/freshness/
// consistency/validity)을 SOURCES 메타데이터에서 결정론적으로 산출.
// 정적 reliability 를 산식 기반 점수로 보강한다. 모두 순수 함수.
// ─────────────────────────────────────────────────────────────

// 갱신 주기 문자열 → 분 단위 (freshness 기준 윈도).
function frequencyToMinutes(freq: string): number {
  if (freq.includes("분")) return parseInt(freq, 10) || 5;
  if (freq.includes("시간")) return (parseInt(freq, 10) || 1) * 60;
  if (freq.includes("일")) return 24 * 60;
  if (freq.includes("주")) return 7 * 24 * 60;
  if (freq.includes("월")) return 30 * 24 * 60;
  return 24 * 60;
}

// completeness: 스키마 필드 수 충실도 + 샘플 row null 비율.
function scoreCompleteness(s: DataSource): number {
  const fieldRichness = Math.min(1, s.schema.length / 7); // 7필드 = 만점 기준
  const values = Object.values(s.sampleRow);
  const nonNull = values.filter((v) => v !== null && v !== undefined && v !== "").length;
  const fillRate = values.length ? nonNull / values.length : 1;
  return Math.round((fieldRichness * 0.45 + fillRate * 0.55) * 100);
}

// freshness: 마지막 동기화가 갱신 주기 윈도 대비 얼마나 신선한가.
function scoreFreshness(s: DataSource, now: Date): number {
  const sinceMin = (now.getTime() - new Date(s.lastSyncAt).getTime()) / 60000;
  const window = frequencyToMinutes(s.updateFrequency);
  // 윈도 이내면 100, 2배 지나면 0 으로 선형 감쇠.
  const ratio = sinceMin / window;
  const score = ratio <= 1 ? 100 : Math.max(0, 100 - (ratio - 1) * 100);
  return Math.round(score);
}

// consistency: ER 충돌(표기 불일치)을 반영. 충돌 많을수록 감점.
function scoreConsistency(s: DataSource, conflictsForSource: number): number {
  const base = 100;
  const penalty = Math.min(40, conflictsForSource * 12);
  return Math.round(base - penalty);
}

// validity: 7일 성공률 + 정적 신뢰도.
function scoreValidity(s: DataSource): number {
  return Math.round(s.successRate7d * 0.6 + s.reliability * 0.4);
}

// 소스별 ER 충돌 수 집계 (멤버의 sourceId 기준).
export function conflictsBySource(
  entities: ResolvedEntity[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of entities) {
    for (const m of e.members) {
      out[m.sourceId] = (out[m.sourceId] ?? 0) + (m.conflicts?.length ?? 0);
    }
  }
  return out;
}

// 사람이 읽는 진단 한 줄들.
function buildIssues(
  s: DataSource,
  scores: { completeness: number; freshness: number; consistency: number; validity: number },
): string[] {
  const issues: string[] = [];
  if (scores.freshness < 70)
    issues.push(`신선도 저하 — 마지막 동기화가 갱신 주기(${s.updateFrequency})를 초과`);
  if (scores.consistency < 90)
    issues.push("타 소스와 회사명/주소 표기 불일치 발견 — Entity Resolution 충돌");
  if (scores.completeness < 85)
    issues.push("스키마 필드 또는 샘플 값에 누락 존재");
  if (scores.validity < 95)
    issues.push(`7일 성공률 ${s.successRate7d.toFixed(1)}% — 재시도/모니터링 권장`);
  if (issues.length === 0) issues.push("이상 없음 — 4축 모두 양호");
  return issues;
}

// 가중 평균 overall.
const WEIGHTS = { completeness: 0.25, freshness: 0.25, consistency: 0.2, validity: 0.3 };

export function scoreSource(
  s: DataSource,
  conflictsForSource: number,
  now: Date = ANCHOR_DATE,
): QualityScore {
  const completeness = scoreCompleteness(s);
  const freshness = scoreFreshness(s, now);
  const consistency = scoreConsistency(s, conflictsForSource);
  const validity = scoreValidity(s);
  const overall = Math.round(
    completeness * WEIGHTS.completeness +
      freshness * WEIGHTS.freshness +
      consistency * WEIGHTS.consistency +
      validity * WEIGHTS.validity,
  );
  return {
    sourceId: s.id,
    sourceName: s.name,
    completeness,
    freshness,
    consistency,
    validity,
    overall,
    issues: buildIssues(s, { completeness, freshness, consistency, validity }),
  };
}

// 전체 소스 품질 스코어 (overall 내림차순).
export function scoreAllSources(
  sources: DataSource[],
  entities: ResolvedEntity[],
  now: Date = ANCHOR_DATE,
): QualityScore[] {
  const conflicts = conflictsBySource(entities);
  return sources
    .map((s) => scoreSource(s, conflicts[s.id] ?? 0, now))
    .sort((a, b) => b.overall - a.overall);
}
