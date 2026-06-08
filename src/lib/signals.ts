import type { ExtractedSignal, NerEntity } from "@/types";
import { makeRng } from "@/lib/seed";

// ─────────────────────────────────────────────────────────────
// LLM 시그널 추출 데모 — 뉴스/채용 원문 텍스트 → NER(회사·인물·금액·
// 직무·날짜·조직) + topic 분류 + 성장 시그널 스코어.
//
// ⚠️ 정직한 라벨링: 운영 환경에서는 Claude API 로 추출하지만,
//   이 프로토타입은 **결정론적 시뮬레이션**(규칙 기반 매칭)이다.
//   실제 라이브 API 호출을 하지 않으며 model 필드에 명시한다.
//   tokensIn/Out/latencyMs 는 그럴듯한 시뮬레이션 값이다.
// ─────────────────────────────────────────────────────────────

export const SIGNAL_MODEL_LABEL =
  "claude-sonnet (prototype: deterministic simulation)";

// 원문 샘플 (news/job 혼합).
interface SampleInput {
  id: string;
  sourceKind: "news" | "job";
  text: string;
  topic: string;
}

const SAMPLES: SampleInput[] = [
  {
    id: "S-001",
    sourceKind: "news",
    text:
      "케이세븐테크가 2026년 5월 15일 시리즈 B 후속 라운드로 120억원 투자를 유치했다고 밝혔다. 김민수 대표는 데이터 엔지니어링 조직을 두 배로 확대하겠다고 말했다.",
    topic: "funding",
  },
  {
    id: "S-002",
    sourceKind: "job",
    text:
      "노바스택, 백엔드 엔지니어 8명 및 ML 엔지니어 4명 대규모 채용. 시니어 중심으로 플랫폼 조직 신설 예정. 게재일 2026-05-28.",
    topic: "hiring",
  },
  {
    id: "S-003",
    sourceKind: "news",
    text:
      "메디브릿지가 보건복지부와 만성질환 관리 시범사업 계약을 체결했다. 계약 규모는 약 38억원으로 알려졌다. 이수정 부사장이 사업을 총괄한다.",
    topic: "partnership",
  },
  {
    id: "S-004",
    sourceKind: "job",
    text:
      "페이브릿지 프로덕트 매니저 2명, 그로스 마케터 3명 채용 공고. 2026년 6월 1일 게재. 결제 인프라 확장에 따른 충원.",
    topic: "hiring",
  },
  {
    id: "S-005",
    sourceKind: "news",
    text:
      "헬릭스랩스가 신임 CTO로 박지훈 전 카카오 디렉터를 영입했다. 2026-05-20 발표. 글로벌 진출을 위한 R&D 조직 개편의 일환이다.",
    topic: "leadership",
  },
  {
    id: "S-006",
    sourceKind: "news",
    text:
      "콜드체인코리아가 경영난으로 일부 물류 거점을 폐쇄하고 구조조정에 착수했다. 250억원 규모 부채 상환 압박이 배경으로 지목된다.",
    topic: "crisis",
  },
  {
    id: "S-007",
    sourceKind: "job",
    text:
      "리프트워크스 데이터 분석가 1명 채용. 2026-05-12 게재. 경력 무관, 신입 환영. 소규모 충원.",
    topic: "hiring",
  },
  {
    id: "S-008",
    sourceKind: "news",
    text:
      "글로우코스메틱이 올리브영 전 채널 입점을 확정하고 2026년 하반기 매출 목표를 상향 조정했다. 최은비 대표가 직접 IR 에 나섰다.",
    topic: "growth",
  },
];

// 규칙 기반 NER 추출기 (결정론적 시뮬레이션).
// 운영에서는 LLM 이 담당하지만, 여기서는 사전/정규식 매칭으로 재현한다.
const COMPANY_DICT = [
  "케이세븐테크",
  "노바스택",
  "메디브릿지",
  "페이브릿지",
  "헬릭스랩스",
  "콜드체인코리아",
  "리프트워크스",
  "글로우코스메틱",
];

const ROLE_DICT = [
  "데이터 엔지니어",
  "백엔드 엔지니어",
  "ML 엔지니어",
  "프로덕트 매니저",
  "그로스 마케터",
  "데이터 분석가",
  "CTO",
  "CFO",
  "대표",
  "부사장",
  "디렉터",
];

const ORG_DICT = ["보건복지부", "카카오", "올리브영"];

