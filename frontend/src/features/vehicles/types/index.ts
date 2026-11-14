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
  photoUrl?: string;
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
  order?: number;
}

export interface VehicleDetail extends VehicleSummary {
  description: string | null;
  fuel: string;
  transmission: string;
  color: string;
  photos: VehiclePhoto[];
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
}

// PATCH /api/vehicles/:id acepta actualización parcial
export type VehicleUpdateData = Partial<Omit<VehicleSummary, "id">>;
