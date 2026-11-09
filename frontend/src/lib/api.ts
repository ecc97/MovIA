const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: response.statusText,
      message: response.statusText,
    }));
    const err = error as { error: string; message?: string };
    throw new Error(err.message || err.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Vehicles

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  bodyType: string;
  status: string;
  photoUrl?: string;
}

export interface VehicleDetail extends VehicleSummary {
  description: string | null;
  fuel: string;
  transmission: string;
  color: string;
  photos: { id: string; url: string; order: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleQueryParams {
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

export async function getVehicles(params?: VehicleQueryParams) {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        search.set(k, v);
      }
    });
  }
  const qs = search.toString();
  return apiFetch<VehicleSummary[]>(`/api/vehicles${qs ? `?${qs}` : ""}`);
}

export async function getVehicle(id: string): Promise<VehicleDetail> {
  return apiFetch(`/api/vehicles/${id}`);
}

// Inquiries

export interface InquiryCreateData {
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleId?: string;
}

export interface InquirySummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleId: string | null;
  vehicleMake?: string;
  vehicleModel?: string;
  status: string;
  notes: string | null;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createInquiry(data: InquiryCreateData) {
  return apiFetch<{ id: string; message: string }>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}