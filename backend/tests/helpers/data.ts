import { randomUUID } from "node:crypto";

export function uniqueLabel(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export function vehiclePayload(overrides: Record<string, unknown> = {}) {
  return {
    make: uniqueLabel("Marca"),
    model: uniqueLabel("Modelo"),
    year: 2020,
    price: 85_000_000,
    mileage: 30_000,
    condition: "USADO",
    bodyType: "SUV",
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Blanco",
    ...overrides,
  };
}

export function inquiryPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Cliente Test",
    email: `cliente-${randomUUID().slice(0, 8)}@ejemplo.com`,
    phone: "3001234567",
    message: "Mensaje de prueba para la suite de tests",
    ...overrides,
  };
}
