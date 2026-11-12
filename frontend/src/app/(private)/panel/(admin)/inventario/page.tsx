"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleSummary } from "@/lib/api";
import { formatPriceCOP } from "@/lib/utils";
import { Edit, Save, X, Archive } from "lucide-react";
import { useState } from "react";

interface VehiclesResponse {
  data: VehicleSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function InventarioPage() {
  const queryClient = useQueryClient();
  const [editVehicle, setEditVehicle] = useState<VehicleSummary | null>(null);

  const { data, isLoading, isError } = useQuery<VehiclesResponse>({
    queryKey: ["vehicles", "all"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al cargar");
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (vehicle: VehicleSummary) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${vehicle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(vehicle),
      });
      if (!response.ok) throw new Error("Error al actualizar");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setEditVehicle(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vehicles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al eliminar");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });

  const vehicles = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 };

  const handleEdit = (vehicle: VehicleSummary) => {
    setEditVehicle(vehicle);
  };

  const handleSave = () => {
    if (editVehicle) {
      updateMutation.mutate(editVehicle);
    }
  };

  const handleCancel = () => {
    setEditVehicle(null);
  };

  const handleStatusChange = (vehicle: VehicleSummary, newStatus: string) => {
    if (editVehicle) {
      setEditVehicle({ ...editVehicle, status: newStatus as VehicleSummary["status"] });
    }
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
      </div>

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
                  updateMutation={updateMutation}
                />
              ))}
            </tbody>
          </table>
        </div>
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
  handleSave: () => void;
  handleCancel: () => void;
  handleStatusChange: (v: VehicleSummary, s: string) => void;
  updateMutation: { mutate: (v: VehicleSummary) => void; isPending: boolean };
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
  updateMutation,
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
              handleStatusChange(editVehicle, e.target.value)
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
              handleStatusChange(editVehicle, e.target.value)
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
        {isEditing && editVehicle?.id === vehicle.id ? (
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="p-1 text-exito hover:bg-exito/10 rounded full"
            >
              <Save size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-gris-500 hover:bg-gris-200 rounded full"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleEdit(vehicle)}
              className="p-1 text-dorado hover:bg-dorado/10 rounded full"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleStatusChange(vehicle, "ARCHIVADO")}
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

function StatusBadge({ status }: { status: string }) {
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