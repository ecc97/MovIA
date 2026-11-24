// MOVIA — Hooks de TanStack Query del feature vehicles

"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVehicles, getVehiclePage, getInventoryPage, getVehicleFacets, getVehicle, createVehicle, updateVehicle, updateVehicleStatus, updateVehiclePhotos } from "../services/vehicle.service";
import type {
  VehicleCreateData,
  VehicleDetail,
  VehicleInventoryParams,
  VehicleList,
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

export function useVehiclePage(params?: VehicleQueryParams) {
  return useQuery<VehicleList>({
    queryKey: ["vehicles", "page", params ?? {}],
    queryFn: () => getVehiclePage(params),
    placeholderData: keepPreviousData,
  });
}

export function useVehicleDetail(id?: string, enabled = true) {
  return useQuery<VehicleDetail>({
    queryKey: ["vehicles", "detail", id],
    queryFn: () => getVehicle(id!),
    enabled: enabled && Boolean(id),
  });
}

export function useVehicleFacets() {
  return useQuery({
    queryKey: ["vehicles", "facets"],
    queryFn: () => getVehicleFacets(),
  });
}

// GET /api/vehicles/inventory es solo ADMIN y devuelve todos los estados
export function useInventoryPage(params?: VehicleInventoryParams, enabled = true) {
  return useQuery({
    queryKey: ["vehicles", "inventory", params ?? {}],
    queryFn: () => getInventoryPage(params),
    enabled,
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

export function useUpdateVehiclePhotos() {
  const queryClient = useQueryClient();
  return useMutation<VehicleDetail, Error, { id: string; photos: string[] }>({
    mutationFn: ({ id, photos }) => updateVehiclePhotos(id, photos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}
