"use client";

import { useState } from "react";
import { Archive, Eye, Images, Pencil, Plus } from "lucide-react";
import { useInventoryPage, useUpdateVehicleStatus } from "@/features/vehicles/hooks/useVehicles";
import VehicleFormModal from "@/features/vehicles/components/VehicleFormModal";
import VehiclePhotosModal from "@/features/vehicles/components/VehiclePhotosModal";
import { VEHICLE_STATUS_CONFIG } from "@/features/vehicles/utils/status";
import type { VehicleStatus, VehicleSummary } from "@/features/vehicles/types";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { LoadingBlock } from "@/components/ui/Spinner";
import { cn, formatPriceCOP } from "@/lib/utils";

const PAGE_SIZE = 10;
const FILTERS: Array<VehicleStatus | "TODOS"> = ["TODOS", "PUBLICADO", "BORRADOR", "ARCHIVADO"];

export default function InventarioPage() {
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "TODOS">("TODOS");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photosVehicle, setPhotosVehicle] = useState<VehicleSummary | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useInventoryPage({
    status: statusFilter === "TODOS" ? undefined : statusFilter,
    page,
    limit: PAGE_SIZE,
  });
  const statusMutation = useUpdateVehicleStatus();
  const { confirm } = useConfirm();
  const toast = useToast();

  const vehicles = data?.data ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  const changeFilter = (value: VehicleStatus | "TODOS") => {
    setStatusFilter(value);
    setPage(1);
  };

  const changeStatus = async (vehicle: VehicleSummary, status: VehicleStatus) => {
    if (status === "ARCHIVADO") {
      const accepted = await confirm({
        title: "¿Archivar vehículo?",
        description:
          "Dejará de mostrarse en el catálogo público. Podrás publicarlo de nuevo desde el inventario.",
        confirmLabel: "Archivar",
        variant: "danger",
      });
      if (!accepted) return;
    }
    statusMutation.mutate(
      { id: vehicle.id, status },
      {
        onSuccess: () =>
          toast.success(status === "PUBLICADO" ? "Vehículo publicado" : "Vehículo archivado"),
      }
    );
  };

  if (isLoading) return <LoadingBlock label="Cargando inventario…" />;

  if (isError) {
    return (
      <EmptyState
        title="No pudimos cargar el inventario"
        description="Revisa tu conexión e inténtalo de nuevo."
        action={<Button onClick={() => void refetch()}>Reintentar</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administración"
        title="Inventario"
        description={`${pagination.total} vehículos en todos los estados · página ${pagination.page} de ${pagination.totalPages || 1}`}
        actions={
          <Button onClick={() => setCreateOpen(true)} leftIcon={<Plus size={17} aria-hidden="true" />}>
            Crear vehículo
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2" aria-label="Filtrar por estado">
        {FILTERS.map((filter) => {
          const active = statusFilter === filter;
          const label = filter === "TODOS" ? "Todos" : VEHICLE_STATUS_CONFIG[filter].label;
          return (
            <button
              key={filter}
              type="button"
              aria-pressed={active}
              onClick={() => changeFilter(filter)}
              className={cn(
                "min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors",
                active
                  ? "border-dorado bg-accent-soft text-accent-text"
                  : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
              )}
            >
              {label}
            </button>
          );
        })}
        {isFetching && <span className="text-xs text-muted">Actualizando…</span>}
      </div>

      {statusMutation.isError && (
        <p className="rounded-btn border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
          {statusMutation.error.message}
        </p>
      )}

      {vehicles.length === 0 ? (
        <EmptyState
          title="No hay vehículos para mostrar"
          description={
            statusFilter === "TODOS"
              ? "Crea el primer vehículo del inventario."
              : `No hay vehículos con estado ${VEHICLE_STATUS_CONFIG[statusFilter as VehicleStatus].label}.`
          }
          action={
            statusFilter === "TODOS" ? (
              <Button onClick={() => setCreateOpen(true)}>Crear vehículo</Button>
            ) : (
              <Button variant="outline" onClick={() => changeFilter("TODOS")}>
                Ver todos
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className={cn("card hidden overflow-hidden md:block", isFetching && "opacity-60")}>
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Vehículo</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Año</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Precio</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="transition-colors hover:bg-surface-muted">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="font-mono text-[11px] text-muted">{vehicle.id.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{vehicle.year}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {formatPriceCOP(vehicle.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={VEHICLE_STATUS_CONFIG[vehicle.status].tone}>
                        {VEHICLE_STATUS_CONFIG[vehicle.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <VehicleActions
                        vehicle={vehicle}
                        busy={statusMutation.isPending}
                        onEdit={() => setEditingId(vehicle.id)}
                        onPhotos={() => setPhotosVehicle(vehicle)}
                        onChangeStatus={changeStatus}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {vehicles.map((vehicle) => (
              <article key={vehicle.id} className="card space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-sora text-base font-semibold text-foreground">
                      {vehicle.make} {vehicle.model}
                    </h2>
                    <p className="text-xs text-muted">
                      {vehicle.year} · {vehicle.mileage.toLocaleString("es-CO")} km
                    </p>
                  </div>
                  <Badge tone={VEHICLE_STATUS_CONFIG[vehicle.status].tone}>
                    {VEHICLE_STATUS_CONFIG[vehicle.status].label}
                  </Badge>
                </div>
                <p className="font-sora text-lg font-bold text-accent-text">
                  {formatPriceCOP(vehicle.price)}
                </p>
                <VehicleActions
                  vehicle={vehicle}
                  busy={statusMutation.isPending}
                  onEdit={() => setEditingId(vehicle.id)}
                  onPhotos={() => setPhotosVehicle(vehicle)}
                  onChangeStatus={changeStatus}
                />
              </article>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}

      <VehicleFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setStatusFilter("TODOS");
          setPage(1);
        }}
      />

      <VehicleFormModal
        key={editingId ?? "edit"}
        open={Boolean(editingId)}
        onClose={() => setEditingId(null)}
        vehicleId={editingId ?? undefined}
      />

      {photosVehicle && (
        <VehiclePhotosModal vehicle={photosVehicle} onClose={() => setPhotosVehicle(null)} />
      )}
    </div>
  );
}

interface VehicleActionsProps {
  vehicle: VehicleSummary;
  busy: boolean;
  onEdit: () => void;
  onPhotos: () => void;
  onChangeStatus: (vehicle: VehicleSummary, status: VehicleStatus) => void;
}

function VehicleActions({ vehicle, busy, onEdit, onPhotos, onChangeStatus }: VehicleActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <Button variant="ghost" size="sm" onClick={onEdit} aria-label={`Editar ${vehicle.make} ${vehicle.model}`} className="!min-h-10 !px-2 text-accent-text">
        <Pencil size={16} aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Editar</span>
      </Button>
      <Button variant="ghost" size="sm" onClick={onPhotos} aria-label={`Fotos de ${vehicle.make} ${vehicle.model}`} className="!min-h-10 !px-2">
        <Images size={16} aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Fotos</span>
      </Button>
      {vehicle.status !== "PUBLICADO" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChangeStatus(vehicle, "PUBLICADO")}
          disabled={busy}
          aria-label={`Publicar ${vehicle.make} ${vehicle.model}`}
          className="!min-h-10 !px-2 text-success-strong"
        >
          <Eye size={16} aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Publicar</span>
        </Button>
      )}
      {vehicle.status !== "ARCHIVADO" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChangeStatus(vehicle, "ARCHIVADO")}
          disabled={busy}
          aria-label={`Archivar ${vehicle.make} ${vehicle.model}`}
          className="!min-h-10 !px-2 text-muted hover:text-error"
        >
          <Archive size={16} aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Archivar</span>
        </Button>
      )}
    </div>
  );
}
