import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ANCHOR_DATE = new Date("2026-05-17T12:00:00+09:00");

export function isoFromOffsetDays(days: number, anchor = ANCHOR_DATE) {
  const d = new Date(anchor.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

export function isoFromOffsetMinutes(minutes: number, anchor = ANCHOR_DATE) {
  const d = new Date(anchor.getTime() + minutes * 60 * 1000);
  return d.toISOString();
}
