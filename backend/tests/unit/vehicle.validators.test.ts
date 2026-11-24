import { describe, expect, it } from "vitest";
import {
  createVehicleSchema,
  updateVehiclePhotosSchema,
  vehicleQuerySchema,
} from "../../src/modules/vehicles/validators/vehicle.validators.js";

const validVehicle = {
  make: "Toyota",
  model: "Corolla",
  year: 2020,
  price: 85000000,
  mileage: 30000,
  condition: "USADO" as const,
  bodyType: "AUTO" as const,
  fuel: "Gasolina",
  transmission: "Automática",
  color: "Blanco",
};

const photo = "https://images.pexels.com/photos/1/pexels-photo-1.jpeg";

describe("validadores de vehículos", () => {
  it("aplica defaults del catálogo y convierte params numéricos", () => {
    expect(vehicleQuerySchema.parse({})).toMatchObject({
      sortBy: "createdAt_desc",
      page: 1,
      limit: 12,
    });
    expect(vehicleQuerySchema.parse({ minPrice: "1000", page: "2", limit: "5" })).toMatchObject({
      minPrice: 1000,
      page: 2,
      limit: 5,
    });
  });

  it("rechaza carrocería desconocida, precio negativo y página 0", () => {
    expect(vehicleQuerySchema.safeParse({ bodyType: "MOTO" }).success).toBe(false);
    expect(vehicleQuerySchema.safeParse({ minPrice: -1 }).success).toBe(false);
    expect(vehicleQuerySchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("crea vehículo con status PUBLICADO y kilometraje 0 por defecto", () => {
    const result = createVehicleSchema.safeParse({ ...validVehicle, mileage: undefined });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("PUBLICADO");
      expect(result.data.mileage).toBe(0);
    }
  });

  it("acepta hasta 6 fotos http(s) y rechaza la séptima o una URL inválida", () => {
    expect(createVehicleSchema.safeParse({ ...validVehicle, photos: Array(6).fill(photo) }).success).toBe(true);
    expect(createVehicleSchema.safeParse({ ...validVehicle, photos: Array(7).fill(photo) }).success).toBe(false);
    expect(createVehicleSchema.safeParse({ ...validVehicle, photos: ["ftp://ejemplo.com/f.jpg"] }).success).toBe(false);
    expect(updateVehiclePhotosSchema.safeParse({ photos: Array(7).fill(photo) }).success).toBe(false);
  });

  it("rechaza años fuera de rango y precios no enteros", () => {
    expect(createVehicleSchema.safeParse({ ...validVehicle, year: 1899 }).success).toBe(false);
    expect(createVehicleSchema.safeParse({ ...validVehicle, price: 1.5 }).success).toBe(false);
  });
});
