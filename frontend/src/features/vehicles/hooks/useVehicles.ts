// MOVIA — Hooks de TanStack Query del feature vehicles

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVehicles, getVehiclesPage, updateVehicle, updateVehicleStatus } from "../services/vehicle.service";
import type {
  VehicleDetail,
  VehicleQueryParams,
  VehicleStatus,
  VehicleSummary,
  VehicleUpdateData,
} from "../types";

export function useVehicles(params?: VehicleQueryParams) {
  return useQuery<VehicleSummary[]>({
    queryKey: ["vehicles", params ?? {}],
    queryFn: () => getVehicles(params),
  });
}

export function useVehiclesPage() {
  return useQuery({
    queryKey: ["vehicles", "page", {}],
    queryFn: () => getVehiclesPage(),
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
