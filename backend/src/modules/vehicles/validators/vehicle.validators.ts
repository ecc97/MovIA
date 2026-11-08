// MOVIA — Validaciones Zod para el módulo vehículos

import { z } from "zod";

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
