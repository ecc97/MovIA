// MOVIA — Tipos del módulo vehículos

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  bodyType: string;
  fuel: string;
  transmission: string;
  color: string;
  status: string;
  photos: Array<{ url: string; order: number }>;
}

export interface VehicleDetail {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  bodyType: string;
  fuel: string;
  transmission: string;
  color: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  photos: Array<{ url: string; order: number }>;
}