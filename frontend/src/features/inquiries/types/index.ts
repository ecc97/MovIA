// MOVIA — Tipos del feature inquiries

import type { InquiryStatus } from "@/types";

export type { InquiryStatus };

export interface InquiryCreateData {
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleId?: string;
}

export interface InquiryResponse {
  id: string;
  message: string;
}

export interface InquirySummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleId: string | null;
  vehicleMake?: string;
  vehicleModel?: string;
  status: InquiryStatus;
  notes: string | null;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryListResponse {
  items: InquirySummary[];
  total: number;
}
