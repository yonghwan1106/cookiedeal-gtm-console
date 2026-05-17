"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Filter,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import { COMPANIES } from "@/data/companies";
import type { Company, Industry, Region, DealStage } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StageBadge } from "@/components/deals/stage-badge";
import { cn } from "@/lib/utils";
import { formatKrwShort, formatDateKo } from "@/lib/format";

const INDUSTRIES: ("전체" | Industry)[] = [
  "전체",
  "IT/SaaS",
  "F&B",
  "제조",
  "유통/물류",
  "헬스케어",
  "교육",
  "뷰티/패션",
  "금융서비스",
];

const REGIONS: ("전체" | Region)[] = [
  "전체",
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "대전",
  "광주",
  "기타",
];

type SortKey =
  | "registeredAt"
  | "revenue"
  | "ebitda"
  | "matchScore"
  | "askingPrice";

export function DealsExplorer() {
  const [industry, setIndustry] = React.useState<(typeof INDUSTRIES)[number]>("전체");
  const [region, setRegion] = React.useState<(typeof REGIONS)[number]>("전체");
  const [minRevenue, setMinRevenue] = React.useState(0);
  const [minScore, setMinScore] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<SortKey>("matchScore");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [view, setView] = React.useState<"table" | "cards">("table");

  const filtered = React.useMemo(() => {
    return COMPANIES.filter((c) => {
      if (industry !== "전체" && c.industry !== industry) return false;
      if (region !== "전체" && c.region !== region) return false;
      if (c.revenue / 100 < minRevenue) return false;
      if (c.matchScore < minScore) return false;
      return true;
    }).sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "desc" ? bv.localeCompare(av) : av.localeCompare(bv);
      }
      return sortDir === "desc" ? (bv as number) - (av as number) : (av as number) - (bv as number);
    });
  }, [industry, region, minRevenue, minScore, sortKey, sortDir]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3 text-xs text-fg-muted">
          <Filter className="h-3.5 w-3.5" />
          <span>필터</span>
          <span className="ml-auto font-mono">{filtered.length} / {COMPANIES.length}건</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <FilterChips label="업종" options={INDUSTRIES} value={industry} onChange={setIndustry} />
          <FilterChips label="지역" options={REGIONS} value={region} onChange={setRegion} />
          <RangeFilter
            label={`최소 매출 ${minRevenue}억`}
            min={0}
            max={500}
            step={10}
            value={minRevenue}
            onChange={setMinRevenue}
          />
          <RangeFilter
            label={`최소 매칭 점수 ${minScore}`}
            min={0}
            max={95}
            step={5}
            value={minScore}
            onChange={setMinScore}
          />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-fg-faint uppercase tracking-widest">정렬</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-8 rounded-md border border-border-base bg-bg-card px-2 text-xs font-mono"
            >
              <option value="matchScore">AI 매칭점수</option>
              <option value="revenue">매출</option>
              <option value="ebitda">EBITDA</option>
              <option value="askingPrice">매각희망가</option>
              <option value="registeredAt">등록일</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
              className="h-8 px-2 rounded-md border border-border-base bg-bg-card text-xs flex items-center gap-1 hover:bg-bg-elevated"
            >
              <ArrowUpDown className="h-3 w-3" />
              <span className="font-mono">{sortDir.toUpperCase()}</span>
            </button>
            <div className="ml-auto inline-flex rounded-md border border-border-base bg-bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => setView("table")}
                className={cn(
                  "h-8 w-8 flex items-center justify-center",
                  view === "table" ? "bg-bg-elevated text-fg" : "text-fg-faint hover:text-fg",
                )}
                aria-label="Table view"
              >
                <TableIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setView("cards")}
                className={cn(
                  "h-8 w-8 flex items-center justify-center border-l border-border-base",
                  view === "cards" ? "bg-bg-elevated text-fg" : "text-fg-faint hover:text-fg",
                )}
                aria-label="Card view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {view === "table" ? <DealsTable rows={filtered} /> : <DealsCards rows={filtered} />}
    </div>
  );
}

