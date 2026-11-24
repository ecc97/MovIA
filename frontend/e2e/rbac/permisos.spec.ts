import { expect, test } from "@playwright/test";
import { storageStates } from "../helpers/users";

test.describe("visitante", () => {
  test("no puede entrar al panel", async ({ page }) => {
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe("asesor", () => {
  test.use({ storageState: storageStates.advisor });

  test("ve el panel pero no el inventario", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByRole("link", { name: "Consultas", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Inventario", exact: true })).toHaveCount(0);

    await page.goto("/panel/inventario");
    await expect(page).toHaveURL(/\/panel$/);
  });
});

test.describe("admin", () => {
  test.use({ storageState: storageStates.admin });

  test("ve y puede abrir el inventario", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByRole("link", { name: "Inventario", exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Inventario", exact: true }).click();
    await expect(page).toHaveURL(/\/panel\/inventario$/);
    await expect(page.getByRole("heading", { name: "Inventario", level: 1 })).toBeVisible();
  });
});
