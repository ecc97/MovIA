// MOVIA — Servicios HTTP del feature vehicles

import { apiFetch } from "@/lib/api";
import type {
  VehicleCreateData,
  VehicleDetail,
  VehicleFacets,
  VehicleInventoryParams,
  VehicleList,
  VehicleQueryParams,
  VehicleSummary,
  VehicleUpdateData,
} from "../types";

function buildQueryString<T extends object>(params?: T): string {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      search.set(k, String(v));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getVehicles(params?: VehicleQueryParams): Promise<VehicleSummary[]> {
  const response = await apiFetch<VehicleList>(`/api/vehicles${buildQueryString(params)}`);
  return response.data ?? [];
}

export async function getVehiclePage(params?: VehicleQueryParams): Promise<VehicleList> {
  return apiFetch<VehicleList>(`/api/vehicles${buildQueryString(params)}`);
}

export async function getInventoryPage(params?: VehicleInventoryParams): Promise<VehicleList> {
  return apiFetch<VehicleList>(`/api/vehicles/inventory${buildQueryString(params)}`);
}

export async function getVehicleFacets(): Promise<VehicleFacets> {
  const response = await apiFetch<{ data: VehicleFacets }>("/api/vehicles/meta");
  return response.data;
}

export async function getVehicle(id: string): Promise<VehicleDetail> {
  const response = await apiFetch<{ data: VehicleDetail }>(`/api/vehicles/${id}`);
  return response.data;
}

export async function createVehicle(data: VehicleCreateData): Promise<VehicleDetail> {
  const response = await apiFetch<{ data: VehicleDetail }>("/api/vehicles", {
    method: "POST",
    body: JSON.stringify({ ...data, status: data.status ?? "PUBLICADO" }),
  });
  return response.data;
}

export async function updateVehicle(id: string, data: VehicleUpdateData): Promise<VehicleDetail> {
  const response = await apiFetch<{ data: VehicleDetail }>(`/api/vehicles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateVehicleStatus(id: string, status: VehicleSummary["status"]): Promise<VehicleDetail> {
  const response = await apiFetch<{ data: VehicleDetail }>(`/api/vehicles/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return response.data;
}

export async function updateVehiclePhotos(id: string, photos: string[]): Promise<VehicleDetail> {
  const response = await apiFetch<{ data: VehicleDetail }>(`/api/vehicles/${id}/photos`, {
    method: "PUT",
    body: JSON.stringify({ photos }),
  });
  return response.data;
}
