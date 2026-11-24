"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useInquiries } from "@/features/inquiries/hooks/useInquiries";
import InquiryEditModal from "@/features/inquiries/components/InquiryEditModal";
import { INQUIRY_STATUS_CONFIG, INQUIRY_STATUSES } from "@/features/inquiries/utils/status";
import type { InquiryStatus, InquirySummary } from "@/features/inquiries/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingBlock } from "@/components/ui/Spinner";
import { cn, formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

export default function ConsultasPage() {
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "TODOS">("TODOS");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<InquirySummary | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useInquiries({
    status: statusFilter === "TODOS" ? undefined : statusFilter,
    page,
    limit: PAGE_SIZE,
  });

  const inquiries = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (data?.limit ?? PAGE_SIZE)));

  const changeFilter = (value: InquiryStatus | "TODOS") => {
    setStatusFilter(value);
    setPage(1);
  };

  if (isLoading) return <LoadingBlock label="Cargando consultas…" />;

  if (isError) {
    return (
      <EmptyState
        title="No pudimos cargar las consultas"
        description="Revisa tu conexión e inténtalo de nuevo."
        action={<Button onClick={() => void refetch()}>Reintentar</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Bandeja de entrada"
        title="Consultas"
        description={`${total} consultas en total · página ${data?.page ?? page} de ${totalPages}`}
      />

      <div className="flex flex-wrap items-center gap-2" aria-label="Filtrar por estado">
        <button
          type="button"
          aria-pressed={statusFilter === "TODOS"}
          onClick={() => changeFilter("TODOS")}
          className={cn(
            "min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors",
            statusFilter === "TODOS"
              ? "border-dorado bg-accent-soft text-accent-text"
              : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
          )}
        >
          Todas
        </button>
        {INQUIRY_STATUSES.map((status) => {
          const active = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => changeFilter(status)}
              className={cn(
                "min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors",
                active
                  ? "border-dorado bg-accent-soft text-accent-text"
                  : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
              )}
            >
              {INQUIRY_STATUS_CONFIG[status].label}
            </button>
          );
        })}
        {isFetching && <span className="text-xs text-muted">Actualizando…</span>}
      </div>

      {inquiries.length === 0 ? (
        <EmptyState
          title="No hay consultas para mostrar"
          description={
            statusFilter === "TODOS"
              ? "Cuando un visitante envíe una consulta, aparecerá aquí."
              : `No hay consultas con estado ${INQUIRY_STATUS_CONFIG[statusFilter].label}.`
          }
          action={
            statusFilter !== "TODOS" ? (
              <Button variant="outline" onClick={() => changeFilter("TODOS")}>
                Ver todas
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className={cn("card hidden overflow-hidden md:block", isFetching && "opacity-60")}>
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Vehículo</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Estado</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Actualizada</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="transition-colors hover:bg-surface-muted">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{inquiry.name}</p>
                      <p className="text-xs text-muted">{inquiry.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {inquiry.vehicleMake
                        ? `${inquiry.vehicleMake} ${inquiry.vehicleModel ?? ""}`.trim()
                        : "General"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={INQUIRY_STATUS_CONFIG[inquiry.status].tone}>
                        {INQUIRY_STATUS_CONFIG[inquiry.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(inquiry.updatedAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(inquiry)}
                        aria-label={`Ver consulta de ${inquiry.name}`}
                        className="!min-h-10 !px-2 text-accent-text"
                      >
                        <Pencil size={16} aria-hidden="true" />
                        <span className="sr-only sm:not-sr-only">Gestionar</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {inquiries.map((inquiry) => (
              <article key={inquiry.id} className="card space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-sora text-base font-semibold text-foreground">{inquiry.name}</h2>
                    <p className="text-xs text-muted">{inquiry.email}</p>
                  </div>
                  <Badge tone={INQUIRY_STATUS_CONFIG[inquiry.status].tone}>
                    {INQUIRY_STATUS_CONFIG[inquiry.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted">
                  {inquiry.vehicleMake
                    ? `${inquiry.vehicleMake} ${inquiry.vehicleModel ?? ""}`.trim()
                    : "Consulta general"}
                </p>
                <p className="line-clamp-2 text-sm text-foreground/80">{inquiry.message}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">{formatDate(inquiry.updatedAt)}</span>
                  <Button variant="outline" size="sm" onClick={() => setSelected(inquiry)}>
                    Gestionar
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </>
      )}

      <InquiryEditModal
        key={selected?.id ?? "none"}
        inquiry={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
