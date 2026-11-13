"use client";

import { useState } from "react";
import { Edit, Save, X } from "lucide-react";
import { useInquiries, useUpdateInquiry } from "@/features/inquiries/hooks/useInquiries";
import type { InquirySummary } from "@/features/inquiries/types";
import type { InquiryStatus } from "@/types";

const STATUS_CONFIG: Record<InquiryStatus, { label: string; color: string }> = {
  NUEVA: { label: "Nueva", color: "bg-dorado text-grafito" },
  EN_CONTACTO: { label: "En contacto", color: "bg-azul-100 text-azul-800" },
  EN_SEGUIMIENTO: { label: "En seguimiento", color: "bg-pendiente text-grafito" },
  VENDIDA: { label: "Vendida", color: "bg-exito text-blanco" },
  DESCARTADA: { label: "Descartada", color: "bg-gris-500 text-blanco" },
};

interface EditState {
  status: InquiryStatus;
  notes: string;
  originalNotes: string;
}

export default function ConsultasPage() {
  const { data, isLoading, isError } = useInquiries();
  const updateMutation = useUpdateInquiry();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditState | null>(null);

  const inquiries = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleEdit = (inquiry: InquirySummary) => {
    setEditingId(inquiry.id);
    setEditData({
      status: inquiry.status,
      notes: inquiry.notes ?? "",
      originalNotes: inquiry.notes ?? "",
    });
  };

  const handleSave = (inquiry: InquirySummary) => {
    if (editingId !== inquiry.id || !editData) return;
    updateMutation.mutate(
      {
        id: inquiry.id,
        status: editData.status,
        notes: editData.notes,
        originalNotes: editData.originalNotes,
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditData(null);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
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

      {updateMutation.isError && (
        <div className="bg-error/10 border border-error/30 rounded-card p-3 text-sm text-error" role="alert">
          {updateMutation.error.message}
        </div>
      )}

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
                  isEditing={editingId === inquiry.id}
                  editData={editData}
                  setEditData={setEditData}
                  handleEdit={handleEdit}
                  handleSave={handleSave}
                  handleCancel={handleCancel}
                  isSaving={updateMutation.isPending}
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
  inquiry: InquirySummary;
  isEditing: boolean;
  editData: EditState | null;
  setEditData: (d: EditState | null) => void;
  handleEdit: (inquiry: InquirySummary) => void;
  handleSave: (inquiry: InquirySummary) => void;
  handleCancel: () => void;
  isSaving: boolean;
}

function InquiryRow({
  inquiry,
  isEditing,
  editData,
  setEditData,
  handleEdit,
  handleSave,
  handleCancel,
  isSaving,
}: InquiryRowProps) {
  const vehicleLabel = inquiry.vehicleMake
    ? `${inquiry.vehicleMake} ${inquiry.vehicleModel ?? ""}`.trim()
    : "General";

  return (
    <tr className="border-b border-gris-200 last:border-0 hover:bg-gris-50">
      <td className="px-4 py-2">
        <div>
          <div className="font-medium text-grafito">{inquiry.name}</div>
          <div className="text-xs text-gris-500">{inquiry.email}</div>
        </div>
      </td>

      <td className="px-4 py-2">{vehicleLabel}</td>

      <td className="px-4 py-2">
        {isEditing && editData ? (
          <select
            className="border border-gris-300 rounded px-2 py-1 text-sm"
            value={editData.status}
            onChange={(e) =>
              setEditData({ ...editData, status: e.target.value as InquiryStatus })
            }
          >
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>
                {config.label}
              </option>
            ))}
          </select>
        ) : (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[inquiry.status].color}`}>
            {STATUS_CONFIG[inquiry.status].label}
          </span>
        )}
      </td>

      <td className="px-4 py-2 max-w-xs">
        {isEditing && editData ? (
          <textarea
            className="border border-gris-300 rounded px-2 py-1 text-sm w-full resize-none"
            rows={2}
            value={editData.notes}
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
              onClick={() => handleSave(inquiry)}
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
          <button
            onClick={() => handleEdit(inquiry)}
            aria-label="Editar estado y notas"
            className="p-1 text-dorado hover:bg-dorado/10 rounded full"
          >
            <Edit size={16} />
          </button>
        )}
      </td>
    </tr>
  );
}
