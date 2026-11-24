import { expect, test } from "@playwright/test";
import { API_URL, createClosedInquiry } from "../helpers/api";
import { storageStates } from "../helpers/users";

test.use({ storageState: storageStates.admin });

test("admin reabre una consulta cerrada y guarda las notas", async ({
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
  ).toBeVisible();
  await modal
    .locator("#inquiry-notes")
    .fill("Nota guardada al reabrir desde E2E");
  await modal.getByRole("button", { name: "Reabrir consulta" }).click();

  const confirmDialog = page
    .getByRole("dialog")
    .filter({ hasText: "¿Reabrir esta consulta?" });
  await confirmDialog
    .getByRole("button", { name: "Reabrir", exact: true })
    .click();

  await expect(page.getByText("Consulta reabierta")).toBeVisible();

  const detailResponse = await request.get(`${API_URL}/api/inquiries/${id}`);
  const detail = await detailResponse.json();
  expect(detail.status).toBe("NUEVA");
  expect(detail.notes).toContain("Nota guardada al reabrir desde E2E");
});
