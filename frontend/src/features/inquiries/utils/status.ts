import type { InquiryStatus } from "@/types";
import type { BadgeTone } from "@/components/ui/Badge";

export const INQUIRY_STATUS_CONFIG: Record<
  InquiryStatus,
  { label: string; tone: BadgeTone }
> = {
  NUEVA: { label: "Nueva", tone: "accent" },
  EN_CONTACTO: { label: "En contacto", tone: "info" },
  EN_SEGUIMIENTO: { label: "En seguimiento", tone: "warning" },
  VENDIDA: { label: "Vendida", tone: "success" },
  DESCARTADA: { label: "Descartada", tone: "neutral" },
};

export const INQUIRY_STATUSES = Object.keys(
  INQUIRY_STATUS_CONFIG,
) as InquiryStatus[];

export const INQUIRY_CLOSED_STATUSES: readonly InquiryStatus[] = [
  "VENDIDA",
  "DESCARTADA",
];

export function isClosedInquiryStatus(status: InquiryStatus): boolean {
  return INQUIRY_CLOSED_STATUSES.includes(status);
}
