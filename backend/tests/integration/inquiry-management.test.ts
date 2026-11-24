import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { loginAs, type TestAgent } from "../helpers/auth.js";
import { inquiryPayload } from "../helpers/data.js";

let advisor: TestAgent;
let admin: TestAgent;
let firstId = "";
let secondId = "";

beforeAll(async () => {
  advisor = await loginAs("carlos@movia.demo");
  admin = await loginAs("maria@movia.demo");

  const first = await request(app).post("/api/inquiries").send(inquiryPayload({ name: "Gestión Uno" }));
  const second = await request(app).post("/api/inquiries").send(inquiryPayload({ name: "Gestión Dos" }));
  expect(first.status).toBe(201);
  expect(second.status).toBe(201);
  firstId = first.body.id;
  secondId = second.body.id;
});

describe("gestión de consultas", () => {
  it("lista con envelope items/total/page/limit", async () => {
    const response = await advisor.get("/api/inquiries?page=1&limit=5");

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(5);
    expect(response.body.total).toBeGreaterThanOrEqual(2);
    expect(response.body.items.length).toBeLessThanOrEqual(5);
  });

  it("filtra por estado", async () => {
    const response = await advisor.get("/api/inquiries?status=NUEVA&limit=100");

    expect(response.status).toBe(200);
    expect(response.body.items.every((item: { status: string }) => item.status === "NUEVA")).toBe(true);
  });

  it("pagina la bandeja", async () => {
    const response = await advisor.get("/api/inquiries?page=2&limit=1");

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(2);
    expect(response.body.limit).toBe(1);
    expect(response.body.items.length).toBe(1);
  });

  it("permite saltar estados al ASESOR", async () => {
    const contact = await advisor.patch(`/api/inquiries/${firstId}/status`).send({ status: "EN_CONTACTO" });
    expect(contact.status).toBe(200);
    expect(contact.body).toMatchObject({ id: firstId, status: "EN_CONTACTO" });

    const sold = await advisor.patch(`/api/inquiries/${firstId}/status`).send({ status: "VENDIDA" });
    expect(sold.status).toBe(200);
    expect(sold.body.status).toBe("VENDIDA");
  });

  it("añade notas con timestamp y autor, y conserva las anteriores", async () => {
    const first = await advisor.patch(`/api/inquiries/${secondId}/notes`).send({ notes: "Llamada inicial" });
    expect(first.status).toBe(200);
    expect(first.body.notes).toMatch(/\[\d{4}-\d{2}-\d{2}T.*\] Carlos Ruiz: Llamada inicial/);

    const second = await admin.patch(`/api/inquiries/${secondId}/notes`).send({ notes: "Seguimiento" });
    expect(second.status).toBe(200);
    expect(second.body.notes).toContain("Llamada inicial");
    expect(second.body.notes).toContain("María López: Seguimiento");
  });

  it("consulta el detalle con ADMIN y devuelve 404 si no existe", async () => {
    const detail = await admin.get(`/api/inquiries/${secondId}`);
    const missing = await advisor.get("/api/inquiries/no-existe");

    expect(detail.status).toBe(200);
    expect(detail.body.id).toBe(secondId);
    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe("consulta_no_encontrada");
  });

  it("rechaza estados y notas inválidos", async () => {
    const badStatus = await advisor.patch(`/api/inquiries/${secondId}/status`).send({ status: "CERRADA" });
    const longNotes = await advisor
      .patch(`/api/inquiries/${secondId}/notes`)
      .send({ notes: "x".repeat(1001) });

    expect(badStatus.status).toBe(400);
    expect(badStatus.body.error).toBe("validation_error");
    expect(longNotes.status).toBe(400);
  });
});
