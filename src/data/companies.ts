import type {
  Company,
  CompanyFinancial,
  DealHealth,
  DealStage,
  Industry,
  Region,
} from "@/types";
import { makeRng } from "@/lib/seed";
import { isoFromOffsetDays } from "@/lib/utils";

const INDUSTRIES: Industry[] = [
  "IT/SaaS",
  "F&B",
  "제조",
  "유통/물류",
  "헬스케어",
  "교육",
  "뷰티/패션",
  "금융서비스",
];

const REGIONS: Region[] = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "대전",
  "광주",
  "기타",
];

// 업종별 가명 풀
const ALIASES_BY_INDUSTRY: Record<Industry, string[]> = {
  "IT/SaaS": [
    "케이세븐테크", "노바스택", "리프트워크스", "코어플로우", "헬릭스랩스",
    "스카이브릿지", "픽셀웨이브", "퀀텀로직", "딥파이프", "오토메이트X",
  ],
  "F&B": [
    "한솥푸드", "그린테이블", "별빛다이닝", "포레스트키친", "도시락플러스",
    "오크룸커피", "베이크하우스", "스위트빌",
  ],
  "제조": [
    "정밀공업", "한미메탈", "프리시즌파츠", "코리아몰드", "에버그린화학",
    "선진엔지니어링", "테크노머신",
  ],
  "유통/물류": [
    "스피드딜리버리", "로지스플러스", "체인커넥트", "콜드체인코리아",
    "라스트마일랩스",
  ],
  "헬스케어": [
    "메디브릿지", "헬스마인드", "케어테크", "바이오워크스", "닥터앱",
  ],
  "교육": [
    "런잇아카데미", "에듀픽", "코드스쿨원", "윙클리어닝",
  ],
  "뷰티/패션": [
    "글로우코스메틱", "어반클로젯", "스타일허브",
  ],
  "금융서비스": [
    "페이브릿지", "크레딧라인", "스마트인슈어",
  ],
};

const REASONS_FOR_SALE = [
  "창업자 은퇴 및 승계 부재",
  "본업 집중 위한 비핵심 사업 분리",
  "글로벌 파트너십 확보 위한 지분 매각",
  "투자 회수 (PE 펀드 만기)",
  "사업 다각화 자금 확보",
  "후속 시리즈 자금 조달 대안",
  "지주사 체제 개편",
];

const DESCRIPTIONS_BY_INDUSTRY: Record<Industry, string[]> = {
  "IT/SaaS": [
    "B2B SaaS 백오피스 자동화 솔루션. 200+ 중견기업 고객.",
    "물류·재고 관리 SaaS. 월 활성 워크스페이스 4,200개.",
    "마케팅 자동화 플랫폼. 연간 12% MoM 매출 성장.",
    "데이터 분석·BI 도구. 금융·제조 업종 강세.",
  ],
  "F&B": [
    "프리미엄 도시락·HMR 브랜드. 직영 23개, 위탁 41개 매장.",
    "스페셜티 커피 체인. 수도권 38개 매장, 자체 로스팅 보유.",
    "건강 디저트 브랜드. 백화점·복합몰 입점 28개점.",
  ],
  "제조": [
    "정밀 기계가공 부품. 자동차·반도체 1차 협력사 12곳.",
    "친환경 화학소재. ESG 인증 보유, 수출 비중 38%.",
    "산업용 금형 설계·제조. 30년 업력, 안정적 매출.",
  ],
  "유통/물류": [
    "콜드체인 물류. 전국 8개 거점, 식품·제약 특화.",
    "라스트마일 배송 SaaS+오프라인. 250개 셀러 활성.",
  ],
  "헬스케어": [
    "디지털 헬스케어 앱. 만성질환 관리, 70만 활성 사용자.",
    "원격의료 플랫폼. 의원 1,200곳 제휴.",
  ],
  "교육": [
    "성인 코딩 교육 플랫폼. 연간 수강생 1.8만명, 환급 코스 보유.",
    "초등 영어 구독형 학습. 월 구독자 3.4만명.",
  ],
  "뷰티/패션": [
    "D2C 뷰티 브랜드. 자체 몰 + 올리브영 입점.",
    "Z세대 패션 큐레이션. 인스타·틱톡 팔로워 합산 280만.",
  ],
  "금융서비스": [
    "중소상공인 결제 PG. 월 처리액 320억.",
    "B2B 데이터 기반 신용평가 모델 라이선스.",
  ],
};

