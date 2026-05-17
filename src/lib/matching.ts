import type { Buyer, Company, MatchReason } from "@/types";

export interface MatchWeights {
  industry: number;
  size: number;
  region: number;
  other: number;
}

export const DEFAULT_WEIGHTS: MatchWeights = {
  industry: 0.4,
  size: 0.3,
  region: 0.2,
  other: 0.1,
};

export interface MatchScore {
  score: number; // 0~100
  breakdown: { key: keyof MatchWeights; value: number; weight: number }[];
  reasons: MatchReason[];
}

export function scoreMatch(
  company: Company,
  buyer: Buyer,
  weights: MatchWeights = DEFAULT_WEIGHTS,
): MatchScore {
  // 1) industry: 1 if buyer preferred contains, else 0
  const industryHit = buyer.preferredIndustries.includes(company.industry) ? 1 : 0.15;

  // 2) size: gaussian-style proximity between askingPrice and buyer budget midpoint
  const budgetMid = (buyer.budgetMin + buyer.budgetMax) / 2;
  const budgetRange = (buyer.budgetMax - buyer.budgetMin) / 2 || 1;
  const sizeDistance = Math.abs(company.askingPrice - budgetMid) / budgetRange;
  // 0 → perfect, >2 → poor
  const sizeScore = Math.max(0, 1 - Math.min(sizeDistance, 2) / 2);

  // 3) region: 1 if preferred, 0.5 if 기타, else 0.2
  let regionScore = 0.2;
  if (buyer.preferredRegions.includes(company.region)) regionScore = 1;
  else if (company.region === "기타") regionScore = 0.5;

  // 4) other: stage bonus + match score baseline + employees fit
  const stageBonus = ["Matched", "NDA", "LOI"].includes(company.stage) ? 1 : 0.5;
  const empScore = company.employees >= 30 && company.employees <= 130 ? 1 : 0.6;
  const otherScore = (stageBonus + empScore) / 2;

  const breakdown: MatchScore["breakdown"] = [
    { key: "industry", value: industryHit, weight: weights.industry },
    { key: "size", value: sizeScore, weight: weights.size },
    { key: "region", value: regionScore, weight: weights.region },
    { key: "other", value: otherScore, weight: weights.other },
  ];

  const totalWeight =
    weights.industry + weights.size + weights.region + weights.other || 1;
  const weighted = breakdown.reduce((s, b) => s + b.value * b.weight, 0);
  const normalized = (weighted / totalWeight) * 100;
  const score = Math.round(Math.max(0, Math.min(100, normalized)));

  const reasons: MatchReason[] = [
    {
      label: "산업 일치",
      weight: weights.industry,
      detail:
        industryHit === 1
          ? `${company.industry} — 바이어 선호 산업과 일치`
          : `${company.industry} — 바이어 선호 산업과 불일치 (인접 산업 가점만 반영)`,
    },
    {
      label: "규모 적합",
      weight: weights.size,
      detail: `매각희망가가 바이어 예산 중간값 대비 편차 ${(sizeDistance * 100).toFixed(0)}% — 적합도 ${(sizeScore * 100).toFixed(0)}%`,
    },
    {
      label: "지역 근접",
      weight: weights.region,
      detail:
        regionScore === 1
          ? `본사 ${company.region} — 바이어 선호 지역`
          : `본사 ${company.region} — 바이어 선호 지역에서 다소 벗어남`,
    },
    {
      label: "거래 단계·인력",
      weight: weights.other,
      detail: `현재 단계 ${company.stage} · 인력 ${company.employees}명 — 종합 보너스 ${(otherScore * 100).toFixed(0)}%`,
    },
  ];

  return { score, breakdown, reasons };
}
