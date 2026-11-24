import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-soft py-1 pl-3 text-xs font-semibold text-accent-text",
        onRemove ? "pr-1" : "pr-3",
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar filtro ${label}`}
          className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-accent-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dorado"
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

export default FilterChip;
