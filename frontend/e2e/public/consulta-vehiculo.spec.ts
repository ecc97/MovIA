import { expect, test } from "@playwright/test";
import { API_URL, uniqueLabel } from "../helpers/api";
import { users } from "../helpers/users";

interface Vehicle {
  id: string;
}

interface Inquiry {
  email: string;
  vehicleId: string | null;
}

test("envía una consulta asociada al vehículo desde su detalle", async ({ page, request }) => {
  const list = await request.get(`${API_URL}/api/vehicles?limit=1`);
  const vehicle = (await list.json()).data[0] as Vehicle;
  const email = `${uniqueLabel("e2e-vehiculo")}@ejemplo.com`;

  expect(vehicle).toBeTruthy();
  await page.goto(`/vehiculos/${vehicle.id}`);
  await page.locator("#name").fill("E2E Vehículo");
  await page.locator("#email").fill(email);
  await page.locator("#phone").fill("3001234567");
  await page.locator("#message").fill("Me interesa este vehículo, ¿sigue disponible?");
  await page.getByRole("button", { name: "Enviar consulta" }).click();

  await expect(page.getByText("Tu consulta ha sido enviada. Te contactaremos pronto.")).toBeVisible();

  await request.post(`${API_URL}/api/auth/login`, { data: users.advisor });
  const response = await request.get(`${API_URL}/api/inquiries?limit=100`);
  const inquiries = (await response.json()).items as Inquiry[];

  expect(inquiries.some((item) => item.email === email && item.vehicleId === vehicle.id)).toBe(true);
});
