import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "info" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "border-neutral-border bg-neutral-soft text-neutral-strong",
  accent: "border-accent-border bg-accent-soft text-accent-text",
  success: "border-success-border bg-success-soft text-success-strong",
  warning: "border-warning-border bg-warning-soft text-warning-strong",
  info: "border-info-border bg-info-soft text-info-strong",
  danger: "border-danger-border bg-danger-soft text-danger-strong",
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "neutral", dot = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Badge;
