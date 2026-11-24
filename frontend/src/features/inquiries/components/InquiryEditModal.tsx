"use client";

import { useState } from "react";
import { CalendarDays, Car, Mail, MessageSquare, Phone, User } from "lucide-react";
import { useUpdateInquiry } from "../hooks/useInquiries";
import { INQUIRY_STATUS_CONFIG, INQUIRY_STATUSES } from "../utils/status";
import type { InquiryStatus, InquirySummary } from "../types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormField, Select, Textarea } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

interface InquiryEditModalProps {
  inquiry: InquirySummary | null;
  onClose: () => void;
}

export function InquiryEditModal({ inquiry, onClose }: InquiryEditModalProps) {
  const [status, setStatus] = useState<InquiryStatus>(inquiry?.status ?? "NUEVA");
  const [notes, setNotes] = useState(inquiry?.notes ?? "");
  const mutation = useUpdateInquiry();
  const { confirm } = useConfirm();
  const toast = useToast();

  if (!inquiry) return null;

  const originalNotes = inquiry.notes ?? "";
  const vehicleLabel = inquiry.vehicleMake
    ? `${inquiry.vehicleMake} ${inquiry.vehicleModel ?? ""}`.trim()
    : "Consulta general";

  const save = async () => {
    const closing: InquiryStatus[] = ["VENDIDA", "DESCARTADA"];
    if (status !== inquiry.status && closing.includes(status)) {
      const accepted = await confirm({
        title: `¿Marcar la consulta como ${INQUIRY_STATUS_CONFIG[status].label}?`,
        description:
          "Es un estado de cierre: reabrir consultas cerradas todavía no está disponible desde el panel.",
        confirmLabel: `Marcar como ${INQUIRY_STATUS_CONFIG[status].label}`,
        variant: "danger",
      });
      if (!accepted) return;
    }

    mutation.mutate(
      { id: inquiry.id, status, notes, originalNotes },
      {
        onSuccess: () => {
          toast.success("Consulta actualizada");
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Detalle de la consulta"
      description={`Recibida el ${formatDate(inquiry.createdAt)} · actualizada el ${formatDate(inquiry.updatedAt)}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={save} loading={mutation.isPending}>
            Guardar cambios
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-sora text-xl font-semibold text-foreground">{inquiry.name}</h3>
            <p className="mt-1 text-xs text-muted">ID {inquiry.id.slice(0, 8)}…</p>
          </div>
          <Badge tone={INQUIRY_STATUS_CONFIG[inquiry.status].tone}>
            {INQUIRY_STATUS_CONFIG[inquiry.status].label}
          </Badge>
        </div>

        <dl className="grid gap-3 rounded-card border border-border bg-surface-muted/50 p-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="shrink-0 text-muted" aria-hidden="true" />
            <span className="truncate text-foreground">{inquiry.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="shrink-0 text-muted" aria-hidden="true" />
            <span className="text-foreground">{inquiry.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Car size={16} className="shrink-0 text-muted" aria-hidden="true" />
            <span className="text-foreground">{vehicleLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays size={16} className="shrink-0 text-muted" aria-hidden="true" />
            <span className="text-foreground">{formatDate(inquiry.createdAt)}</span>
          </div>
        </dl>

        <section>
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MessageSquare size={16} aria-hidden="true" />
            Mensaje
          </h4>
          <p className="mt-2 whitespace-pre-wrap rounded-btn border border-border bg-surface p-4 text-sm leading-relaxed text-foreground/85">
            {inquiry.message}
          </p>
        </section>

        <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <FormField label="Estado" htmlFor="inquiry-status" required>
            <Select
              id="inquiry-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as InquiryStatus)}
            >
              {INQUIRY_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {INQUIRY_STATUS_CONFIG[value].label}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="hidden items-end sm:flex">
            <p className="flex items-center gap-2 pb-2 text-xs text-muted">
              <User size={14} aria-hidden="true" />
              Administrador y asesor pueden cambiar el estado.
            </p>
          </div>
        </div>

        <FormField
          label="Notas internas"
          htmlFor="inquiry-notes"
          hint="Se añaden al historial con fecha y autor. No son visibles para el visitante."
        >
          <Textarea
            id="inquiry-notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Escribe una nota interna…"
          />
        </FormField>

        {mutation.isError && (
          <p className="rounded-btn border border-error/30 bg-error/10 p-3 text-sm text-error" role="alert">
            {mutation.error.message}
          </p>
        )}
      </div>
    </Modal>
  );
}

export default InquiryEditModal;
