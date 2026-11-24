import { afterEach, describe, expect, it, vi } from "vitest";
import { inquiryRepo } from "../../src/modules/inquiries/repositories/inquiry.repository.js";
import { inquiryService } from "../../src/modules/inquiries/services/inquiry.service.js";
import type { InquiryDetail } from "../../src/modules/inquiries/types/inquiry.types.js";

function inquiryWithStatus(status: string): InquiryDetail {
  return {
    id: "inquiry-1",
    name: "Cliente",
    email: "cliente@ejemplo.com",
    phone: "3001234567",
    message: "Consulta de prueba",
    vehicleId: null,
    status,
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("regla de reapertura de consultas cerradas", () => {
  afterEach(() => vi.restoreAllMocks());

  it("impide que un ASESOR reabra una consulta VENDIDA", async () => {
    vi.spyOn(inquiryRepo, "findById").mockResolvedValue(inquiryWithStatus("VENDIDA"));
    const update = vi.spyOn(inquiryRepo, "updateStatus");

    await expect(
      inquiryService.updateStatus({ id: "inquiry-1" }, { status: "EN_CONTACTO" }, "ASESOR")
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(update).not.toHaveBeenCalled();
  });

  it("permite que un ADMIN reabra una consulta DESCARTADA", async () => {
    vi.spyOn(inquiryRepo, "findById").mockResolvedValue(inquiryWithStatus("DESCARTADA"));
    const update = vi.spyOn(inquiryRepo, "updateStatus").mockResolvedValue(inquiryWithStatus("NUEVA"));

    await expect(
      inquiryService.updateStatus({ id: "inquiry-1" }, { status: "NUEVA" }, "ADMIN")
    ).resolves.toMatchObject({ status: "NUEVA" });
    expect(update).toHaveBeenCalledWith("inquiry-1", "NUEVA");
  });

  it("permite transiciones entre estados abiertos al ASESOR", async () => {
    vi.spyOn(inquiryRepo, "findById").mockResolvedValue(inquiryWithStatus("NUEVA"));
    const update = vi.spyOn(inquiryRepo, "updateStatus").mockResolvedValue(inquiryWithStatus("EN_CONTACTO"));

    await inquiryService.updateStatus({ id: "inquiry-1" }, { status: "EN_CONTACTO" }, "ASESOR");

    expect(update).toHaveBeenCalledWith("inquiry-1", "EN_CONTACTO");
  });

  it("permite pasar de cerrada a cerrada al ASESOR", async () => {
    vi.spyOn(inquiryRepo, "findById").mockResolvedValue(inquiryWithStatus("VENDIDA"));
    const update = vi.spyOn(inquiryRepo, "updateStatus").mockResolvedValue(inquiryWithStatus("DESCARTADA"));

    await inquiryService.updateStatus({ id: "inquiry-1" }, { status: "DESCARTADA" }, "ASESOR");

    expect(update).toHaveBeenCalledWith("inquiry-1", "DESCARTADA");
  });

  it("falla con INQUIRY_NOT_FOUND si la consulta no existe", async () => {
    vi.spyOn(inquiryRepo, "findById").mockResolvedValue(null);

    await expect(
      inquiryService.updateStatus({ id: "missing" }, { status: "NUEVA" }, "ADMIN")
    ).rejects.toMatchObject({ code: "INQUIRY_NOT_FOUND" });
  });
});
