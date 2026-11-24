import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  href?: string;
  className?: string;
}

export function StatCard({ label, value, hint, icon, href, className }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-sora text-3xl font-bold tracking-tight text-foreground">
        {typeof value === "number" ? value.toLocaleString("es-CO") : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  );

  const classes = cn(
    "card block p-5 transition-shadow",
    href && "hover:shadow-[var(--movia-shadow-card-hover)]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}

export default StatCard;
