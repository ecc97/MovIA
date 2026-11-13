// MOVIA — Hooks de TanStack Query del feature inquiries

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getInquiries, updateInquiryNotes, updateInquiryStatus } from "../services/inquiry.service";
import type { InquiryStatus, InquirySummary } from "../types";

export function useInquiries() {
  return useQuery({
    queryKey: ["inquiries"],
    queryFn: () => getInquiries(),
  });
}

export function useUpdateInquiry() {
  const queryClient = useQueryClient();
  return useMutation<
    InquirySummary,
    Error,
    { id: string; status: InquiryStatus; notes: string; originalNotes: string }
  >({
    // El backend expone estado y notas como PATCH independientes; las notas se
    // envían solo si cambiaron (updateNotes hace append, no reemplazo)
    mutationFn: async ({ id, status, notes, originalNotes }) => {
      const updated = await updateInquiryStatus(id, status);
      if (notes !== originalNotes) {
        await updateInquiryNotes(id, notes);
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
    },
  });
}
