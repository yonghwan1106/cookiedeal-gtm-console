import type { Match } from "@/types";
import { COMPANIES } from "./companies";
import { BUYERS } from "./buyers";
import { DEFAULT_WEIGHTS, scoreMatch } from "@/lib/matching";
import { makeRng } from "@/lib/seed";
import { isoFromOffsetDays } from "@/lib/utils";

function computeAll(): Match[] {
  const rng = makeRng(424242);
  const all: Match[] = [];
  for (const c of COMPANIES) {
    for (const b of BUYERS) {
      const { score, reasons } = scoreMatch(c, b, DEFAULT_WEIGHTS);
      const status = (() => {
        if (score < 40) return "passed" as const;
        if (score < 55) return "pending" as const;
        if (score < 70) return rng.bool(0.7) ? "viewed" : "pending";
        if (score < 80) return rng.bool(0.6) ? "contacted" : "viewed";
        if (score < 90) return rng.bool(0.5) ? "nda" : "contacted";
        return rng.bool(0.4) ? "loi" : "nda";
      })();
      all.push({
        id: `M-${c.id}-${b.id}`,
        companyId: c.id,
        buyerId: b.id,
        score,
        reasons,
        recommendedAt: isoFromOffsetDays(-rng.int(0, 60)),
        status,
      });
    }
  }
  return all.sort((a, b) => b.score - a.score);
}

export const ALL_MATCHES: Match[] = computeAll();
export const TOP_MATCHES: Match[] = ALL_MATCHES.slice(0, 200);

export function matchesForCompany(companyId: string, limit = 5): Match[] {
  return ALL_MATCHES.filter((m) => m.companyId === companyId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function matchesForBuyer(buyerId: string, limit = 5): Match[] {
  return ALL_MATCHES.filter((m) => m.buyerId === buyerId)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
