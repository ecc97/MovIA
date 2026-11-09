// MOVIA — Validaciones Zod para el módulo Inquiries

import { z } from "zod";

// --- Crear consulta (público) ---
export const createInquirySchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  email: z.string().email("Email inválido").max(150),
  phone: z.string().min(7, "Teléfono inválido").max(20),
  message: z.string().min(1, "El mensaje es obligatorio").max(1000),
  vehicleId: z.string().optional(),
});

export type CreateInquiry = z.infer<typeof createInquirySchema>;

// --- Listado (query params) ---
export const inquiryQuerySchema = z.object({
  status: z.enum(["NUEVA", "EN_CONTACTO", "EN_SEGUIMIENTO", "VENDIDA", "DESCARTADA"]).optional(),
  assignedToId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type InquiryQuery = z.infer<typeof inquiryQuerySchema>;

// --- Parametros ---
export const inquiryIdParamSchema = z.object({
  id: z.string().min(1, "El ID es obligatorio"),
});

export type InquiryIdParam = z.infer<typeof inquiryIdParamSchema>;

// --- Cambio de estado ---
export const updateInquiryStatusSchema = z.object({
  status: z.enum(["NUEVA", "EN_CONTACTO", "EN_SEGUIMIENTO", "VENDIDA", "DESCARTADA"]),
});

export type UpdateInquiryStatus = z.infer<typeof updateInquiryStatusSchema>;

// --- Notas internas ---
export const updateInquiryNotesSchema = z.object({
  notes: z.string().max(1000),
});

export type UpdateInquiryNotes = z.infer<typeof updateInquiryNotesSchema>;
