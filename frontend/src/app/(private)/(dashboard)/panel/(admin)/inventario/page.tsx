"use client";

import { useState } from "react";
import { formatPriceCOP } from "@/lib/utils";
import {
  useInventoryPage,
  useUpdateVehicle,
  useUpdateVehicleStatus,
} from "@/features/vehicles/hooks/useVehicles";
import VehicleFormModal from "@/features/vehicles/components/VehicleFormModal";
import VehiclePhotosModal from "@/features/vehicles/components/VehiclePhotosModal";
import type { VehicleStatus, VehicleSummary } from "@/features/vehicles/types";
import { Archive, ChevronLeft, ChevronRight, Edit, Eye, Images, Plus, Save, X } from "lucide-react";

const PAGE_SIZE = 10;
const STATUS_FILTERS: Array<VehicleStatus | "TODOS"> = [
  "TODOS",
  "PUBLICADO",
  "BORRADOR",
  "ARCHIVADO",
];

export default function InventarioPage() {
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "TODOS">("TODOS");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useInventoryPage({
    status: statusFilter === "TODOS" ? undefined : statusFilter,
    page,
    limit: PAGE_SIZE,
  });
  const updateMutation = useUpdateVehicle();
  const statusMutation = useUpdateVehicleStatus();
  const [editVehicle, setEditVehicle] = useState<VehicleSummary | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [photosVehicle, setPhotosVehicle] = useState<VehicleSummary | null>(null);

  const vehicles = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 };

  const changeFilter = (value: VehicleStatus | "TODOS") => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleEdit = (vehicle: VehicleSummary) => {
    setEditVehicle(vehicle);
  };

  const handleSave = () => {
    if (!editVehicle) return;
    const { id, make, year, price } = editVehicle;
    updateMutation.mutate(
      { id, data: { make, year, price } },
      { onSuccess: () => setEditVehicle(null) }
    );
  };

  const handleCancel = () => {
    setEditVehicle(null);
  };

  const changeStatus = (vehicle: VehicleSummary, status: VehicleStatus) => {
    statusMutation.mutate({ id: vehicle.id, status });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-dorado border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-error/10 border border-error/30 rounded-card p-4 text-error">
        Error al cargar el inventario
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora text-2xl font-bold text-grafito">Inventario</h1>
          <p className="text-gris-600 mt-1">
            {pagination.total} vehículos • Página {pagination.page} de{" "}
            {pagination.totalPages || 1} (todos los estados)
          </p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Crear vehículo
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="inventory-status-filter" className="label-field mb-0">
          Estado
        </label>
        <select
          id="inventory-status-filter"
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => changeFilter(e.target.value as VehicleStatus | "TODOS")}
        >
          {STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {status === "TODOS" ? "Todos" : status}
            </option>
          ))}
        </select>
        {isFetching && <span className="text-xs text-gris-500">Actualizando…</span>}
      </div>

      {(updateMutation.isError || statusMutation.isError) && (
        <div className="bg-error/10 border border-error/30 rounded-card p-3 text-sm text-error" role="alert">
          {updateMutation.error?.message ?? statusMutation.error?.message}
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-12 text-gris-500">
          <p>
            {statusFilter === "TODOS"
              ? "No hay vehículos registrados"
              : `No hay vehículos con estado ${statusFilter}`}
          </p>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-card border border-gris-200 ${isFetching ? "opacity-60" : ""}`}>
          <table className="w-full text-sm">
            <thead className="bg-gris-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-grafito">ID</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Marca / Modelo</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Año</th>
                <th className="px-4 py-2 text-right font-medium text-grafito">Precio</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Estado</th>
                <th className="px-4 py-2 text-center font-medium text-grafito">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <VehicleRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  editVehicle={editVehicle}
                  setEditVehicle={setEditVehicle}
                  isEditing={editVehicle?.id === vehicle.id}
                  handleEdit={handleEdit}
                  handlePhotos={(v) => setPhotosVehicle(v)}
                  handleSave={handleSave}
                  handleCancel={handleCancel}
                  changeStatus={changeStatus}
                  isSaving={updateMutation.isPending || statusMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="text-sm text-gris-600">
            Página {page} de {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente <ChevronRight size={16} />
          </button>
        </div>
      )}

      <VehicleFormModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setStatusFilter("TODOS");
          setPage(1);
        }}
      />
      {photosVehicle && (
        <VehiclePhotosModal vehicle={photosVehicle} onClose={() => setPhotosVehicle(null)} />
      )}
    </div>
  );
}

interface VehicleRowProps {
  vehicle: VehicleSummary;
  editVehicle: VehicleSummary | null;
  setEditVehicle: (v: VehicleSummary | null) => void;
  isEditing: boolean;
  handleEdit: (v: VehicleSummary) => void;
  handlePhotos: (v: VehicleSummary) => void;
  handleSave: () => void;
  handleCancel: () => void;
  changeStatus: (v: VehicleSummary, s: VehicleStatus) => void;
  isSaving: boolean;
}

function VehicleRow({
  vehicle,
  editVehicle,
  setEditVehicle,
  isEditing,
  handleEdit,
  handlePhotos,
  handleSave,
  handleCancel,
  changeStatus,
  isSaving,
}: VehicleRowProps) {
  return (
    <tr className="border-b border-gris-200 last:border-0 hover:bg-gris-50">
      <td className="px-4 py-2 font-mono text-xs text-gris-600">{vehicle.id.slice(0, 8)}...</td>
      <td className="px-4 py-2">
        {isEditing ? (
          <input
            className="border border-gris-300 rounded px-2 py-1 text-sm w-full"
            value={editVehicle!.make}
            onChange={(e) => setEditVehicle({ ...editVehicle!, make: e.target.value })}
          />
        ) : (
          `${vehicle.make} ${vehicle.model}`
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing ? (
          <input
            type="number"
            className="border border-gris-300 rounded px-2 py-1 text-sm w-20"
            value={editVehicle!.year}
            onChange={(e) => setEditVehicle({ ...editVehicle!, year: parseInt(e.target.value) })}
          />
        ) : (
          vehicle.year
        )}
      </td>
      <td className="px-4 py-2 text-right">
        {isEditing ? (
          <input
            type="number"
            className="border border-gris-300 rounded px-2 py-1 text-sm w-24 text-right"
            value={editVehicle!.price}
            onChange={(e) =>
              setEditVehicle({ ...editVehicle!, price: parseInt(e.target.value) || 0 })
            }
          />
        ) : (
          formatPriceCOP(vehicle.price)
        )}
      </td>
      <td className="px-4 py-2">
        <StatusBadge status={vehicle.status} />
      </td>
      <td className="px-4 py-2 text-center">
        {isEditing ? (
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              aria-label="Guardar cambios"
              className="p-1 text-exito hover:bg-exito/10 rounded-full"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancel}
              aria-label="Cancelar edición"
              className="p-1 text-gris-500 hover:bg-gris-200 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleEdit(vehicle)}
              aria-label="Editar vehículo"
              className="p-1 text-dorado hover:bg-dorado/10 rounded-full"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handlePhotos(vehicle)}
              aria-label="Administrar fotos"
              className="p-1 text-gris-500 hover:bg-gris-200 rounded-full"
            >
              <Images size={16} />
            </button>
            {vehicle.status !== "PUBLICADO" && (
              <button
                onClick={() => changeStatus(vehicle, "PUBLICADO")}
                disabled={isSaving}
                aria-label="Publicar vehículo"
                title="Publicar"
                className="p-1 text-exito hover:bg-exito/10 rounded-full"
              >
                <Eye size={16} />
              </button>
            )}
            {vehicle.status !== "ARCHIVADO" && (
              <button
                onClick={() => changeStatus(vehicle, "ARCHIVADO")}
                disabled={isSaving}
                aria-label="Archivar vehículo"
                title="Archivar"
                className="p-1 text-gris-500 hover:bg-gris-200 rounded-full"
              >
                <Archive size={16} />
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: VehicleStatus }) {
  const colors: Record<VehicleStatus, string> = {
    PUBLICADO: "bg-exito text-blanco",
    ARCHIVADO: "bg-gris-500 text-blanco",
    BORRADOR: "bg-gris-300 text-grafito",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}
    >
      {status}
    </span>
  );
}
