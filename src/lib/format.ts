// Korean-friendly formatters. All currency in 백만원 (millions of KRW).

export function formatKrwM(amount: number, opts?: { compact?: boolean }): string {
  if (opts?.compact) {
    if (amount >= 100000) return `${(amount / 10000).toFixed(1)}조`;
    if (amount >= 100) return `${(amount / 100).toFixed(0)}억`;
    return `${amount}백만`;
  }
  // amount in 백만원 -> show as 'XX억 YY백만원' or '~억'
  if (amount >= 100) {
    const eok = Math.floor(amount / 100);
    const rest = amount % 100;
    if (rest === 0) return `${eok.toLocaleString()}억원`;
    return `${eok.toLocaleString()}억 ${rest}백만원`;
  }
  return `${amount.toLocaleString()}백만원`;
}

export function formatKrwShort(amount: number): string {
  // For tables / KPI - compact
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}조`;
  if (amount >= 100) return `${(amount / 100).toFixed(0)}억`;
  return `${amount}백만`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

export function formatPercent(p: number, fractionDigits = 1): string {
  return `${p.toFixed(fractionDigits)}%`;
}

export function formatDateKo(iso: string, opts?: { short?: boolean }): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  if (opts?.short) return `${m}.${day}`;
  return `${y}.${m}.${day}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

export function timeAgo(iso: string, now: Date = new Date()): string {
  const t = new Date(iso).getTime();
  const diff = now.getTime() - t;
  if (diff < 0) {
    const future = -diff;
    const min = Math.round(future / 60000);
    if (min < 60) return `${min}분 후`;
    return `${Math.round(min / 60)}시간 후`;
  }
  const min = Math.round(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}일 전`;
  return formatDateKo(iso, { short: true });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}
