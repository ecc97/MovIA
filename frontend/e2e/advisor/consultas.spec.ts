import { expect, test } from "@playwright/test";
import { API_URL, uniqueLabel } from "../helpers/api";
import { storageStates, users } from "../helpers/users";

test.use({ storageState: storageStates.advisor });

test("gestiona una consulta: filtra, cambia estado y añade nota", async ({ page, request }) => {
  const name = `E2E ${uniqueLabel("Gestion")}`;
  const email = `${uniqueLabel("e2e-gestion")}@ejemplo.com`;

  const created = await request.post(`${API_URL}/api/inquiries`, {
    data: {
      name,
      email,
      phone: "3001234567",
      message: "Consulta creada para la prueba E2E",
    },
  });
  expect(created.ok()).toBeTruthy();
  const inquiryId = (await created.json()).id as string;

  await page.goto("/panel/consultas");
  await page.getByRole("button", { name: "Nueva", exact: true }).click();

  const row = page.getByRole("row").filter({ hasText: email });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: `Ver consulta de ${name}` }).click();

  const modal = page.getByRole("dialog");
  await modal.locator("#inquiry-status").selectOption("EN_CONTACTO");
  await modal.locator("#inquiry-notes").fill("Nota añadida desde E2E");
  await modal.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByText("Consulta actualizada")).toBeVisible();

  await request.post(`${API_URL}/api/auth/login`, { data: users.advisor });
  const detailResponse = await request.get(`${API_URL}/api/inquiries/${inquiryId}`);
  const detail = await detailResponse.json();

  expect(detail.status).toBe("EN_CONTACTO");
  expect(detail.notes).toContain("Nota añadida desde E2E");
  expect(detail.notes).toContain("Carlos Ruiz");
});
