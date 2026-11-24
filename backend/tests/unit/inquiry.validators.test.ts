import { describe, expect, it } from "vitest";
import { createInquirySchema, inquiryQuerySchema, updateInquiryNotesSchema, updateInquiryStatusSchema } from "../../src/modules/inquiries/validators/inquiry.validators.js";

describe("validadores de consultas", () => {
  const validInquiry = {
    name: "Cliente Prueba",
    email: "cliente@ejemplo.com",
    phone: "+57 300 123 4567",
    message: "Me interesa un vehículo SUV",
  };

  it("acepta una consulta general válida sin vehicleId", () => {
    const result = createInquirySchema.safeParse(validInquiry);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.vehicleId).toBeUndefined();
  });

  it("acepta una consulta asociada a un vehículo", () => {
    const result = createInquirySchema.safeParse({ ...validInquiry, vehicleId: "vehicle-1" });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.vehicleId).toBe("vehicle-1");
  });

  it("rechaza email inválido, teléfono corto y mensaje vacío", () => {
    expect(createInquirySchema.safeParse({ ...validInquiry, email: "no-email" }).success).toBe(false);
    expect(createInquirySchema.safeParse({ ...validInquiry, phone: "123" }).success).toBe(false);
    expect(createInquirySchema.safeParse({ ...validInquiry, message: "" }).success).toBe(false);
  });

  it("aplica defaults de paginación y convierte query params numéricos", () => {
    expect(inquiryQuerySchema.parse({})).toMatchObject({ page: 1, limit: 20 });
    expect(inquiryQuerySchema.parse({ page: "3", limit: "5" })).toMatchObject({ page: 3, limit: 5 });
  });

  it("rechaza estados desconocidos y notas demasiado largas", () => {
    expect(updateInquiryStatusSchema.safeParse({ status: "CERRADA" }).success).toBe(false);
    expect(updateInquiryNotesSchema.safeParse({ notes: "x".repeat(1001) }).success).toBe(false);
  });
});
