// MOVIA — Validaciones Zod para el módulo vehículos

import { z } from "zod";

// --- Catálogo público (lectura) ---

export const vehicleQuerySchema = z.object({
  bodyType: z.enum(["AUTO", "SUV", "CAMIONETA"]).optional(),
  condition: z.enum(["NUEVO", "USADO"]).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  make: z.string().optional(),
  year: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export type VehicleQuery = z.infer<typeof vehicleQuerySchema>;

// --- CRUD inventario (solo ADMIN) ---

export const createVehicleSchema = z.object({
  make: z.string().min(1, "La marca es obligatoria").max(60),
  model: z.string().min(1, "El modelo es obligatorio").max(60),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().int().nonnegative(),
  mileage: z.number().int().nonnegative().default(0),
  condition: z.enum(["NUEVO", "USADO"]),
  bodyType: z.enum(["AUTO", "SUV", "CAMIONETA"]),
  fuel: z.string().min(1).max(40),
  transmission: z.string().min(1).max(40),
  color: z.string().min(1).max(40),
  description: z.string().max(2000).optional(),
  status: z.enum(["BORRADOR", "PUBLICADO", "ARCHIVADO"]).default("PUBLICADO"),
});

export type CreateVehicle = z.infer<typeof createVehicleSchema>;

export const updateVehicleSchema = z.object({
  make: z.string().min(1).max(60).optional(),
  model: z.string().min(1).max(60).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  price: z.number().int().nonnegative().optional(),
  mileage: z.number().int().nonnegative().optional(),
  condition: z.enum(["NUEVO", "USADO"]).optional(),
  bodyType: z.enum(["AUTO", "SUV", "CAMIONETA"]).optional(),
  fuel: z.string().min(1).max(40).optional(),
  transmission: z.string().min(1).max(40).optional(),
  color: z.string().min(1).max(40).optional(),
  description: z.string().max(2000).optional(),
});

export type UpdateVehicle = z.infer<typeof updateVehicleSchema>;

export const vehicleIdParamSchema = z.object({
  id: z.string().min(1, "El ID es obligatorio"),
});

export type VehicleIdParam = z.infer<typeof vehicleIdParamSchema>;

export const updateVehicleStatusSchema = z.object({
  status: z.enum(["BORRADOR", "PUBLICADO", "ARCHIVADO"]),
  reason: z.string().max(500).optional(),
});

export type UpdateVehicleStatus = z.infer<typeof updateVehicleStatusSchema>;