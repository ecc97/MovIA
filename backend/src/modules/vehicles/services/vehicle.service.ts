// MOVIA — Servicio de vehículos (+lógica de negocio)

import { vehicleRepo } from "../repositories/vehicle.repository.js";
import type { VehicleQuery, CreateVehicle, UpdateVehicle, UpdateVehicleStatus } from "../validators/vehicle.validators.js";
import type { VehicleDetail } from "../types/vehicle.types.js";

export class VehicleService {
  async listPublished(query: VehicleQuery) {
    return vehicleRepo.findPublished(query);
  }

  async getFacets(): Promise<{ years: number[]; makes: string[] }> {
    return vehicleRepo.findFacets();
  }

  async getDetail(id: string): Promise<VehicleDetail> {
    const v = await vehicleRepo.findById(id);
    if (!v) throw new Error("VEHICLE_NOT_FOUND");
    return v;
  }

  async create(data: CreateVehicle, createdBy: string): Promise<VehicleDetail> {
    return vehicleRepo.create(data, createdBy);
  }

  async update(id: string, data: UpdateVehicle): Promise<VehicleDetail> {
    const v = await vehicleRepo.findById(id);
    if (!v) throw new Error("VEHICLE_NOT_FOUND");
    return vehicleRepo.update(id, data);
  }

  async updateStatus(id: string, data: UpdateVehicleStatus): Promise<VehicleDetail> {
    const v = await vehicleRepo.findById(id);
    if (!v) throw new Error("VEHICLE_NOT_FOUND");
    return vehicleRepo.updateStatus(id, data.status);
  }
}

export const vehicleService = new VehicleService();