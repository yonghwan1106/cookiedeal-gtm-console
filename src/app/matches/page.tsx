import { MatchesExplorer } from "@/components/matches/matches-explorer";
import { Badge } from "@/components/ui/badge";

export default function MatchesPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-fg-faint">
          <Badge variant="purple">AI MATCHING</Badge>
          <span className="font-mono">실시간 가중치 재계산</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1">AI 매칭 매트릭스</h1>
        <p className="text-sm text-fg-muted mt-1 max-w-2xl">
          셀러 × 바이어 매트릭스를 한눈에 보고, 가중치 슬라이더로 산업·규모·지역·기타 비중을 조정하면
          전체 매칭 점수가 실시간으로 재계산됩니다.
        </p>
      </div>
      <MatchesExplorer />
    </div>
  );
}
