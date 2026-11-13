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

export interface VehicleQueryParams {
  status?: VehicleStatus;
  bodyType?: string;
  condition?: string;
  make?: string;
  yearMin?: string;
  yearMax?: string;
  priceMin?: string;
  priceMax?: string;
  mileageMin?: string;
  mileageMax?: string;
  fuel?: string;
  transmission?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
}

// PATCH /api/vehicles/:id acepta actualización parcial
export type VehicleUpdateData = Partial<Omit<VehicleSummary, "id">>;
