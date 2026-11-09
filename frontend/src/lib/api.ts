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

export interface VehicleList {
  data: VehicleSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export async function getVehicles(params?: VehicleQueryParams): Promise<VehicleSummary[]> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        search.set(k, v);
      }
    });
  }
  const qs = search.toString();
  const response = await apiFetch<VehicleList>(`/api/vehicles${qs ? `?${qs}` : ""}`);
  return response.data ?? [];
}

export async function getVehicle(id: string): Promise<VehicleDetail> {
  const response = await apiFetch<{ data: VehicleDetail }>(`/api/vehicles/${id}`);
  return response.data;
}

// Inquiries

export interface InquiryCreateData {
  name: string;
  email: string;
  phone: string;
  message: string;
  vehicleId?: string;
}

export interface InquiryResponse {
  id: string;
  message: string;
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

export async function createInquiry(data: InquiryCreateData): Promise<InquiryResponse> {
  return apiFetch<{ id: string; message: string }>("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getInquiries(): Promise<InquirySummary[]> {
  const response = await apiFetch<{ data: InquirySummary[] }>("/api/inquiries");
  return response.data ?? [];
}