// MOVIA — Tipos del feature vehicles

import type { VehicleStatus } from "@/types";

export type { VehicleStatus };

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  bodyType: string;
  status: VehicleStatus;
  photos: VehiclePhoto[];
}

export interface VehicleList {
  data: VehicleSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VehiclePhoto {
  id?: string;
  url: string;
  order: number;
}

export interface VehicleDetail extends VehicleSummary {
  description: string | null;
  fuel: string;
  transmission: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Contrato real de GET /api/vehicles (vehicleQuerySchema del backend)
export interface VehicleQueryParams {
  bodyType?: string;
  condition?: string;
  make?: string;
  minPrice?: string;
  maxPrice?: string;
  yearMin?: string;
  yearMax?: string;
  mileageMin?: string;
  mileageMax?: string;
  sortBy?: "createdAt_desc" | "price_asc" | "price_desc" | "year_desc";
  page?: string;
  limit?: string;
}

// Contrato de GET /api/vehicles/inventory (solo ADMIN, todos los estados)
export interface VehicleInventoryParams {
  status?: VehicleStatus;
  page?: number;
  limit?: number;
}

// GET /api/vehicles/meta (años y marcas de vehículos PUBLICADO)
export interface VehicleFacets {
  years: number[];
  makes: string[];
}

// Espejo de createVehicleSchema del backend (status default PUBLICADO)
export interface VehicleCreateData {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: "NUEVO" | "USADO";
  bodyType: "AUTO" | "SUV" | "CAMIONETA";
  fuel: string;
  transmission: string;
  color: string;
  description?: string;
  // Fotos por URL (opcional); el orden del array define el orden (1 = principal)
  photos?: string[];
  // Guardar como borrador (no visible en catálogo) o publicar de inmediato (default)
  status?: "BORRADOR" | "PUBLICADO";
}

// PATCH /api/vehicles/:id acepta actualización parcial (sin fotos ni status: endpoints aparte)
export type VehicleUpdateData = Partial<
  Omit<VehicleDetail, "id" | "photos" | "status" | "createdAt" | "updatedAt">
>;
