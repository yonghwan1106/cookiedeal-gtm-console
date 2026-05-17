import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "muted"
  | "outline";

const VARIANT: Record<Variant, string> = {
  default: "bg-bg-elevated text-fg border-border-base",
  blue: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
  green: "bg-accent-green/10 text-accent-green border-accent-green/30",
  amber: "bg-accent-amber/10 text-accent-amber border-accent-amber/30",
  red: "bg-accent-red/10 text-accent-red border-accent-red/30",
  purple: "bg-accent-purple/10 text-accent-purple border-accent-purple/30",
  muted: "bg-bg-elevated text-fg-muted border-border-base",
  outline: "bg-transparent text-fg-muted border-border-strong",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none",
        VARIANT[variant],
        className,
      )}
      {...props}
    />
  );
}
