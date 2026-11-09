// MOVIA — Tipos del módulo Inquiries

export interface InquirySummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleId: string | null;
  vehicleMake?: string;
  vehicleModel?: string;
  status: string;
  notes: string | null;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryDetail extends InquirySummary {}

export const CLOSED_STATUSES = ["VENDIDA", "DESCARTADA"] as const;
export type ClosedStatus = (typeof CLOSED_STATUSES)[number];
