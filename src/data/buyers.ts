import type { Buyer, BuyerType, Industry, Region } from "@/types";
import { makeRng } from "@/lib/seed";

const TYPES: BuyerType[] = ["PE 펀드", "전략적 SI", "패밀리오피스", "해외 SI", "VC"];

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
  "서울", "경기", "인천", "부산", "대구", "대전", "광주", "기타",
];

const NAMES: Record<BuyerType, string[]> = {
  "PE 펀드": [
    "에버그린캐피탈 파트너스",
    "한라성장펀드",
    "유니콘 PEF I호",
    "스카이라인 캐피탈",
    "골든브릿지 PE",
    "노바인베스트먼트",
    "SLI 캐피탈",
    "이스트게이트 PEF",
  ],
  "전략적 SI": [
    "현우그룹",
    "동양홀딩스",
    "케이엘 미디어",
    "선진산업",
    "한반도 모빌리티",
    "리딩커머스",
    "넥스트제약",
  ],
  "패밀리오피스": [
    "이수 패밀리오피스",
    "한일 멀티오피스",
    "그래비티 FO",
    "오크밸리 패밀리",
  ],
  "해외 SI": [
    "Asahi Holdings",
    "Trinity Asia Partners",
    "Singapore Global Ventures",
    "Pacific Strategic Group",
  ],
  "VC": [
    "퓨처랩 벤처스",
    "노드 캐피탈",
    "딥아크 벤처스",
  ],
};

const DESCRIPTIONS: Record<BuyerType, string[]> = {
  "PE 펀드": [
    "AUM 8,200억. 중견기업 바이아웃·성장자본 전문.",
    "AUM 1.2조. 보유 펀드 만기 도래, 신규 딜 활발.",
    "AUM 4,800억. ESG·디지털 전환 테마 집중.",
  ],
  "전략적 SI": [
    "동종 산업 수직계열화 의도. 기술 확보 + 인력 흡수형 M&A.",
    "유통망 확장 위한 채널 인수 선호.",
    "신사업 진출. 매출 100~500억대 중견기업 타깃.",
  ],
  "패밀리오피스": [
    "장기 보유 지향. 안정 현금흐름 사업 선호.",
    "2세 경영 승계용 사업 인수 검토 중.",
  ],
  "해외 SI": [
    "동북아 진출 거점 확보용. 한국 기업 지분 인수 활발.",
    "공급망 다변화 목적. 제조·소재 위주.",
  ],
  "VC": [
    "Series B+ 그로스 라운드. 흑자 전환 직전 SaaS 선호.",
    "테크 + AI 융합 영역. 인수 후 통합 노출.",
  ],
};

function pickWeighted(rng: ReturnType<typeof makeRng>): BuyerType {
  // PE > SI > FO > 해외SI > VC
  const dist: { t: BuyerType; w: number }[] = [
    { t: "PE 펀드", w: 11 },
    { t: "전략적 SI", w: 10 },
    { t: "패밀리오피스", w: 4 },
    { t: "해외 SI", w: 3 },
    { t: "VC", w: 2 },
  ];
  const total = dist.reduce((s, x) => s + x.w, 0);
  let r = rng.float(0, total);
  for (const item of dist) {
    r -= item.w;
    if (r <= 0) return item.t;
  }
  return "PE 펀드";
}

function makeBuyer(idx: number, rng: ReturnType<typeof makeRng>): Buyer {
  const type = pickWeighted(rng);
  const pool = NAMES[type];
  const name = pool[idx % pool.length] + (idx >= pool.length ? ` ${Math.floor(idx / pool.length) + 1}` : "");
  const preferredIndustries = rng.pickN(INDUSTRIES, rng.int(1, 3));
  const preferredRegions = rng.pickN(REGIONS, rng.int(1, 4));
  const budgetMin = rng.int(30, 200) * 100; // 백만원
  const budgetMax = budgetMin * rng.int(2, 6);
  return {
    id: `B-${String(idx + 1).padStart(4, "0")}`,
    name,
    type,
    preferredIndustries,
    preferredRegions,
    budgetMin,
    budgetMax,
    activeDeals: rng.int(1, 8),
    closedDeals: rng.int(0, 14),
    description: rng.pick(DESCRIPTIONS[type]),
  };
}

export const BUYERS: Buyer[] = (() => {
  const rng = makeRng(771104);
  const list: Buyer[] = [];
  for (let i = 0; i < 30; i++) list.push(makeBuyer(i, rng));
  return list;
})();

export const BUYER_BY_ID = new Map(BUYERS.map((b) => [b.id, b]));
