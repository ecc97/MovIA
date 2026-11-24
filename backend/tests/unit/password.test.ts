import { hash } from "argon2";
import { describe, expect, it } from "vitest";
import { verifyPassword } from "../../src/services/password.service.js";

describe("verificación de contraseñas", () => {
  it("acepta la contraseña correcta contra un hash argon2", async () => {
    const passwordHash = await hash("demo123");

    await expect(verifyPassword("demo123", passwordHash)).resolves.toBe(true);
  });

  it("rechaza una contraseña distinta", async () => {
    const passwordHash = await hash("demo123");

    await expect(verifyPassword("wrong", passwordHash)).resolves.toBe(false);
  });
});
