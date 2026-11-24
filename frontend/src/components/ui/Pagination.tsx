import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  const total = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, page), total);

  const candidates = [1, current - 1, current, current + 1, total].filter(
    (value) => value >= 1 && value <= total
  );
  const pages = [...new Set(candidates)].sort((a, b) => a - b);

  return (
    <nav aria-label="Paginación" className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current <= 1}
        leftIcon={<ChevronLeft size={16} aria-hidden="true" />}
      >
        Anterior
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((value, index) => {
          const previous = pages[index - 1];
          const showEllipsis = index > 0 && previous !== undefined && value - previous > 1;
          return (
            <span key={value} className="flex items-center gap-1">
              {showEllipsis && <span className="px-1 text-sm text-muted">…</span>}
              <button
                type="button"
                onClick={() => onChange(value)}
                aria-current={value === current ? "page" : undefined}
                aria-label={`Ir a la página ${value}`}
                className={cn(
                  "flex size-9 items-center justify-center rounded-btn text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado",
                  value === current
                    ? "bg-foreground text-background"
                    : "text-muted hover:bg-surface-muted hover:text-foreground"
                )}
              >
                {value}
              </button>
            </span>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current >= total}
        rightIcon={<ChevronRight size={16} aria-hidden="true" />}
      >
        Siguiente
      </Button>
    </nav>
  );
}

export default Pagination;
