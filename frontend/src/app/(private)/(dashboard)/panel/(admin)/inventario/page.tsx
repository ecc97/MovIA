"use client";

import { useState } from "react";
import { formatPriceCOP } from "@/lib/utils";
import {
  useUpdateVehicle,
  useUpdateVehicleStatus,
  useVehiclesPage,
} from "@/features/vehicles/hooks/useVehicles";
import VehicleFormModal from "@/features/vehicles/components/VehicleFormModal";
import type { VehicleStatus, VehicleSummary } from "@/features/vehicles/types";
import { Edit, Save, X, Archive, Plus } from "lucide-react";

export default function InventarioPage() {
  const { data, isLoading, isError } = useVehiclesPage();
  const updateMutation = useUpdateVehicle();
  const statusMutation = useUpdateVehicleStatus();
  const [editVehicle, setEditVehicle] = useState<VehicleSummary | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const vehicles = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

  const handleEdit = (vehicle: VehicleSummary) => {
    setEditVehicle(vehicle);
  };

  const handleSave = () => {
    if (editVehicle) {
      const { id, ...data } = editVehicle;
      updateMutation.mutate(
        { id, data },
        {
          onSuccess: () => {
            setEditVehicle(null);
          },
        }
      );
    }
  };

  const handleCancel = () => {
    setEditVehicle(null);
  };

  const handleStatusChange = (vehicle: VehicleSummary, newStatus: VehicleStatus) => {
    if (editVehicle?.id === vehicle.id) {
      setEditVehicle({ ...editVehicle, status: newStatus });
    }
  };

  const handleArchive = (vehicle: VehicleSummary) => {
    statusMutation.mutate({ id: vehicle.id, status: "ARCHIVADO" });
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
            {pagination.total} vehículos • Página {pagination.page} de {pagination.totalPages}
          </p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Crear vehículo
        </button>
      </div>

      {(updateMutation.isError || statusMutation.isError) && (
        <div className="bg-error/10 border border-error/30 rounded-card p-3 text-sm text-error" role="alert">
          {updateMutation.error?.message ?? statusMutation.error?.message}
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-12 text-gris-500">
          <p>No hay vehículos registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-gris-200">
          <table className="w-full text-sm">
            <thead className="bg-gris-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-grafito">ID</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Marca / Modelo</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Año</th>
                <th className="px-4 py-2 text-right font-medium text-grafito">Precio</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Estado</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Publicado</th>
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
                  handleSave={handleSave}
                  handleCancel={handleCancel}
                  handleStatusChange={handleStatusChange}
                  handleArchive={handleArchive}
                  isSaving={updateMutation.isPending || statusMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VehicleFormModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}

interface VehicleRowProps {
  vehicle: VehicleSummary;
  editVehicle: VehicleSummary | null;
  setEditVehicle: (v: VehicleSummary | null) => void;
  isEditing: boolean;
  handleEdit: (v: VehicleSummary) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleStatusChange: (v: VehicleSummary, s: VehicleStatus) => void;
  handleArchive: (v: VehicleSummary) => void;
  isSaving: boolean;
}

function VehicleRow({
  vehicle,
  editVehicle,
  setEditVehicle,
  isEditing,
  handleEdit,
  handleSave,
  handleCancel,
  handleStatusChange,
  handleArchive,
  isSaving,
}: VehicleRowProps) {
  return (
    <tr className="border-b border-gris-200 last:border-0 hover:bg-gris-50">
      <td className="px-4 py-2 font-mono text-xs text-gris-600">
        {vehicle.id.slice(0, 8)}...
      </td>
      <td className="px-4 py-2">
        {isEditing && editVehicle?.id === vehicle.id ? (
          <input
            className="border border-gris-300 rounded px-2 py-1 text-sm w-full"
            value={editVehicle.make}
            onChange={(e) =>
              setEditVehicle({ ...editVehicle, make: e.target.value } as VehicleSummary)
            }
          />
        ) : (
          `${vehicle.make} ${vehicle.model}`
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing && editVehicle?.id === vehicle.id ? (
          <input
            type="number"
            className="border border-gris-300 rounded px-2 py-1 text-sm w-20"
            value={editVehicle.year}
            onChange={(e) =>
              setEditVehicle({ ...editVehicle, year: parseInt(e.target.value) } as VehicleSummary)
            }
          />
        ) : (
          vehicle.year
        )}
      </td>
      <td className="px-4 py-2 text-right">
        {isEditing && editVehicle?.id === vehicle.id ? (
          <input
            type="number"
            className="border border-gris-300 rounded px-2 py-1 text-sm w-24 text-right"
            value={editVehicle.price}
            onChange={(e) =>
              setEditVehicle({
                ...editVehicle,
                price: parseInt(e.target.value) || 0,
              } as VehicleSummary)
            }
          />
        ) : (
          formatPriceCOP(vehicle.price)
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing && editVehicle?.id === vehicle.id ? (
          <select
            className="border border-gris-300 rounded px-2 py-1 text-sm"
            value={editVehicle.status}
            onChange={(e) =>
              handleStatusChange(editVehicle, e.target.value as VehicleStatus)
            }
          >
            <option value="PUBLICADO">PUBLICADO</option>
            <option value="ARCHIVADO">ARCHIVADO</option>
            <option value="BORRADOR">BORRADOR</option>
          </select>
        ) : (
          <StatusBadge status={vehicle.status} />
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing && editVehicle?.id === vehicle.id ? (
          <select
            className="border border-gris-300 rounded px-2 py-1 text-sm"
            value={editVehicle.status}
            onChange={(e) =>
              handleStatusChange(editVehicle, e.target.value as VehicleStatus)
            }
          >
            <option value="PUBLICADO">Sí</option>
            <option value="ARCHIVADO">No</option>
            <option value="BORRADOR">Borrador</option>
          </select>
        ) : (
          <span className={vehicle.status === "PUBLICADO" ? "text-exito" : "text-gris-500"}>
            {vehicle.status === "PUBLICADO" ? "Sí" : "No"}
          </span>
        )}
      </td>
      <td className="px-4 py-2 text-center">
        {isEditing ? (
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              aria-label="Guardar cambios"
              className="p-1 text-exito hover:bg-exito/10 rounded full"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancel}
              aria-label="Cancelar edición"
              className="p-1 text-gris-500 hover:bg-gris-200 rounded full"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleEdit(vehicle)}
              aria-label="Editar vehículo"
              className="p-1 text-dorado hover:bg-dorado/10 rounded full"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleArchive(vehicle)}
              disabled={isSaving}
              aria-label="Archivar vehículo"
              className="p-1 text-gris-500 hover:bg-gris-200 rounded full"
            >
              <Archive size={16} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: VehicleStatus }) {
  const colors: Record<string, string> = {
    PUBLICADO: "bg-exito text-blanco",
    ARCHIVADO: "bg-gris-500 text-blanco",
    BORRADOR: "bg-gris-300 text-grafito",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-gris-100 text-gris-800"
      }`}
    >
      {status}
    </span>
  );
}
