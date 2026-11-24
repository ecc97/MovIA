import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { loginAs, type TestAgent } from "../helpers/auth.js";
import { inquiryPayload } from "../helpers/data.js";

let advisor: TestAgent;
let admin: TestAgent;
let inquiryId = "";

beforeAll(async () => {
  advisor = await loginAs("carlos@movia.demo");
  admin = await loginAs("maria@movia.demo");

  const created = await request(app).post("/api/inquiries").send(inquiryPayload());
  expect(created.status).toBe(201);
  inquiryId = created.body.id;

  const closed = await admin.patch(`/api/inquiries/${inquiryId}/status`).send({ status: "VENDIDA" });
  expect(closed.body.status).toBe("VENDIDA");
});

describe("reapertura de consultas cerradas", () => {
  it("devuelve 403 al ASESOR que intenta reabrir", async () => {
    const response = await advisor.patch(`/api/inquiries/${inquiryId}/status`).send({ status: "EN_CONTACTO" });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("no_autorizado");
    expect(response.body.message).toContain("Solo un ADMIN");
  });

  it("permite al ADMIN reabrir una consulta VENDIDA", async () => {
    const response = await admin.patch(`/api/inquiries/${inquiryId}/status`).send({ status: "EN_CONTACTO" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("EN_CONTACTO");
  });

  it("permite al ASESOR cerrar una consulta abierta", async () => {
    const response = await advisor.patch(`/api/inquiries/${inquiryId}/status`).send({ status: "DESCARTADA" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("DESCARTADA");
  });

  it("permite al ADMIN reabrir una consulta DESCARTADA", async () => {
    const response = await admin.patch(`/api/inquiries/${inquiryId}/status`).send({ status: "NUEVA" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("NUEVA");
  });

  it("devuelve 404 si la consulta no existe", async () => {
    const response = await admin.patch("/api/inquiries/no-existe/status").send({ status: "NUEVA" });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("consulta_no_encontrada");
  });
});
