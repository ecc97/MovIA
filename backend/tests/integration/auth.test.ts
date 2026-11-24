import { hash } from "argon2";
import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/config/database.js";
import { loginAs } from "../helpers/auth.js";
import { uniqueLabel } from "../helpers/data.js";

const inactiveEmail = `${uniqueLabel("inactivo")}@ejemplo.com`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: inactiveEmail } });
});

describe("autenticación", () => {
  it("loguea con credenciales del seed y devuelve cookie httpOnly", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "maria@movia.demo", password: "demo123" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ email: "maria@movia.demo", role: "ADMIN" });
    const cookies = response.headers["set-cookie"] as string[] | undefined;
    expect(cookies?.[0]).toContain("movia_session=");
    expect(cookies?.[0]).toContain("HttpOnly");
    expect(cookies?.[0]).not.toContain("Secure");
  });

  it("devuelve el usuario actual con /me y permite cerrar sesión", async () => {
    const agent = await loginAs("carlos@movia.demo");

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.data.role).toBe("ASESOR");

    const logout = await agent.post("/api/auth/logout");
    expect(logout.status).toBe(200);
    expect((await agent.get("/api/auth/me")).status).toBe(401);
  });

  it("rechaza credenciales inválidas", async () => {
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: "maria@movia.demo", password: "incorrecta" });
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@ejemplo.com", password: "demo123" });

    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body.error).toBe("credenciales_invalidas");
    expect(unknownEmail.status).toBe(401);
  });

  it("exige email y password", async () => {
    const response = await request(app).post("/api/auth/login").send({ email: "maria@movia.demo" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("email_y_password_obligatorios");
  });

  it("rechaza usuarios inactivos con 403", async () => {
    await prisma.user.create({
      data: {
        name: "Inactivo",
        email: inactiveEmail,
        passwordHash: await hash("demo123"),
        role: "ASESOR",
        isActive: false,
      },
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: inactiveEmail, password: "demo123" });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("usuario_inactivo");
  });

  it("devuelve 401 en /me sin sesión", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("no_autenticado");
  });
});
