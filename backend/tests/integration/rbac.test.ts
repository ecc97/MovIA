import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { loginAs } from "../helpers/auth.js";
import { vehiclePayload } from "../helpers/data.js";

describe("control de acceso por rol", () => {
  it("devuelve 401 sin sesión en rutas protegidas y permite el catálogo público", async () => {
    expect((await request(app).get("/api/vehicles")).status).toBe(200);

    for (const response of [
      await request(app).get("/api/inquiries"),
      await request(app).get("/api/vehicles/inventory"),
      await request(app).post("/api/vehicles").send(vehiclePayload()),
    ]) {
      expect(response.status).toBe(401);
      expect(response.body.error).toBe("no_autenticado");
    }
  });

  it("permite al ASESOR ver consultas pero bloquea el inventario", async () => {
    const advisor = await loginAs("carlos@movia.demo");

    expect((await advisor.get("/api/inquiries")).status).toBe(200);
    expect((await advisor.get("/api/vehicles/inventory")).status).toBe(403);

    const create = await advisor.post("/api/vehicles").send(vehiclePayload());
    expect(create.status).toBe(403);
    expect(create.body.error).toBe("no_autorizado");

    const status = await advisor.patch("/api/vehicles/no-existe/status").send({ status: "ARCHIVADO" });
    expect(status.status).toBe(403);

    const photos = await advisor.put("/api/vehicles/no-existe/photos").send({ photos: [] });
    expect(photos.status).toBe(403);
  });

  it("permite al ADMIN consultas e inventario", async () => {
    const admin = await loginAs("maria@movia.demo");

    expect((await admin.get("/api/inquiries")).status).toBe(200);

    const inventory = await admin.get("/api/vehicles/inventory");
    expect(inventory.status).toBe(200);
    expect(Array.isArray(inventory.body.data)).toBe(true);
    expect(inventory.body.pagination).toBeTruthy();
  });

  it("permite a un visitante crear consultas públicas", async () => {
    const response = await request(app)
      .post("/api/inquiries")
      .send({
        name: "Visitante",
        email: `visitante-${Date.now()}@ejemplo.com`,
        phone: "3001234567",
        message: "Consulta pública de prueba",
      });

    expect(response.status).toBe(201);
  });
});
