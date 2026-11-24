import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { loginAs, type TestAgent } from "../helpers/auth.js";
import { inquiryPayload } from "../helpers/data.js";

let admin: TestAgent;
let vehicleId = "";

beforeAll(async () => {
  admin = await loginAs("maria@movia.demo");
  const published = await request(app).get("/api/vehicles?limit=1");
  vehicleId = String(published.body.data[0]?.id ?? "");
});

describe("creación de consultas", () => {
  it("crea una consulta general sin vehículo asociado", async () => {
    const response = await request(app).post("/api/inquiries").send(inquiryPayload({ name: "General Test" }));

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: "General Test", status: "NUEVA", vehicleId: null });
    expect(response.body.id).toBeTruthy();

    const detail = await admin.get(`/api/inquiries/${response.body.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.vehicleId).toBeNull();
  });

  it("crea una consulta asociada a un vehículo publicado", async () => {
    expect(vehicleId).not.toBe("");

    const response = await request(app)
      .post("/api/inquiries")
      .send(inquiryPayload({ name: "Vehículo Test", vehicleId }));

    expect(response.status).toBe(201);
    expect(response.body.vehicleId).toBe(vehicleId);

    const detail = await admin.get(`/api/inquiries/${response.body.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.vehicleMake).toBeTruthy();
  });

  it("rechaza email inválido con validation_error", async () => {
    const response = await request(app).post("/api/inquiries").send(inquiryPayload({ email: "no-email" }));

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("validation_error");
  });

  it("rechaza campos obligatorios ausentes", async () => {
    const response = await request(app).post("/api/inquiries").send({ email: "test@ejemplo.com" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("validation_error");
  });

  it("rechaza mensajes de más de 1000 caracteres", async () => {
    const response = await request(app)
      .post("/api/inquiries")
      .send(inquiryPayload({ message: "x".repeat(1001) }));

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("validation_error");
  });
});
