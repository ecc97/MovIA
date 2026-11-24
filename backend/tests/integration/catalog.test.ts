import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { loginAs, type TestAgent } from "../helpers/auth.js";
import { uniqueLabel, vehiclePayload } from "../helpers/data.js";

let admin: TestAgent;
const catalogMake = uniqueLabel("Catalogo");
let publishedId = "";
let draftId = "";

beforeAll(async () => {
  admin = await loginAs("maria@movia.demo");

  const published = await admin
    .post("/api/vehicles")
    .send(vehiclePayload({ make: catalogMake, bodyType: "SUV", condition: "USADO", year: 2019, price: 40_000_000 }));
  expect(published.status).toBe(201);
  publishedId = published.body.data.id;

  const draft = await admin
    .post("/api/vehicles")
    .send(vehiclePayload({ make: uniqueLabel("BorradorCatalogo"), status: "BORRADOR" }));
  expect(draft.status).toBe(201);
  draftId = draft.body.data.id;
});

describe("catálogo público", () => {
  it("devuelve solo vehículos PUBLICADO y excluye borradores", async () => {
    const response = await request(app).get("/api/vehicles?limit=100");

    expect(response.status).toBe(200);
    const items = response.body.data as Array<{ id: string; status: string }>;
    expect(items.every((item) => item.status === "PUBLICADO")).toBe(true);
    expect(items.map((item) => item.id)).toContain(publishedId);
    expect(items.map((item) => item.id)).not.toContain(draftId);
  });

  it("filtra por carrocería, condición, marca y año", async () => {
    const response = await request(app).get(
      `/api/vehicles?make=${encodeURIComponent(catalogMake)}&bodyType=SUV&condition=USADO&yearMin=2019&yearMax=2019`
    );

    expect(response.status).toBe(200);
    const items = response.body.data as Array<{
      id: string;
      make: string;
      bodyType: string;
      condition: string;
      year: number;
    }>;
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.bodyType === "SUV" && item.condition === "USADO" && item.year === 2019)).toBe(true);
    expect(items.map((item) => item.id)).toContain(publishedId);
  });

  it("ordena por precio ascendente y descendente", async () => {
    const asc = await request(app).get("/api/vehicles?sortBy=price_asc&limit=100");
    const desc = await request(app).get("/api/vehicles?sortBy=price_desc&limit=100");

    const ascPrices = (asc.body.data as Array<{ price: number }>).map((item) => item.price);
    const descPrices = (desc.body.data as Array<{ price: number }>).map((item) => item.price);
    expect(ascPrices).toEqual([...ascPrices].sort((a, b) => a - b));
    expect(descPrices).toEqual([...descPrices].sort((a, b) => b - a));
  });

  it("pagina con envelope data/pagination", async () => {
    const response = await request(app).get("/api/vehicles?page=1&limit=5");

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeLessThanOrEqual(5);
    expect(response.body.pagination).toMatchObject({ page: 1, limit: 5 });
    expect(response.body.pagination.totalPages).toBe(Math.ceil(response.body.pagination.total / 5));
  });

  it("expone facetas de años y marcas del catálogo publicado", async () => {
    const response = await request(app).get("/api/vehicles/meta");

    expect(response.status).toBe(200);
    expect(response.body.data.years).toContain(2019);
    expect(response.body.data.makes).toContain(catalogMake);
  });

  it("devuelve el detalle con fotos ordenadas y 404 si no existe", async () => {
    const detail = await request(app).get(`/api/vehicles/${publishedId}`);
    const missing = await request(app).get("/api/vehicles/no-existe");

    expect(detail.status).toBe(200);
    expect(detail.body.data.id).toBe(publishedId);
    expect(Array.isArray(detail.body.data.photos)).toBe(true);
    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe("vehiculo_no_encontrado");
  });

  it("rechaza query params inválidos con 400", async () => {
    const response = await request(app).get("/api/vehicles?bodyType=MOTO");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("validacion_error");
  });
});
