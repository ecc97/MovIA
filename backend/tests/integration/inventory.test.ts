import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { loginAs, type TestAgent } from "../helpers/auth.js";
import { uniqueLabel, vehiclePayload } from "../helpers/data.js";

const photo1 = "https://images.pexels.com/photos/100/pexels-photo-100.jpeg";
const photo2 = "https://images.pexels.com/photos/101/pexels-photo-101.jpeg";
const photo3 = "https://images.pexels.com/photos/102/pexels-photo-102.jpeg";

let admin: TestAgent;
let createdId = "";
let draftId = "";

beforeAll(async () => {
  admin = await loginAs("maria@movia.demo");

  const published = await admin
    .post("/api/vehicles")
    .send(vehiclePayload({ make: uniqueLabel("Inventario"), photos: [photo1, photo2] }));
  expect(published.status).toBe(201);
  createdId = published.body.data.id;

  const draft = await admin.post("/api/vehicles").send(vehiclePayload({ status: "BORRADOR" }));
  expect(draft.status).toBe(201);
  draftId = draft.body.data.id;
});

describe("inventario (solo ADMIN)", () => {
  it("crea PUBLICADO por defecto con fotos ordenadas desde el array", async () => {
    const detail = await request(app).get(`/api/vehicles/${createdId}`);

    expect(detail.status).toBe(200);
    expect(detail.body.data.status).toBe("PUBLICADO");
    expect(detail.body.data.photos).toEqual([
      { url: photo1, order: 1 },
      { url: photo2, order: 2 },
    ]);
  });

  it("guarda borradores fuera del catálogo y los lista por estado", async () => {
    const publicList = await request(app).get("/api/vehicles?limit=100");
    const inventory = await admin.get("/api/vehicles/inventory?status=BORRADOR&limit=100");

    expect(publicList.body.data.map((item: { id: string }) => item.id)).not.toContain(draftId);
    expect(inventory.status).toBe(200);
    expect(inventory.body.data.map((item: { id: string }) => item.id)).toContain(draftId);
    expect(inventory.body.data.every((item: { status: string }) => item.status === "BORRADOR")).toBe(true);
  });

  it("edita campos parcialmente sin cambiar el estado", async () => {
    const response = await admin.patch(`/api/vehicles/${createdId}`).send({ price: 91_000_000, model: "Editado" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ price: 91_000_000, model: "Editado", status: "PUBLICADO" });
  });

  it("archiva y republica un vehículo", async () => {
    const archived = await admin.patch(`/api/vehicles/${createdId}/status`).send({ status: "ARCHIVADO" });
    expect(archived.body.data.status).toBe("ARCHIVADO");

    const afterArchive = await request(app).get("/api/vehicles?limit=100");
    expect(afterArchive.body.data.map((item: { id: string }) => item.id)).not.toContain(createdId);

    const published = await admin.patch(`/api/vehicles/${createdId}/status`).send({ status: "PUBLICADO" });
    expect(published.body.data.status).toBe("PUBLICADO");

    const afterPublish = await request(app).get("/api/vehicles?limit=100");
    expect(afterPublish.body.data.map((item: { id: string }) => item.id)).toContain(createdId);
  });

  it("reemplaza toda la colección de fotos", async () => {
    const response = await admin
      .put(`/api/vehicles/${createdId}/photos`)
      .send({ photos: [photo3, photo1, photo2] });

    expect(response.status).toBe(200);
    expect(response.body.data.photos.map((photo: { order: number }) => photo.order)).toEqual([1, 2, 3]);
    expect(response.body.data.photos[0].url).toBe(photo3);
  });

  it("rechaza payloads inválidos con 400", async () => {
    const sevenPhotos = await admin
      .post("/api/vehicles")
      .send(vehiclePayload({ photos: Array(7).fill(photo1) }));
    const badBodyType = await admin.post("/api/vehicles").send(vehiclePayload({ bodyType: "MOTO" }));
    const badYear = await admin.post("/api/vehicles").send(vehiclePayload({ year: 1899 }));
    const tooManyOnReplace = await admin
      .put(`/api/vehicles/${createdId}/photos`)
      .send({ photos: Array(7).fill(photo1) });

    expect(sevenPhotos.status).toBe(400);
    expect(badBodyType.status).toBe(400);
    expect(badYear.status).toBe(400);
    expect(tooManyOnReplace.status).toBe(400);
    expect(sevenPhotos.body.error).toBe("validacion_error");
  });

  it("devuelve 404 al editar un vehículo inexistente", async () => {
    const update = await admin.patch("/api/vehicles/no-existe").send({ price: 1 });
    const photos = await admin.put("/api/vehicles/no-existe/photos").send({ photos: [] });
    const status = await admin.patch("/api/vehicles/no-existe/status").send({ status: "PUBLICADO" });

    expect(update.status).toBe(404);
    expect(photos.status).toBe(404);
    expect(status.status).toBe(404);
  });
});
