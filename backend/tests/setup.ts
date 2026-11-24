// MOVIA — Configuración global de Vitest.
// Falla rápido si la suite apunta a una BD que no sea de test.

import { config } from "dotenv";
import { afterAll } from "vitest";

process.env.NODE_ENV = "test";
config({ path: ".env.test" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Falta DATABASE_URL. Copia backend/.env.test.example a backend/.env.test");
}

const databaseName = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
if (!databaseName.endsWith("_test")) {
  throw new Error(`DATABASE_URL debe apuntar a una BD *_test (recibido: ${databaseName})`);
}

afterAll(async () => {
  const { default: prisma } = await import("../src/config/database.js");
  await prisma.$disconnect();
});
