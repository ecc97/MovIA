import { expect, test } from "@playwright/test";
import { users } from "../helpers/users";

test("loguea, cierra sesión y el panel queda protegido", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#email").fill(users.admin.email);
  await page.locator("#password").fill(users.admin.password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/panel$/);

  await page.getByRole("button", { name: "Cerrar sesión" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Cerrar sesión" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/panel");
  await expect(page).toHaveURL(/\/login$/);
});

test("muestra un error con credenciales incorrectas", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#email").fill(users.admin.email);
  await page.locator("#password").fill("contraseña-incorrecta");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("credenciales_invalidas")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
