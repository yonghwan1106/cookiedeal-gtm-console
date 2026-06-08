import type { ResolvedEntity } from "@/types";
import { resolveEntities, type RawRecord } from "@/lib/entity-resolution";

// ─────────────────────────────────────────────────────────────
// Entity Resolution 데모용 원시 레코드.
// 다출처가 같은 회사를 서로 다른 표기/번호 유무로 내보낸 상황을 재현한다.
// 대표 엔터티 "케이세븐테크"는 5개 소스(DART·NTS·KIS·NICE·jobs) 병합 사례.
// 모두 정적·결정론적.
// ─────────────────────────────────────────────────────────────

const RAW_RECORDS: RawRecord[] = [
  // ── 케이세븐테크: 5개 소스, 표기 다양 ──
  {
    sourceId: "dart",
    rawName: "주식회사 케이세븐테크",
    bizNo: "849-01-03618",
    fields: { revenue: 18_400, ebitda: 3_220, corp_code: "00126380" },
  },
  {
    sourceId: "nts",
    rawName: "케이세븐테크",
    bizNo: "8490103618",
    fields: { status: "01", biz_type: "정보통신업" },
  },
  {
    sourceId: "kis",
    rawName: "㈜케이세븐테크",
    bizNo: null, // 사업자번호 누락 → 회사명 유사도로 병합
    fields: { credit_score: 742, industry_code: "J62010" },
  },
  {
    sourceId: "nice",
    rawName: "케이세븐테크 주식회사",
    bizNo: null,
    fields: { rating: "BBB+", debt_ratio: 84.3, address: "서울 강남구 (구) 역삼동 718" },
  },
  {
    sourceId: "jobs",
    rawName: "케이세븐테크",
    bizNo: "849-01-03618",
    fields: { open_positions: 4, growth_signal: "급증" },
  },

  // ── 노바스택: 3개 소스 ──
  {
    sourceId: "dart",
    rawName: "주식회사 노바스택",
    bizNo: "211-87-44102",
    fields: { revenue: 9_200, ebitda: 1_180 },
  },
  {
    sourceId: "nts",
    rawName: "노바스택",
    bizNo: "2118744102",
    fields: { status: "01", biz_type: "소프트웨어 개발" },
  },
  {
    sourceId: "news",
    rawName: "노바스텍", // 언론사 오기 표기 → 회사명 유사도(fuzzy)로 병합
    bizNo: null,
    fields: { topic: "funding", headline: "노바스택 시리즈A 80억 유치" },
  },

  // ── 메디브릿지: 2개 소스 (표기 충돌 포함) ──
  {
    sourceId: "kodit",
    rawName: "메디브릿지",
    bizNo: "615-81-22934",
    fields: { rating: "K3", years_in_biz: 6 },
  },
  {
    sourceId: "jobs",
    rawName: "메디브리지",
    bizNo: null, // 오타성 표기 → fuzzy 매칭
    fields: { open_positions: 2, growth_signal: "확장" },
  },

  // ── 페이브릿지: 2개 소스 ──
  {
    sourceId: "nice",
    rawName: "주식회사 페이브릿지",
    bizNo: "120-86-77310",
    fields: { rating: "A-", current_ratio: 158.2 },
  },
  {
    sourceId: "news",
    rawName: "페이브릿지",
    bizNo: "120-86-77310",
    fields: { topic: "leadership", headline: "페이브릿지 신임 CFO 선임" },
  },
];

// 클러스터링 실행 (결정론적). 멤버 2개 이상인 엔터티를 우선 노출.
export const RESOLVED_ENTITIES: ResolvedEntity[] = resolveEntities(RAW_RECORDS).sort(
  (a, b) => b.sourceCount - a.sourceCount,
);
