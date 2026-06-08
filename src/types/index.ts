export type Industry =
  | "IT/SaaS"
  | "F&B"
  | "제조"
  | "유통/물류"
  | "헬스케어"
  | "교육"
  | "뷰티/패션"
  | "금융서비스";

export type Region =
  | "서울"
  | "경기"
  | "인천"
  | "부산"
  | "대구"
  | "대전"
  | "광주"
  | "기타";

export type DealStage =
  | "Lead"
  | "Qualified"
  | "Matched"
  | "NDA"
  | "LOI"
  | "Closed";

export type DealHealth = "healthy" | "warm" | "cold";

export interface CompanyFinancial {
  year: number;
  revenue: number; // 백만원
  operatingIncome: number; // 백만원
  ebitda: number; // 백만원
  margin: number; // %
}

export interface Company {
  id: string;
  alias: string; // 가명
  industry: Industry;
  region: Region;
  foundedYear: number;
  employees: number;
  revenue: number; // 백만원 (최근)
  ebitda: number; // 백만원 (최근)
  ebitdaMargin: number; // %
  askingPrice: number; // 백만원
  askingMultiple: number; // EBITDA 배수
  stage: DealStage;
  matchScore: number; // 0~100
  registeredAt: string; // ISO date
  daysSinceListed: number;
  health: DealHealth;
  reasonForSale: string;
  description: string;
  financials: CompanyFinancial[]; // 3년치
  dataSources: string[]; // source IDs
}

export type BuyerType =
  | "PE 펀드"
  | "전략적 SI"
  | "패밀리오피스"
  | "해외 SI"
  | "VC";

export interface Buyer {
  id: string;
  name: string; // 가명
  type: BuyerType;
  preferredIndustries: Industry[];
  preferredRegions: Region[];
  budgetMin: number; // 백만원
  budgetMax: number; // 백만원
  activeDeals: number;
  closedDeals: number;
  description: string;
}

export interface MatchReason {
  label: string;
  weight: number; // 0~1
  detail: string;
}

export interface Match {
  id: string;
  companyId: string;
  buyerId: string;
  score: number; // 0~100
  reasons: MatchReason[];
  recommendedAt: string; // ISO
  status: "pending" | "viewed" | "contacted" | "nda" | "loi" | "closed" | "passed";
}

export type SourceCategory =
  | "공시"
  | "사업자정보"
  | "신용평가"
  | "통계"
  | "뉴스"
  | "부동산"
  | "금융"
  | "채용";

export type SourceHealth = "green" | "yellow" | "red";

export interface DataSource {
  id: string;
  name: string;
  fullName: string;
  category: SourceCategory;
  description: string;
  schema: { field: string; type: string; description: string }[];
  updateFrequency: string;
  sla: string;
  reliability: number; // 0~100
  avgLatencyMs: number;
  successRate7d: number; // 0~100
  lastSyncAt: string; // ISO
  nextRunAt: string; // ISO
  health: SourceHealth;
  recordsToday: number;
  sampleRow: Record<string, unknown>;
}

export type EtlStatus = "success" | "running" | "failed" | "delayed";

export interface EtlRun {
  id: string;
  sourceId: string;
  startedAt: string; // ISO
  finishedAt: string | null; // ISO or null if running
  durationMs: number; // 0 if running
  rowsProcessed: number;
  rowsFailed: number;
  status: EtlStatus;
  errorMessage?: string;
}

export type ActivityType =
  | "deal_listed"
  | "match_recommended"
  | "nda_signed"
  | "loi_signed"
  | "deal_closed"
  | "deal_passed"
  | "buyer_joined"
  | "source_synced"
  | "alert";

export interface Activity {
  id: string;
  type: ActivityType;
  at: string; // ISO
  actor: string;
  target: string;
  detail: string;
}

// ─────────────────────────────────────────────────────────────
// ② AI Product Engineer (Data) 직무 역량 시연용 신규 도메인
// 4개 도메인 ETL(채용) · Entity Resolution · 데이터 품질 · LLM 시그널
// ─────────────────────────────────────────────────────────────

// 조직 성장 시그널: 채용 모집인원 증가율 기반
export type GrowthSignal = "급증" | "확장" | "유지" | "감축";

// 채용공고 (사람인·잡코리아·원티드 통합) — 회사 가명과 연결
export interface JobPosting {
  id: string;
  companyAlias: string; // companies.ts 가명과 연결 (예: "케이세븐테크")
  bizNo: string;
  title: string; // 직무명
  headcount: number; // 모집인원
  postedAt: string; // ISO
  source: "사람인" | "잡코리아" | "원티드";
  seniorityMix: string; // 예: "주니어 60% · 시니어 40%"
  growthSignal: GrowthSignal;
}

// Entity Resolution: 한 소스에서 들어온 원시 멤버 레코드
export interface EntityMemberRecord {
  sourceId: string;
  rawName: string; // 원문 회사명 (소스별 표기 상이)
  bizNo: string | null;
  fields: Record<string, unknown>;
  matchScore: number; // 0~1 (canonical 과의 유사도)
  matchedBy: "biz_no" | "name_exact" | "name_fuzzy";
  conflicts?: string[]; // 필드 충돌 진단 (사람이 읽는 한 줄)
}

// Entity Resolution 결과: 다출처 병합된 단일 엔터티 클러스터
export interface ResolvedEntity {
  canonicalId: string;
  canonicalName: string; // 정규화된 대표 회사명
  bizNo: string;
  members: EntityMemberRecord[];
  confidence: number; // 0~1 클러스터 신뢰도
  conflictCount: number;
  sourceCount: number;
}

// 데이터 품질 4축
export type QualityAxis =
  | "completeness"
  | "freshness"
  | "consistency"
  | "validity";

export interface QualityScore {
  sourceId: string;
  sourceName: string;
  completeness: number; // 0~100 스키마 충실도·null 비율
  freshness: number; // 0~100 신선도 (lastSync vs 주기)
  consistency: number; // 0~100 ER 충돌·표기 일관성
  validity: number; // 0~100 successRate·신뢰도
  overall: number; // 0~100 가중 평균
  issues: string[]; // 사람이 읽는 진단 한 줄들
}

// LLM 시그널 추출: NER 엔터티
export interface NerEntity {
  text: string;
  type: "company" | "person" | "money" | "role" | "date" | "org";
  confidence: number; // 0~1
  normalized?: string; // 정규화 표현 (예: 금액 → 백만원, 회사 → canonical)
}

// LLM 시그널 추출: 원문 텍스트 → 구조화 출력
export interface ExtractedSignal {
  id: string;
  rawText: string; // 원문 (뉴스/채용)
  sourceKind: "news" | "job";
  entities: NerEntity[];
  topic: string;
  growthScore: number; // 0~100 성장 시그널 스코어
  rationale: string; // 한 줄 근거
  model: string; // 정직한 라벨링: 프로토타입 = 결정론적 시뮬레이션
  latencyMs: number; // 시뮬레이션 값
  tokensIn: number; // 시뮬레이션 값
  tokensOut: number; // 시뮬레이션 값
}
