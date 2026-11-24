import { expect, test } from "@playwright/test";
import { API_URL, uniqueLabel } from "../helpers/api";
import { storageStates } from "../helpers/users";

test.use({ storageState: storageStates.admin });

test("crea un vehículo con foto, lo edita y lo archiva", async ({ page, request }) => {
  const make = uniqueLabel("E2EInventario");
  const model = uniqueLabel("ModeloE2E");
  const photo = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?w=800";

  await page.goto("/panel/inventario");
  await page.getByRole("button", { name: "Crear vehículo" }).first().click();

  const createModal = page.getByRole("dialog");
  await createModal.locator("#vehicle-make").fill(make);
  await createModal.locator("#vehicle-model").fill(model);
  await createModal.locator("#vehicle-year").fill("2021");
  await createModal.locator("#vehicle-price").fill("75000000");
  await createModal.locator("#vehicle-mileage").fill("12000");
  await createModal.locator("#vehicle-condition").selectOption("USADO");
  await createModal.locator("#vehicle-body").selectOption("SUV");
  await createModal.locator("#vehicle-fuel").fill("Gasolina");
  await createModal.locator("#vehicle-transmission").fill("Automática");
  await createModal.locator("#vehicle-color").fill("Azul");
  await createModal.getByRole("button", { name: /Fotos \(opcional\)/ }).click();
  await createModal.locator("#photo-0").fill(photo);
  await createModal.getByRole("button", { name: "Crear vehículo" }).click();

  await expect(page.getByText("Vehículo creado")).toBeVisible();

  const createdResponse = await request.get(`${API_URL}/api/vehicles?make=${encodeURIComponent(make)}`);
  const created = (await createdResponse.json()).data[0] as { id: string; photos: unknown[] };
  expect(created).toBeTruthy();
  expect(created.photos).toHaveLength(1);

  const row = page.getByRole("row").filter({ hasText: make });
  await row.getByRole("button", { name: `Editar ${make} ${model}` }).click();

  const editModal = page.getByRole("dialog");
  await editModal.locator("#vehicle-price").fill("99000000");
  await editModal.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Cambios guardados")).toBeVisible();

  await page.getByRole("button", { name: `Archivar ${make} ${model}` }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Archivar" }).click();
  await expect(page.getByText("Vehículo archivado")).toBeVisible();

  const afterResponse = await request.get(`${API_URL}/api/vehicles?make=${encodeURIComponent(make)}`);
  expect((await afterResponse.json()).data).toHaveLength(0);
});