const STAGE_DISTRIBUTION: { stage: DealStage; weight: number }[] = [
  { stage: "Lead", weight: 18 },
  { stage: "Qualified", weight: 13 },
  { stage: "Matched", weight: 9 },
  { stage: "NDA", weight: 5 },
  { stage: "LOI", weight: 3 },
  { stage: "Closed", weight: 2 },
];

function pickStage(rand: () => number): DealStage {
  const total = STAGE_DISTRIBUTION.reduce((s, x) => s + x.weight, 0);
  let r = rand() * total;
  for (const item of STAGE_DISTRIBUTION) {
    r -= item.weight;
    if (r <= 0) return item.stage;
  }
  return "Lead";
}

function buildFinancials(
  baseRevenue: number,
  baseMargin: number,
  rng: ReturnType<typeof makeRng>,
): CompanyFinancial[] {
  const years = [2023, 2024, 2025];
  const growth = [0.82, 0.93, 1.0]; // 2023 → 2024 → 2025
  return years.map((year, i) => {
    const revenue = Math.round(baseRevenue * growth[i] * rng.float(0.95, 1.05));
    const margin = +(baseMargin + rng.float(-1.5, 1.5)).toFixed(1);
    const ebitda = Math.round(revenue * (margin / 100));
    const operatingIncome = Math.round(ebitda * rng.float(0.65, 0.82));
    return { year, revenue, operatingIncome, ebitda, margin };
  });
}

function makeCompany(idx: number, rng: ReturnType<typeof makeRng>): Company {
  const industry = rng.pick(INDUSTRIES);
  const region = rng.pick(REGIONS);
  const aliases = ALIASES_BY_INDUSTRY[industry];
  const aliasBase = rng.pick(aliases);
  const suffix = rng.bool(0.3) ? `` : ` ${rng.pick(["코리아", "글로벌", "원", "랩", "X"])}`;
  const alias = `주식회사 ${aliasBase}${suffix}`;
  const foundedYear = rng.int(2003, 2021);
  const employees = Math.max(8, Math.round(rng.normal(60, 28)));
  const revenue = Math.max(30, Math.round(rng.normal(120, 80))); // 백만원 단위 X 100 = 억원 단위
  // 위 revenue는 억 단위로 30~수백.
  const revenueM = revenue * 100; // 백만원
  const ebitdaMargin = +rng.float(8, 23).toFixed(1);
  const ebitdaM = Math.round(revenueM * (ebitdaMargin / 100));
  const multiple = +rng.float(5, 10).toFixed(1);
  const askingPrice = Math.round(ebitdaM * multiple);
  const stage = pickStage(rng.next);
  const matchScore = Math.round(rng.float(45, 95));
  const daysSinceListed = rng.int(2, 180);
  const registeredAt = isoFromOffsetDays(-daysSinceListed);
  const health: DealHealth =
    daysSinceListed < 30 ? "healthy" : daysSinceListed < 90 ? "warm" : "cold";
  const reasonForSale = rng.pick(REASONS_FOR_SALE);
  const description = rng.pick(DESCRIPTIONS_BY_INDUSTRY[industry]);
  const financials = buildFinancials(revenueM, ebitdaMargin, rng);
  const dataSources = rng.pickN(
    ["dart", "nts", "kodit", "kis", "nice", "kosis", "news", "kb-realestate"],
    rng.int(3, 6),
  );

  return {
    id: `D-${String(idx + 1).padStart(4, "0")}`,
    alias,
    industry,
    region,
    foundedYear,
    employees,
    revenue: revenueM,
    ebitda: ebitdaM,
    ebitdaMargin,
    askingPrice,
    askingMultiple: multiple,
    stage,
    matchScore,
    registeredAt,
    daysSinceListed,
    health,
    reasonForSale,
    description,
    financials,
    dataSources,
  };
}

export const COMPANIES: Company[] = (() => {
  const rng = makeRng(20260517);
  const list: Company[] = [];
  for (let i = 0; i < 50; i++) list.push(makeCompany(i, rng));
  return list;
})();

export const COMPANY_BY_ID = new Map(COMPANIES.map((c) => [c.id, c]));
