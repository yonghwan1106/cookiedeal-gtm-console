import { DealsExplorer } from "@/components/deals/deals-explorer";
import { COMPANIES } from "@/data/companies";
import { Badge } from "@/components/ui/badge";

export default function DealsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-fg-faint">
          <Badge variant="blue">DEALS</Badge>
          <span className="font-mono">총 {COMPANIES.length}건</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">
          매물 익스플로러
        </h1>
        <p className="text-sm text-fg-muted mt-1 max-w-2xl">
          업종·지역·매출 구간을 필터링하여 후보 매물을 빠르게 좁힙니다.
          행 클릭으로 상세 정보·재무 차트·매칭 바이어 TOP 5로 이동합니다.
        </p>
      </div>
      <DealsExplorer />
    </div>
  );
}
