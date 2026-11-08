// MOVIA — Servicio de vehículos (lógica de negocio)

import { vehicleRepo } from "../repositories/vehicle.repository.js";
import type { VehicleQuery } from "../validators/vehicle.validators.js";

export class VehicleService {
  async listPublished(query: VehicleQuery) {
    const formatted = vehicleRepo.findPublished(query);
    return formatted;
  }
}

export const vehicleService = new VehicleService();