// 한글 이름 + 직함 패턴 (예: "김민수 대표", "박지훈 전 카카오 디렉터").
const PERSON_RE = /([가-힣]{2,4})\s*(?:전\s+[가-힣A-Za-z]+\s+)?(?:대표|부사장|CTO|CFO|디렉터|이사)/g;
// 금액 패턴 (예: "120억원", "약 38억원", "250억원 규모").
const MONEY_RE = /(?:약\s*)?(\d{1,4})\s*억\s*원/g;
// 날짜 패턴 (ISO 또는 한글).
const DATE_RE = /(\d{4})[-.년]\s*(\d{1,2})[-.월]\s*(\d{1,2})일?/g;

function extractEntities(text: string): NerEntity[] {
  const out: NerEntity[] = [];

  for (const c of COMPANY_DICT) {
    if (text.includes(c)) {
      out.push({ text: c, type: "company", confidence: 0.98, normalized: c });
    }
  }
  for (const o of ORG_DICT) {
    if (text.includes(o)) {
      out.push({ text: o, type: "org", confidence: 0.94 });
    }
  }
  for (const r of ROLE_DICT) {
    if (text.includes(r)) {
      out.push({ text: r, type: "role", confidence: 0.9 });
    }
  }
  let m: RegExpExecArray | null;
  PERSON_RE.lastIndex = 0;
  while ((m = PERSON_RE.exec(text)) !== null) {
    out.push({ text: m[0].trim(), type: "person", confidence: 0.88, normalized: m[1] });
  }
  MONEY_RE.lastIndex = 0;
  while ((m = MONEY_RE.exec(text)) !== null) {
    const eok = parseInt(m[1], 10);
    out.push({
      text: m[0].trim(),
      type: "money",
      confidence: 0.95,
      normalized: `${eok * 100}백만원`, // 억 → 백만원
    });
  }
  DATE_RE.lastIndex = 0;
  while ((m = DATE_RE.exec(text)) !== null) {
    const iso = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    out.push({ text: m[0].trim(), type: "date", confidence: 0.92, normalized: iso });
  }

  // 중복 텍스트 제거 (먼저 발견된 것 우선).
  const seen = new Set<string>();
  return out.filter((e) => {
    const key = `${e.type}:${e.text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// topic + 추출 엔터티 → 성장 시그널 스코어(0~100) + 근거.
const TOPIC_BASE: Record<string, number> = {
  funding: 82,
  hiring: 70,
  partnership: 74,
  growth: 78,
  leadership: 58,
  crisis: 22,
};

function scoreGrowth(
  topic: string,
  entities: NerEntity[],
  text: string,
): { growthScore: number; rationale: string } {
  let score = TOPIC_BASE[topic] ?? 50;
  const reasons: string[] = [];

  const money = entities.find((e) => e.type === "money");
  if (money && topic !== "crisis") {
    score += 8;
    reasons.push(`투자/계약 금액(${money.text}) 포착`);
  }
  if (/두\s*배|확대|신설|대규모|상향/.test(text)) {
    score += 6;
    reasons.push("조직 확대·신설 신호");
  }
  if (/폐쇄|구조조정|경영난|부채/.test(text)) {
    score -= 12;
    reasons.push("리스크 신호 감지");
  }
  const roleCount = entities.filter((e) => e.type === "role").length;
  if (topic === "hiring" && roleCount >= 2) {
    score += 5;
    reasons.push(`복수 직무(${roleCount}종) 동시 채용`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const rationale =
    reasons.length > 0
      ? `${topicLabel(topic)} 기반 + ${reasons.join(", ")}`
      : `${topicLabel(topic)} 단일 시그널`;
  return { growthScore: score, rationale };
}

export function topicLabel(topic: string): string {
  const map: Record<string, string> = {
    funding: "투자 유치",
    hiring: "채용 확대",
    partnership: "파트너십",
    growth: "성장",
    leadership: "경영진 변동",
    crisis: "위기",
  };
  return map[topic] ?? topic;
}

// 파이프라인 실행 (결정론적). 시뮬레이션 token/latency 는 시드 기반.
export const EXTRACTED_SIGNALS: ExtractedSignal[] = (() => {
  const rng = makeRng(20260608);
  return SAMPLES.map((sample) => {
    const entities = extractEntities(sample.text);
    const { growthScore, rationale } = scoreGrowth(
      sample.topic,
      entities,
      sample.text,
    );
    // 그럴듯한 시뮬레이션 메타 (입력 길이에 비례).
    const tokensIn = Math.round(sample.text.length * 1.4) + rng.int(40, 90);
    const tokensOut = entities.length * 18 + rng.int(30, 70);
    const latencyMs = rng.int(620, 1480);
    return {
      id: sample.id,
      rawText: sample.text,
      sourceKind: sample.sourceKind,
      entities,
      topic: sample.topic,
      growthScore,
      rationale,
      model: SIGNAL_MODEL_LABEL,
      latencyMs,
      tokensIn,
      tokensOut,
    };
  });
})();
