import { expect, test } from "@playwright/test";
import { API_URL, uniqueLabel } from "../helpers/api";
import { users } from "../helpers/users";

interface Inquiry {
  email: string;
  vehicleId: string | null;
  message: string;
}

test("envía una consulta general desde /contacto", async ({ page, request }) => {
  const email = `${uniqueLabel("e2e-general")}@ejemplo.com`;
  await page.goto("/contacto");

  await page.locator("#name").fill("E2E General");
  await page.locator("#email").fill(email);
  await page.locator("#phone").fill("3001234567");
  await page.locator("#message").fill("Consulta general de prueba E2E");
  await page.getByRole("button", { name: "Enviar consulta" }).click();

  await expect(page.getByText("Tu consulta ha sido enviada. Te contactaremos pronto.")).toBeVisible();

  await request.post(`${API_URL}/api/auth/login`, { data: users.advisor });
  const response = await request.get(`${API_URL}/api/inquiries?limit=100`);
  const inquiries = (await response.json()).items as Inquiry[];

  expect(inquiries.some((item) => item.email === email && item.vehicleId === null)).toBe(true);
});
