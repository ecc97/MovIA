import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      size={28}
      className={cn("animate-spin text-dorado", className)}
      aria-hidden="true"
    />
  );
}

export function LoadingBlock({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted" role="status">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default Spinner;
