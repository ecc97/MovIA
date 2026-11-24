import { expect, test } from "@playwright/test";
import { API_URL } from "../helpers/api";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  photos: Array<{ url: string; order: number }>;
}

test("el catálogo aplica filtros de la URL", async ({ page, request }) => {
  const response = await request.get(`${API_URL}/api/vehicles?bodyType=SUV&condition=USADO&limit=12`);
  const expected = (await response.json()).data[0] as Vehicle;

  expect(expected).toBeTruthy();
  await page.goto("/catalogo?bodyType=SUV&condition=USADO");
  await expect(
    page.getByRole("heading", { name: `${expected.make} ${expected.model}`, exact: true })
  ).toBeVisible();
});

test("la paginación del catálogo se refleja en la URL", async ({ page }) => {
  await page.goto("/catalogo");

  const pagination = page.getByRole("navigation", { name: "Paginación" });
  await expect(pagination).toBeVisible();
  await pagination.getByRole("button", { name: "Siguiente" }).click();
  await expect(page).toHaveURL(/page=2/);
});

test("el detalle muestra la galería y permite cambiar de foto", async ({ page, request }) => {
  const response = await request.get(`${API_URL}/api/vehicles?limit=100`);
  const vehicles = (await response.json()).data as Vehicle[];
  const vehicle = vehicles.find((item) => item.photos.length >= 2);

  expect(vehicle).toBeTruthy();
  const detail = vehicle as Vehicle;
  await page.goto(`/vehiculos/${detail.id}`);
  await expect(
    page.getByRole("heading", { level: 1, name: `${detail.make} ${detail.model}` })
  ).toBeVisible();

  const thumbnails = page.getByRole("button", { name: /^Ver fotografía \d+ de \d+$/ });
  await expect(thumbnails).toHaveCount(detail.photos.length);
  await thumbnails.nth(1).click();
  await expect(thumbnails.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("img", { name: new RegExp(`fotografía 2 de ${detail.photos.length}`) })
  ).toBeVisible();
});
