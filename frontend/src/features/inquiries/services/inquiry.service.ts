// MOVIA — Servicios HTTP del feature inquiries

import { apiFetch } from "@/lib/api";
import type { InquiryStatus } from "@/types";
import type {
  InquiryCreateData,
  InquiryListResponse,
  InquiryQueryParams,
  InquiryResponse,
  InquirySummary,
} from "../types";

export async function createInquiry(data: InquiryCreateData): Promise<InquiryResponse> {
  return apiFetch<InquiryResponse>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getInquiries(params?: InquiryQueryParams): Promise<InquiryListResponse> {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return apiFetch<InquiryListResponse>(`/api/inquiries${query ? `?${query}` : ""}`);
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus
): Promise<InquirySummary> {
  return apiFetch<InquirySummary>(`/api/inquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateInquiryNotes(
  id: string,
  notes: string
): Promise<InquirySummary> {
  return apiFetch<InquirySummary>(`/api/inquiries/${id}/notes`, {
    method: "PATCH",
    body: JSON.stringify({ notes }),
  });
}
