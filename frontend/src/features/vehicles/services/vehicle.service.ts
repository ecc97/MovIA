// MOVIA — Servicios HTTP del feature vehicles

import { apiFetch } from "@/lib/api";
import type {
  VehicleDetail,
  VehicleList,
  VehicleQueryParams,
  VehicleSummary,
  VehicleUpdateData,
} from "../types";

function buildQueryString(params?: VehicleQueryParams): string {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      search.set(k, v);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getVehicles(params?: VehicleQueryParams): Promise<VehicleSummary[]> {
  const response = await apiFetch<VehicleList>(`/api/vehicles${buildQueryString(params)}`);
  return response.data ?? [];
}

export async function getVehiclesPage(
  params?: VehicleQueryParams
): Promise<VehicleList> {
  return apiFetch<VehicleList>(`/api/vehicles${buildQueryString(params)}`);
}

export async function getVehicle(id: string): Promise<VehicleDetail> {
  const response = await apiFetch<{ data: VehicleDetail }>(`/api/vehicles/${id}`);
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
