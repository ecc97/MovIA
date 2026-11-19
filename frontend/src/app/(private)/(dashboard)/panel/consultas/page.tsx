"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Edit, Save, X } from "lucide-react";
import { useInquiries, useUpdateInquiry } from "@/features/inquiries/hooks/useInquiries";
import type { InquirySummary } from "@/features/inquiries/types";
import type { InquiryStatus } from "@/types";

const PAGE_SIZE = 10;

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
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "TODOS">("TODOS");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching } = useInquiries({
    status: statusFilter === "TODOS" ? undefined : statusFilter,
    page,
    limit: PAGE_SIZE,
  });
  const updateMutation = useUpdateInquiry();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditState | null>(null);

  const inquiries = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / (data?.limit ?? PAGE_SIZE)));

  const changeFilter = (value: InquiryStatus | "TODOS") => {
    setStatusFilter(value);
    setPage(1);
  };

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
          {total} consultas • Página {data?.page ?? page} de {totalPages}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label htmlFor="inquiry-status-filter" className="label-field mb-0">
          Estado
        </label>
        <select
          id="inquiry-status-filter"
          className="input-field w-auto"
          value={statusFilter}
          onChange={(e) => changeFilter(e.target.value as InquiryStatus | "TODOS")}
        >
          <option value="TODOS">Todos</option>
          {(Object.keys(STATUS_CONFIG) as InquiryStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].label}
            </option>
          ))}
        </select>
        {isFetching && <span className="text-xs text-gris-500">Actualizando…</span>}
      </div>

      {updateMutation.isError && (
        <div className="bg-error/10 border border-error/30 rounded-card p-3 text-sm text-error" role="alert">
          {updateMutation.error.message}
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className="text-center py-12 text-gris-500">
          <p>
            {statusFilter === "TODOS"
              ? "No hay consultas registradas"
              : `No hay consultas con estado ${STATUS_CONFIG[statusFilter].label}`}
          </p>
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-card border border-gris-200 ${isFetching ? "opacity-60" : ""}`}>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="text-sm text-gris-600">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente <ChevronRight size={16} />
          </button>
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
            {(Object.keys(STATUS_CONFIG) as InquiryStatus[]).map((status) => (
              <option key={status} value={status}>
                {STATUS_CONFIG[status].label}
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
          <button
            onClick={() => handleEdit(inquiry)}
            aria-label="Editar estado y notas"
            className="p-1 text-dorado hover:bg-dorado/10 rounded-full"
          >
            <Edit size={16} />
          </button>
        )}
      </td>
    </tr>
  );
}
