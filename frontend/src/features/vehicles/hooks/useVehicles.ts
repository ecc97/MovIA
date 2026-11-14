// MOVIA — Hooks de TanStack Query del feature vehicles

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVehicles, getVehiclesPage, getVehicleFacets, createVehicle, updateVehicle, updateVehicleStatus } from "../services/vehicle.service";
import type {
  VehicleCreateData,
  VehicleDetail,
  VehicleQueryParams,
  VehicleStatus,
  VehicleSummary,
  VehicleUpdateData,
} from "../types";

// GET /api/vehicles es público y solo devuelve PUBLICADO
export function useVehicles(params?: VehicleQueryParams) {
  return useQuery<VehicleSummary[]>({
    queryKey: ["vehicles", params ?? {}],
    queryFn: () => getVehicles(params),
  });
}

export function useVehicleFacets() {
  return useQuery({
    queryKey: ["vehicles", "facets"],
    queryFn: () => getVehicleFacets(),
  });
}

export function useVehiclesPage() {
  return useQuery({
    queryKey: ["vehicles", "page", {}],
    queryFn: () => getVehiclesPage(),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation<VehicleDetail, Error, VehicleCreateData>({
    mutationFn: (data) => createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation<VehicleDetail, Error, { id: string; data: VehicleUpdateData }>({
    mutationFn: ({ id, data }) => updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useUpdateVehicleStatus() {
  const queryClient = useQueryClient();
  return useMutation<VehicleDetail, Error, { id: string; status: VehicleStatus }>({
    mutationFn: ({ id, status }) => updateVehicleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}