function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1 col-span-2 lg:col-span-2">
      <span className="text-[10px] text-fg-faint uppercase tracking-widest">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "px-2 h-7 rounded-md border text-xs",
              value === opt
                ? "border-accent-blue/40 bg-accent-blue/10 text-accent-blue"
                : "border-border-base bg-bg-card text-fg-muted hover:text-fg hover:border-border-strong",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function RangeFilter({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-fg-faint uppercase tracking-widest">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="accent-accent-blue"
      />
    </div>
  );
}

function DealsTable({ rows }: { rows: Company[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-fg-muted text-[11px] uppercase tracking-wider">
            <tr className="border-b border-border-base bg-bg-elevated/50">
              <th className="text-left px-4 py-2.5 font-medium">ID</th>
              <th className="text-left px-4 py-2.5 font-medium">매물</th>
              <th className="text-left px-4 py-2.5 font-medium">업종</th>
              <th className="text-left px-4 py-2.5 font-medium">지역</th>
              <th className="text-right px-4 py-2.5 font-medium">매출</th>
              <th className="text-right px-4 py-2.5 font-medium">EBITDA</th>
              <th className="text-right px-4 py-2.5 font-medium">직원</th>
              <th className="text-right px-4 py-2.5 font-medium">매각희망가</th>
              <th className="text-right px-4 py-2.5 font-medium">AI 점수</th>
              <th className="text-left px-4 py-2.5 font-medium">단계</th>
              <th className="text-right px-4 py-2.5 font-medium">등록일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border-base/60 hover:bg-bg-elevated/60 transition-colors group"
              >
                <td className="px-4 py-2.5 font-mono text-fg-faint">{c.id}</td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/deals/${c.id}`}
                    className="font-medium text-fg group-hover:text-accent-blue"
                  >
                    {c.alias}
                  </Link>
                  <div className="text-fg-faint text-[11px] truncate max-w-[260px]">
                    {c.description}
                  </div>
                </td>
                <td className="px-4 py-2.5"><Badge variant="muted">{c.industry}</Badge></td>
                <td className="px-4 py-2.5 text-fg-muted">{c.region}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{formatKrwShort(c.revenue)}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{formatKrwShort(c.ebitda)}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{c.employees}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{formatKrwShort(c.askingPrice)}</td>
                <td className="px-4 py-2.5 text-right">
                  <ScorePill score={c.matchScore} />
                </td>
                <td className="px-4 py-2.5"><StageBadge stage={c.stage} /></td>
                <td className="px-4 py-2.5 text-right font-mono text-fg-faint">{formatDateKo(c.registeredAt, { short: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DealsCards({ rows }: { rows: Company[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {rows.map((c) => (
        <Link key={c.id} href={`/deals/${c.id}`} className="block group">
          <Card className="p-4 card-hover hover:border-border-strong">
            <div className="flex items-start justify-between mb-2">
              <Badge variant="muted">{c.industry}</Badge>
              <ScorePill score={c.matchScore} />
            </div>
            <div className="font-medium text-fg group-hover:text-accent-blue mb-1 truncate">
              {c.alias}
            </div>
            <div className="text-[11px] text-fg-faint line-clamp-2 mb-3 min-h-[2.4em]">
              {c.description}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <Stat label="매출" value={formatKrwShort(c.revenue)} />
              <Stat label="EBITDA" value={formatKrwShort(c.ebitda)} />
              <Stat label="직원" value={`${c.employees}명`} />
              <Stat label="희망가" value={formatKrwShort(c.askingPrice)} />
            </div>
            <div className="mt-3 pt-3 border-t border-border-base flex items-center justify-between text-[11px]">
              <StageBadge stage={c.stage} />
              <span className="text-fg-faint font-mono">{formatDateKo(c.registeredAt, { short: true })}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-fg-faint">{label}</div>
      <div className="text-fg font-mono tabular-nums">{value}</div>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 85 ? "var(--accent-purple)" :
    score >= 70 ? "var(--accent-blue)" :
    score >= 55 ? "var(--accent-amber)" :
    "var(--text-faint)";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-mono tabular-nums"
      style={{ color, borderColor: `${color}55`, background: `${color}10` }}
    >
      {score}
    </span>
  );
}
