"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Edit, Save, X, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleId: string | null;
  vehicle?: { make: string; model: string } | null;
  status: "NUEVA" | "EN_CONTACTO" | "EN_SEGUIMIENTO" | "VENDIDA" | "DESCARTADA";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InquiriesResponse {
  items: Inquiry[];
  total: number;
}

const STATUS_CONFIG: Record<Inquiry["status"], { label: string; color: string }> = {
  NUEVA: { label: "Nueva", color: "bg-dorado text-grafito" },
  EN_CONTACTO: { label: "En contacto", color: "bg-blue-100 text-blue-800" },
  EN_SEGUIMIENTO: { label: "En seguimiento", color: "bg-yellow-100 text-yellow-800" },
  VENDIDA: { label: "Vendida", color: "bg-exito text-blanco" },
  DESCARTADA: { label: "Descartada", color: "bg-gray-500 text-blanco" },
};

export default function ConsultasPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Inquiry>>({});

  const { data, isLoading, isError } = useQuery<InquiriesResponse>({
    queryKey: ["inquiries"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al cargar");
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (inquiry: Inquiry) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(inquiry),
      });
      if (!response.ok) throw new Error("Error al actualizar");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      setEditingId(null);
      setEditData({});
    },
  });

  const inquiries = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleEdit = (inquiry: Inquiry) => {
    setEditingId(inquiry.id);
    setEditData(inquiry);
  };

  const handleSave = () => {
    if (editData.id) {
      updateMutation.mutate(editData as Inquiry);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const getStatusColor = (status: Inquiry["status"]) => STATUS_CONFIG[status].color;

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
        Error al cargar las consultas
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-2xl font-bold text-grafito">Consultas</h1>
        <p className="text-gris-600 mt-1">
          {total} consultas • {inquiries.length} mostradas
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-12 text-gris-500">
          <p>No hay consultas registradas</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-card border border-gris-200">
          <table className="w-full text-sm">
            <thead className="bg-gris-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-grafito">Cliente</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Vehículo</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Estado</th>
                <th className="px-4 py-2 text-left font-medium text-grafito">Notas</th>
                <th className="px-4 py-2 text-center font-medium text-grafito">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <InquiryRow
                  key={inquiry.id}
                  inquiry={inquiry}
                  editingId={editingId}
                  editData={editData}
                  getStatusColor={getStatusColor}
                  handleEdit={handleEdit}
                  setEditData={setEditData}
                  handleSave={handleSave}
                  handleCancel={handleCancel}
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

interface InquiryRowProps {
  inquiry: Inquiry;
  editingId: string | null;
  editData: Partial<Inquiry>;
  getStatusColor: (status: Inquiry["status"]) => string;
  handleEdit: (i: Inquiry) => void;
  setEditData: (d: Partial<Inquiry>) => void;
  handleSave: () => void;
  handleCancel: () => void;
  updateMutation: { mutate: (i: Inquiry) => void; isPending: boolean };
}

function InquiryRow({
  inquiry,
  editingId,
  editData,
  getStatusColor,
  handleEdit,
  setEditData,
  handleSave,
  handleCancel,
  updateMutation,
}: InquiryRowProps) {
  const isEditing = editingId === inquiry.id;

  return (
    <tr className="border-b border-gris-200 last:border-0 hover:bg-gris-50">
      <td className="px-4 py-2">
        {isEditing ? (
          <input
            className="border border-gris-300 rounded px-2 py-1 text-sm w-full"
            value={editData.name ?? inquiry.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />
        ) : (
          <div>
            <div className="font-medium text-grafito">{inquiry.name}</div>
            <div className="text-xs text-gris-500">{inquiry.email}</div>
          </div>
        )}
      </td>

      <td className="px-4 py-2">
        {isEditing ? (
          <input
            className="border border-gris-300 rounded px-2 py-1 text-sm w-full"
            value={editData.vehicle?.make ?? ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                vehicle: { ...editData.vehicle, make: e.target.value },
              } as any)
            }
            placeholder="Marca"
          />
        ) : (
          inquiry.vehicle
            ? `${inquiry.vehicle.make} ${inquiry.vehicle.model}`
            : <span className="text-gris-500">General</span>
        )}
      </td>

      <td className="px-4 py-2">
        {isEditing ? (
          <select
            className="border border-gris-300 rounded px-2 py-1 text-sm"
            value={editData.status ?? inquiry.status}
            onChange={(e) =>
              setEditData({ ...editData, status: e.target.value as any } as any)
            }
          >
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>
                {config.label}
              </option>
            ))}
          </select>
        ) : (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
            {STATUS_CONFIG[inquiry.status].label}
          </span>
        )}
      </td>

      <td className="px-4 py-2 max-w-xs">
        {isEditing ? (
          <textarea
            className="border border-gris-300 rounded px-2 py-1 text-sm w-full resize-none"
            rows={2}
            value={editData.notes ?? inquiry.notes ?? ""}
            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
            placeholder="Notas internas..."
          />
        ) : (
          <p className="text-gris-600 text-xs">
            {inquiry.notes ? inquiry.notes : <span className="text-gris-400">Sin notas</span>}
          </p>
        )}
      </td>

      <td className="px-4 py-2 text-center">
        {isEditing ? (
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
          <button
            onClick={() => handleEdit(inquiry)}
            className="p-1 text-dorado hover:bg-dorado/10 rounded full"
          >
            <Edit size={16} />
          </button>
        )}
      </td>
    </tr>
  );
}