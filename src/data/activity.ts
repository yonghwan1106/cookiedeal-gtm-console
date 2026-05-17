import type { Activity, ActivityType } from "@/types";
import { COMPANIES } from "./companies";
import { BUYERS } from "./buyers";
import { SOURCES } from "./sources";
import { makeRng } from "@/lib/seed";
import { isoFromOffsetMinutes } from "@/lib/utils";

const TYPE_WEIGHT: { t: ActivityType; w: number }[] = [
  { t: "match_recommended", w: 12 },
  { t: "deal_listed", w: 8 },
  { t: "nda_signed", w: 5 },
  { t: "source_synced", w: 6 },
  { t: "buyer_joined", w: 3 },
  { t: "loi_signed", w: 3 },
  { t: "deal_closed", w: 2 },
  { t: "deal_passed", w: 4 },
  { t: "alert", w: 3 },
];

function pickType(rng: ReturnType<typeof makeRng>): ActivityType {
  const total = TYPE_WEIGHT.reduce((s, x) => s + x.w, 0);
  let r = rng.float(0, total);
  for (const item of TYPE_WEIGHT) {
    r -= item.w;
    if (r <= 0) return item.t;
  }
  return "match_recommended";
}

export const ACTIVITIES: Activity[] = (() => {
  const rng = makeRng(99119);
  const acts: Activity[] = [];
  let cursor = 0;
  for (let i = 0; i < 50; i++) {
    cursor -= rng.int(8, 90); // 분 단위 거꾸로
    const type = pickType(rng);
    const company = rng.pick(COMPANIES);
    const buyer = rng.pick(BUYERS);
    const source = rng.pick(SOURCES);
    let actor = company.alias;
    let target = "";
    let detail = "";
    switch (type) {
      case "deal_listed":
        actor = "신규 매물";
        target = company.alias;
        detail = `${company.industry} · ${company.region} · 매출 ${(company.revenue / 100).toFixed(0)}억`;
        break;
      case "match_recommended":
        actor = buyer.name;
        target = company.alias;
        detail = `AI 매칭 점수 ${Math.round(rng.float(70, 95))}`;
        break;
      case "nda_signed":
        actor = buyer.name;
        target = company.alias;
        detail = "NDA 체결 완료";
        break;
      case "loi_signed":
        actor = buyer.name;
        target = company.alias;
        detail = "LOI 제출";
        break;
      case "deal_closed":
        actor = buyer.name;
        target = company.alias;
        detail = `거래 종결 — 거래가 비공개`;
        break;
      case "deal_passed":
        actor = buyer.name;
        target = company.alias;
        detail = "검토 후 패스";
        break;
      case "buyer_joined":
        actor = buyer.name;
        target = "쿠키딜";
        detail = `${buyer.type} 신규 등록`;
        break;
      case "source_synced":
        actor = source.name;
        target = "데이터 파이프라인";
        detail = `${source.fullName} 동기화 완료 (${rng.int(120, 980)}건)`;
        break;
      case "alert":
        actor = "알림";
        target = source.name;
        detail = `평균 응답시간 P95 ${rng.int(1500, 4200)}ms — 임계 초과`;
        break;
    }
    acts.push({
      id: `A-${String(i + 1).padStart(4, "0")}`,
      type,
      at: isoFromOffsetMinutes(cursor),
      actor,
      target,
      detail,
    });
  }
  return acts;
})();
