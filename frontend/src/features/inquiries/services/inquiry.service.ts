// MOVIA — Servicios HTTP del feature inquiries

import { apiFetch } from "@/lib/api";
import type { InquiryStatus } from "@/types";
import type {
  InquiryCreateData,
  InquiryListResponse,
  InquiryResponse,
  InquirySummary,
} from "../types";

export async function createInquiry(data: InquiryCreateData): Promise<InquiryResponse> {
  return apiFetch<InquiryResponse>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getInquiries(): Promise<InquiryListResponse> {
  return apiFetch<InquiryListResponse>("/api/inquiries");
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<InquirySummary> {
  const response = await apiFetch<{ data: InquirySummary }>(`/api/inquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.data;
}

export async function updateInquiryNotes(
  id: string,
  notes: string
): Promise<InquirySummary> {
  const response = await apiFetch<{ data: InquirySummary }>(`/api/inquiries/${id}/notes`, {
    method: "PATCH",
    body: JSON.stringify({ notes }),
  });
  return response.data;
}
