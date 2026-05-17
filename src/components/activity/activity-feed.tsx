import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  FileSignature,
  HandshakeIcon,
  Sparkles,
  UserPlus,
  XCircle,
  RefreshCw,
} from "lucide-react";
import type { Activity, ActivityType } from "@/types";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICON: Record<ActivityType, React.ElementType> = {
  deal_listed: Briefcase,
  match_recommended: Sparkles,
  nda_signed: FileSignature,
  loi_signed: HandshakeIcon,
  deal_closed: CheckCircle2,
  deal_passed: XCircle,
  buyer_joined: UserPlus,
  source_synced: RefreshCw,
  alert: AlertCircle,
};

const COLOR: Record<ActivityType, string> = {
  deal_listed: "text-accent-blue",
  match_recommended: "text-accent-purple",
  nda_signed: "text-accent-amber",
  loi_signed: "text-accent-amber",
  deal_closed: "text-accent-green",
  deal_passed: "text-fg-faint",
  buyer_joined: "text-accent-blue",
  source_synced: "text-fg-muted",
  alert: "text-accent-red",
};

const LABEL: Record<ActivityType, string> = {
  deal_listed: "신규 매물",
  match_recommended: "AI 매칭",
  nda_signed: "NDA 체결",
  loi_signed: "LOI 제출",
  deal_closed: "거래 종결",
  deal_passed: "패스",
  buyer_joined: "바이어 등록",
  source_synced: "동기화",
  alert: "알림",
};

export function ActivityFeed({ items }: { items: Activity[] }) {
  return (
    <ul className="px-5 pb-5 space-y-3">
      {items.map((a) => {
        const Icon = ICON[a.type];
        return (
          <li key={a.id} className="flex gap-3 items-start text-xs">
            <div
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-elevated border border-border-base",
                COLOR[a.type],
              )}
            >
              <Icon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium text-fg truncate">{a.actor}</span>
                <span className="text-fg-faint">→</span>
                <span className="text-fg-muted truncate">{a.target}</span>
                <span className="ml-auto text-fg-faint font-mono tabular-nums">
                  {timeAgo(a.at)}
                </span>
              </div>
              <div className="text-fg-muted mt-0.5 line-clamp-2">
                <span className={cn("mr-1.5", COLOR[a.type])}>·</span>
                {LABEL[a.type]} · {a.detail}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
