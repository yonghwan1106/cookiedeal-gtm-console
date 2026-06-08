import type { GrowthSignal, JobPosting } from "@/types";
import { makeRng } from "@/lib/seed";
import { isoFromOffsetDays } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// 채용공고 통합 (사람인·잡코리아·원티드) — ④ 채용공고 도메인 ETL
// 회사 가명과 연결되는 ~40건을 시드 기반으로 결정론적 생성.
// 핵심: 최근 모집인원 증가율 → "조직 성장 시그널" 산출.
// ─────────────────────────────────────────────────────────────

// companies.ts ALIASES_BY_INDUSTRY 에 등장하는 대표 가명 풀.
// 대표 엔터티 "케이세븐테크"는 Entity Resolution 병합 사례로도 재사용된다.
const ALIAS_POOL = [
  "케이세븐테크",
  "노바스택",
  "리프트워크스",
  "코어플로우",
  "헬릭스랩스",
  "스카이브릿지",
  "메디브릿지",
  "페이브릿지",
  "런잇아카데미",
  "콜드체인코리아",
  "글로우코스메틱",
  "정밀공업",
] as const;

const JOB_TITLES = [
  "백엔드 엔지니어",
  "프론트엔드 엔지니어",
  "데이터 엔지니어",
  "ML 엔지니어",
  "프로덕트 매니저",
  "그로스 마케터",
  "영업/세일즈",
  "QA 엔지니어",
  "데이터 분석가",
  "플랫폼 엔지니어",
] as const;

const SENIORITY_MIX = [
  "주니어 70% · 시니어 30%",
  "주니어 50% · 시니어 50%",
  "주니어 30% · 시니어 70%",
  "경력 무관 · 신입 환영",
  "시니어/리드 집중 채용",
] as const;

const SOURCES_POOL: JobPosting["source"][] = ["사람인", "잡코리아", "원티드"];

// 사업자번호 결정론 생성 (10자리, 하이픈 표기 NTS 양식)
function makeBizNo(rand: () => number): string {
  const a = String(Math.floor(rand() * 900) + 100); // 3
  const b = String(Math.floor(rand() * 90) + 10); // 2
  const c = String(Math.floor(rand() * 90000) + 10000); // 5
  return `${a}-${b}-${c}`;
}

// 모집인원 증가율 → 조직 성장 시그널.
// growthRate = (최근 모집인원 - 직전 모집인원) / 직전 모집인원.
export function growthSignalFromRate(growthRate: number): GrowthSignal {
  if (growthRate >= 0.5) return "급증";
  if (growthRate >= 0.15) return "확장";
  if (growthRate >= -0.1) return "유지";
  return "감축";
}

// 대표 엔터티(케이세븐테크)는 고정 사업자번호로 ER 데모와 일치시킨다.
export const FLAGSHIP_ALIAS = "케이세븐테크";
export const FLAGSHIP_BIZ_NO = "849-01-03618"; // sources.ts sampleRow 와 동일

function makeJob(idx: number, rng: ReturnType<typeof makeRng>): JobPosting {
  const companyAlias = rng.pick(ALIAS_POOL);
  const isFlagship = companyAlias === FLAGSHIP_ALIAS;
  const bizNo = isFlagship ? FLAGSHIP_BIZ_NO : makeBizNo(rng.next);

  // 직전 분기 대비 모집 규모 — 증가율로 성장 시그널을 만든다.
  const prevHeadcount = rng.int(2, 12);
  const growthRate = rng.float(-0.3, 0.9);
  const headcount = Math.max(1, Math.round(prevHeadcount * (1 + growthRate)));
  const growthSignal = growthSignalFromRate(growthRate);

  const postedAt = isoFromOffsetDays(-rng.int(0, 45));

  return {
    id: `J-${String(idx + 1).padStart(4, "0")}`,
    companyAlias,
    bizNo,
    title: rng.pick(JOB_TITLES),
    headcount,
    postedAt,
    source: rng.pick(SOURCES_POOL),
    seniorityMix: rng.pick(SENIORITY_MIX),
    growthSignal,
  };
}

export const JOB_POSTINGS: JobPosting[] = (() => {
  const rng = makeRng(20260602);
  const list: JobPosting[] = [];
  for (let i = 0; i < 40; i++) list.push(makeJob(i, rng));
  return list;
})();

// 회사(가명)별 채용 집계 — 조직 성장 시그널 요약.
export interface CompanyHiringSignal {
  companyAlias: string;
  bizNo: string;
  openPositions: number; // 공고 수
  totalHeadcount: number; // 총 모집인원
  dominantSignal: GrowthSignal; // 대표 성장 시그널
}

export const HIRING_SIGNALS: CompanyHiringSignal[] = (() => {
  const byAlias = new Map<string, JobPosting[]>();
  for (const j of JOB_POSTINGS) {
    const arr = byAlias.get(j.companyAlias) ?? [];
    arr.push(j);
    byAlias.set(j.companyAlias, arr);
  }
  const order: GrowthSignal[] = ["급증", "확장", "유지", "감축"];
  const out: CompanyHiringSignal[] = [];
  for (const [companyAlias, jobs] of byAlias) {
    const counts = new Map<GrowthSignal, number>();
    for (const j of jobs) counts.set(j.growthSignal, (counts.get(j.growthSignal) ?? 0) + 1);
    // 최다 시그널, 동률이면 더 강한 시그널 우선.
    let dominantSignal: GrowthSignal = "유지";
    let best = -1;
    for (const s of order) {
      const c = counts.get(s) ?? 0;
      if (c > best) {
        best = c;
        dominantSignal = s;
      }
    }
    out.push({
      companyAlias,
      bizNo: jobs[0].bizNo,
      openPositions: jobs.length,
      totalHeadcount: jobs.reduce((s, j) => s + j.headcount, 0),
      dominantSignal,
    });
  }
  // 총 모집인원 내림차순.
  return out.sort((a, b) => b.totalHeadcount - a.totalHeadcount);
})();
