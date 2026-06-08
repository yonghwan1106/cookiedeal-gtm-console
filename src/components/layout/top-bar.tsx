"use client";

import { useEffect, useState } from "react";
import { Activity, Search } from "lucide-react";

function useTickingClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function TopBar() {
  const now = useTickingClock();
  const time = now
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
    : "--:--:--";
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border-base bg-bg-base/80 backdrop-blur px-5">
      <span className="px-2.5 h-6 rounded-md bg-gradient-to-r from-accent-amber/25 to-accent-amber/10 border border-accent-amber/50 text-accent-amber text-[10px] font-bold flex items-center gap-1.5 shrink-0">
        <span>★</span>
        <span>채용 연계형 기업 실무 프로젝트 출품작 · 선발분야 ② AI Product Engineer (Data)</span>
      </span>
      <div className="flex items-center gap-2 text-xs text-fg-muted">
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green live-dot" />
        <span className="font-mono">파이프라인 정상</span>
      </div>
      <span className="text-fg-faint">·</span>
      <div className="text-xs text-fg-muted">
        마지막 동기화 <span className="text-fg font-mono">7m ago</span> · DART
      </div>
      <span className="text-fg-faint">·</span>
      <div className="text-xs text-fg-muted hidden lg:flex items-center gap-1">
        <Activity className="h-3.5 w-3.5" />
        <span className="font-mono">P95 820ms</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 h-8 rounded-md border border-border-base bg-bg-card text-xs text-fg-faint">
          <Search className="h-3.5 w-3.5" />
          <span>매물·바이어 검색</span>
          <kbd className="ml-2 px-1.5 py-0.5 rounded bg-bg-elevated border border-border-base text-[10px] font-mono">
            ⌘K
          </kbd>
        </div>
        <div className="text-xs font-mono text-fg-muted tabular-nums">
          KST · {time}
        </div>
        <div className="flex items-center gap-2 px-2.5 h-8 rounded-md border border-border-base bg-bg-card">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-[10px] font-bold text-white">
            박
          </div>
          <span className="text-xs">박용환</span>
        </div>
      </div>
    </header>
  );
}
