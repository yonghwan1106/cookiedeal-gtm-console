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
  | "금융";

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
