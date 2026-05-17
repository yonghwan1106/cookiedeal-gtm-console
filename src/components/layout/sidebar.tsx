"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Workflow,
  Database,
  Cookie,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard, count: null },
  { href: "/deals", label: "매물", icon: Briefcase, count: 50 },
  { href: "/matches", label: "AI 매칭", icon: Sparkles, count: 200 },
  { href: "/pipeline", label: "ETL 파이프라인", icon: Workflow, count: 8 },
  { href: "/sources", label: "데이터 소스", icon: Database, count: 8 },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border-base bg-bg-card">
      <div className="flex items-center gap-2 px-5 h-14 border-b border-border-base">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-amber-700 text-white">
          <Cookie className="h-4 w-4" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">Cookie Deal</span>
          <span className="text-[10px] text-fg-faint uppercase tracking-widest">
            GTM Intelligence
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                active
                  ? "bg-gradient-to-r from-accent-blue/15 to-transparent text-fg border-l-2 border-accent-blue pl-[10px]"
                  : "text-fg-muted hover:text-fg hover:bg-bg-elevated",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.count !== null && (
                <span className="text-xs text-fg-faint font-mono">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-border-base text-[11px] text-fg-faint">
        <div className="flex items-center justify-between mb-2">
          <span className="uppercase tracking-widest">Environment</span>
          <span className="px-1.5 py-0.5 rounded bg-accent-amber/10 text-accent-amber font-mono text-[10px]">
            DEMO
          </span>
        </div>
        <div className="text-fg-muted leading-relaxed">
          박용환 · 2026 프렉탈테크놀로지
          <br />
          채용 연계 실무 프로젝트
          <br />
          신청서 첨부 프로토타입
        </div>
      </div>
    </aside>
  );
}
