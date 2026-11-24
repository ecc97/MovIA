import { expect, test } from "@playwright/test";
import { API_URL, createClosedInquiry, uniqueLabel } from "../helpers/api";
import { storageStates, users } from "../helpers/users";

test.use({ storageState: storageStates.advisor });

test("gestiona una consulta: filtra, cambia estado y añade nota", async ({
  page,
  request,
}) => {
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
  const detailResponse = await request.get(
    `${API_URL}/api/inquiries/${inquiryId}`,
  );
  const detail = await detailResponse.json();

  expect(detail.status).toBe("EN_CONTACTO");
  expect(detail.notes).toContain("Nota añadida desde E2E");
  expect(detail.notes).toContain("Carlos Ruiz");
});

test("asesor no puede reabrir una consulta cerrada", async ({
  page,
  request,
}) => {
  const { id, name, email } = await createClosedInquiry(request, "VENDIDA");

  await page.goto("/panel/consultas");
  await page.getByRole("button", { name: "Vendida", exact: true }).click();

  const row = page.getByRole("row").filter({ hasText: email });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: `Ver consulta de ${name}` }).click();

  const modal = page.getByRole("dialog");
  await expect(
    modal.getByRole("button", { name: "Reabrir consulta" }),
  ).toHaveCount(0);
  await expect(
    modal.locator('#inquiry-status option[value="NUEVA"]'),
  ).toBeDisabled();
  await expect(
    modal.locator('#inquiry-status option[value="EN_CONTACTO"]'),
  ).toBeDisabled();
  await expect(
    modal.locator('#inquiry-status option[value="EN_SEGUIMIENTO"]'),
  ).toBeDisabled();
  await expect(
    modal.locator('#inquiry-status option[value="DESCARTADA"]'),
  ).toBeEnabled();

  await modal.locator("#inquiry-status").selectOption("DESCARTADA");
  await modal.getByRole("button", { name: "Guardar cambios" }).click();

  const confirmDialog = page
    .getByRole("dialog")
    .filter({ hasText: "¿Marcar la consulta como Descartada?" });
  await confirmDialog
    .getByRole("button", { name: "Marcar como Descartada" })
    .click();

  await expect(page.getByText("Consulta actualizada")).toBeVisible();

  const detailResponse = await request.get(`${API_URL}/api/inquiries/${id}`);
  expect((await detailResponse.json()).status).toBe("DESCARTADA");
});
