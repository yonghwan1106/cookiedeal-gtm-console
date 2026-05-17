import type { EtlRun, EtlStatus } from "@/types";
import { SOURCES } from "./sources";
import { makeRng } from "@/lib/seed";
import { isoFromOffsetMinutes } from "@/lib/utils";

// 7일 (168시간) × 8개 소스 × 시간당 평균 1회 = 약 1,344건. 일부는 의도된 실패/지연.

function makeRuns(): EtlRun[] {
  const rng = makeRng(202604);
  const runs: EtlRun[] = [];
  let id = 0;
  for (const src of SOURCES) {
    // 소스마다 다른 빈도
    const intervalMin =
      src.id === "news" ? 5 :
      src.id === "dart" ? 60 :
      src.id === "nts" ? 360 :
      src.id === "kosis" ? 1440 :
      720;
    const periodMin = 7 * 24 * 60; // 7 days
    let cursor = -periodMin;
    while (cursor < 0) {
      const startedAt = isoFromOffsetMinutes(cursor);
      const baseDur = src.avgLatencyMs;
      const variance = rng.float(0.6, 1.8);
      const durationMs = Math.round(baseDur * variance);
      const finishedAt = isoFromOffsetMinutes(cursor + Math.ceil(durationMs / 60000));
      const failProb = 1 - src.successRate7d / 100;
      const delayProb = src.id === "news" || src.id === "kodit" ? 0.04 : 0.015;
      const r = rng.next();
      let status: EtlStatus;
      let rowsFailed = 0;
      let errorMessage: string | undefined;
      if (r < failProb) {
        status = "failed";
        rowsFailed = rng.int(1, 12);
        errorMessage = rng.pick([
          "Connection timeout after 30s",
          "Upstream 500 — service unavailable",
          "Schema validation failed: missing field 'biz_no'",
          "Rate limit exceeded (429)",
        ]);
      } else if (r < failProb + delayProb) {
        status = "delayed";
      } else {
        status = "success";
      }
      const rowsProcessed = Math.round(
        rng.float(40, 220) * (src.id === "news" ? 0.8 : 1),
      );
      runs.push({
        id: `R-${String(++id).padStart(6, "0")}`,
        sourceId: src.id,
        startedAt,
        finishedAt,
        durationMs,
        rowsProcessed: status === "failed" ? rng.int(0, 40) : rowsProcessed,
        rowsFailed,
        status,
        errorMessage,
      });
      cursor += intervalMin;
    }
  }
  // sort by startedAt desc
  return runs.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

export const ETL_RUNS: EtlRun[] = makeRuns();

export function runsBySource(sourceId: string, limit = 50): EtlRun[] {
  return ETL_RUNS.filter((r) => r.sourceId === sourceId).slice(0, limit);
}
