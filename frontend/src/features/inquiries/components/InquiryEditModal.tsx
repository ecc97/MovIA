"use client";

import { useState } from "react";
import {
  CalendarDays,
  Car,
  Mail,
  MessageSquare,
  Phone,
  RotateCcw,
  User,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUpdateInquiry } from "../hooks/useInquiries";
import {
  INQUIRY_STATUS_CONFIG,
  INQUIRY_STATUSES,
  isClosedInquiryStatus,
} from "../utils/status";
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
  const [status, setStatus] = useState<InquiryStatus>(
    inquiry?.status ?? "NUEVA",
  );
  const [notes, setNotes] = useState(inquiry?.notes ?? "");
  const mutation = useUpdateInquiry();
  const { confirm } = useConfirm();
  const toast = useToast();
  const { user } = useAuth();

  if (!inquiry) return null;

  const isAdmin = user?.role === "ADMIN";
  const currentIsClosed = isClosedInquiryStatus(inquiry.status);
  const canReopen = isAdmin && currentIsClosed;
  const originalNotes = inquiry.notes ?? "";
  const vehicleLabel = inquiry.vehicleMake
    ? `${inquiry.vehicleMake} ${inquiry.vehicleModel ?? ""}`.trim()
    : "Consulta general";

  const persist = (nextStatus: InquiryStatus, successMessage: string) => {
    mutation.mutate(
      { id: inquiry.id, status: nextStatus, notes, originalNotes },
      {
        onSuccess: () => {
          toast.success(successMessage);
          onClose();
        },
      },
    );
  };

  const save = async () => {
    const willClose =
      status !== inquiry.status && isClosedInquiryStatus(status);
    const willReopen =
      status !== inquiry.status &&
      currentIsClosed &&
      !isClosedInquiryStatus(status);

    if (willClose) {
      const accepted = await confirm({
        title: `¿Marcar la consulta como ${INQUIRY_STATUS_CONFIG[status].label}?`,
        description:
          "Es un estado de cierre: solo un administrador podrá reabrirla.",
        confirmLabel: `Marcar como ${INQUIRY_STATUS_CONFIG[status].label}`,
        variant: "danger",
      });
      if (!accepted) return;
    } else if (willReopen) {
      const accepted = await confirm({
        title: `¿Reabrir la consulta como ${INQUIRY_STATUS_CONFIG[status].label}?`,
        description: `Volverá al estado ${INQUIRY_STATUS_CONFIG[status].label}. También se guardarán las notas internas.`,
        confirmLabel: `Reabrir como ${INQUIRY_STATUS_CONFIG[status].label}`,
      });
      if (!accepted) return;
    }

    persist(status, "Consulta actualizada");
  };

  const reopen = async () => {
    const accepted = await confirm({
      title: "¿Reabrir esta consulta?",
      description:
        "Volverá al estado Nueva. También se guardarán las notas internas.",
      confirmLabel: "Reabrir",
    });
    if (!accepted) return;

    persist("NUEVA", "Consulta reabierta");
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
          {canReopen && (
            <Button
              variant="outline"
              leftIcon={<RotateCcw size={16} aria-hidden="true" />}
              onClick={reopen}
              loading={mutation.isPending}
              className="mr-auto"
            >
              Reabrir consulta
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
          >
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
            <h3 className="font-sora text-xl font-semibold text-foreground">
              {inquiry.name}
            </h3>
            <p className="mt-1 text-xs text-muted">
              ID {inquiry.id.slice(0, 8)}…
            </p>
          </div>
          <Badge tone={INQUIRY_STATUS_CONFIG[inquiry.status].tone}>
            {INQUIRY_STATUS_CONFIG[inquiry.status].label}
          </Badge>
        </div>

        <dl className="grid gap-3 rounded-card border border-border bg-surface-muted/50 p-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail
              size={16}
              className="shrink-0 text-muted"
              aria-hidden="true"
            />
            <span className="truncate text-foreground">{inquiry.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone
              size={16}
              className="shrink-0 text-muted"
              aria-hidden="true"
            />
            <span className="text-foreground">{inquiry.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Car size={16} className="shrink-0 text-muted" aria-hidden="true" />
            <span className="text-foreground">{vehicleLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays
              size={16}
              className="shrink-0 text-muted"
              aria-hidden="true"
            />
            <span className="text-foreground">
              {formatDate(inquiry.createdAt)}
            </span>
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
          <FormField
            label="Estado"
            htmlFor="inquiry-status"
            required
            hint={
              currentIsClosed && !isAdmin
                ? "Solo un administrador puede reabrir una consulta cerrada."
                : undefined
            }
          >
            <Select
              id="inquiry-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as InquiryStatus)
              }
            >
              {INQUIRY_STATUSES.map((value) => (
                <option
                  key={value}
                  value={value}
                  disabled={
                    !isAdmin && currentIsClosed && !isClosedInquiryStatus(value)
                  }
                >
                  {INQUIRY_STATUS_CONFIG[value].label}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="hidden items-end sm:flex">
            <p className="flex items-center gap-2 pb-2 text-xs text-muted">
              <User size={14} aria-hidden="true" />
              Administrador y asesor pueden cambiar el estado; solo un
              administrador reabre cerradas.
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
          <p
            className="rounded-btn border border-error/30 bg-error/10 p-3 text-sm text-error"
            role="alert"
          >
            {mutation.error.message}
          </p>
        )}
      </div>
    </Modal>
  );
}

export default InquiryEditModal;
