import type { EntityMemberRecord, ResolvedEntity } from "@/types";

// ─────────────────────────────────────────────────────────────
// Entity Resolution — 다출처(DART/NTS/KIS/NICE/news/jobs) 레코드를
// 사업자등록번호(biz_no) 우선, 없으면 회사명 정규화 + 유사도로
// 동일 엔터티로 클러스터링하는 순수 함수 모음.
// 모든 함수는 결정론적(입력 동일 → 출력 동일).
// ─────────────────────────────────────────────────────────────

// 회사명 정규화: 법인격 토큰 제거, 공백 정리, 영문 소문자화.
export function normalizeCompanyName(raw: string): string {
  return raw
    .replace(/\(주\)|㈜|주식회사|有限會社|유한회사|\(유\)/g, "")
    .replace(/[(),.·\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// 사업자번호 정규화: 숫자만 추출 (하이픈/공백 제거).
export function normalizeBizNo(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 ? digits : null;
}

// Levenshtein 거리 (편집 거리).
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

// 문자 bigram 집합 (한글 단일 토큰 이름의 유사도 보정용).
function bigrams(s: string): Set<string> {
  const compact = s.replace(/\s+/g, "");
  const out = new Set<string>();
  for (let i = 0; i < compact.length - 1; i++) out.add(compact.slice(i, i + 2));
  if (compact.length === 1) out.add(compact);
  return out;
}

function jaccardOf(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

// 회사명 유사도 0~1.
// 편집거리 + (멀티 토큰이면) 토큰 자카드 / (단일 토큰이면) 문자 bigram 자카드.
// 한글 단일 토큰 회사명(예: "메디브릿지"↔"메디브리지")도 안정적으로 매칭.
export function nameSimilarity(rawA: string, rawB: string): number {
  const a = normalizeCompanyName(rawA);
  const b = normalizeCompanyName(rawB);
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  const lev = 1 - levenshtein(a, b) / maxLen;

  const tokA = new Set(a.split(" ").filter(Boolean));
  const tokB = new Set(b.split(" ").filter(Boolean));
  const multiToken = tokA.size > 1 || tokB.size > 1;
  const jaccard = multiToken
    ? jaccardOf(tokA, tokB)
    : jaccardOf(bigrams(a), bigrams(b));

  // 편집거리 60% + 자카드 40%.
  return +(lev * 0.6 + jaccard * 0.4).toFixed(3);
}

// 클러스터링 입력: 한 소스가 내보낸 원시 레코드.
export interface RawRecord {
  sourceId: string;
  rawName: string;
  bizNo: string | null;
  fields: Record<string, unknown>;
}

// 매칭 임계값. 한글 단일 토큰 회사명의 1~2자 오타/이형 표기를 흡수하도록
// 0.6 으로 설정 (영문 별칭 등 큰 표기 차이는 의도적으로 미병합 유지).
const NAME_FUZZY_THRESHOLD = 0.6;

// 두 레코드가 동일 엔터티인지 + 매칭 라벨/점수 판정.
function matchPair(
  a: RawRecord,
  b: RawRecord,
): { matched: boolean; score: number; matchedBy: EntityMemberRecord["matchedBy"] } {
  const bizA = normalizeBizNo(a.bizNo);
  const bizB = normalizeBizNo(b.bizNo);
  if (bizA && bizB) {
    if (bizA === bizB) return { matched: true, score: 1, matchedBy: "biz_no" };
    // 사업자번호가 둘 다 있고 다르면 서로 다른 엔터티.
    return { matched: false, score: 0, matchedBy: "biz_no" };
  }
  // 회사명 기반.
  const nA = normalizeCompanyName(a.rawName);
  const nB = normalizeCompanyName(b.rawName);
  if (nA && nA === nB) return { matched: true, score: 1, matchedBy: "name_exact" };
  const sim = nameSimilarity(a.rawName, b.rawName);
  if (sim >= NAME_FUZZY_THRESHOLD)
    return { matched: true, score: sim, matchedBy: "name_fuzzy" };
  return { matched: false, score: sim, matchedBy: "name_fuzzy" };
}

// 충돌 탐지: 소스별 회사명 원문 표기/주소 등 불일치를 사람이 읽는 문장으로.
function detectConflicts(canonicalName: string, member: RawRecord): string[] {
  const out: string[] = [];
  const canon = normalizeCompanyName(canonicalName);
  const mine = normalizeCompanyName(member.rawName);
  if (canon !== mine) {
    out.push(`회사명 표기 불일치: "${member.rawName}" ↔ canonical "${canonicalName}"`);
  }
  if (!normalizeBizNo(member.bizNo)) {
    out.push("사업자번호 누락 — 회사명 유사도로 병합됨");
  }
  const addr = member.fields["address"];
  if (typeof addr === "string" && addr.includes("(구)")) {
    out.push(`주소 표기 구주소 사용: ${addr}`);
  }
  return out;
}

// 핵심: 원시 레코드 배열 → ResolvedEntity 배열.
// biz_no 우선, 없으면 회사명 정규화 + 유사도로 클러스터링.
export function resolveEntities(records: RawRecord[]): ResolvedEntity[] {
  const clusters: RawRecord[][] = [];

  for (const rec of records) {
    let placed = false;
    for (const cluster of clusters) {
      // 클러스터 대표(첫 레코드)와 비교.
      const { matched } = matchPair(cluster[0], rec);
      if (matched) {
        cluster.push(rec);
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push([rec]);
  }

  return clusters.map((cluster, idx) => {
    // canonical 결정: 사업자번호 보유 + 가장 짧은(정규화) 이름을 대표로.
    const withBiz = cluster.find((r) => normalizeBizNo(r.bizNo));
    const canonicalSource = withBiz ?? cluster[0];
    const canonicalName = canonicalSource.rawName
      .replace(/\(주\)|㈜|주식회사/g, "")
      .trim();
    const bizNo = normalizeBizNo(canonicalSource.bizNo) ?? "미상";

    const members: EntityMemberRecord[] = cluster.map((r) => {
      const { score, matchedBy } = matchPair(canonicalSource, r);
      const conflicts = detectConflicts(canonicalName, r);
      return {
        sourceId: r.sourceId,
        rawName: r.rawName,
        bizNo: r.bizNo,
        fields: r.fields,
        matchScore: r === canonicalSource ? 1 : score,
        matchedBy: r === canonicalSource ? "biz_no" : matchedBy,
        conflicts: conflicts.length ? conflicts : undefined,
      };
    });

    const conflictCount = members.reduce(
      (s, m) => s + (m.conflicts?.length ?? 0),
      0,
    );
    // confidence: 평균 매칭점수에서 충돌당 소폭 감점.
    const avgScore =
      members.reduce((s, m) => s + m.matchScore, 0) / members.length;
    const confidence = Math.max(
      0,
      Math.min(1, +(avgScore - conflictCount * 0.04).toFixed(3)),
    );

    return {
      canonicalId: `E-${String(idx + 1).padStart(3, "0")}`,
      canonicalName,
      bizNo: bizNo === "미상" ? "미상" : formatBizNo(bizNo),
      members,
      confidence,
      conflictCount,
      sourceCount: new Set(members.map((m) => m.sourceId)).size,
    };
  });
}

// 사업자번호 표시용 하이픈 포매팅 (3-2-5).
export function formatBizNo(digits: string): string {
  if (digits.length !== 10) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}
