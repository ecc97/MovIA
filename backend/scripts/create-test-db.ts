// MOVIA — Crea la base de datos aislada para tests si no existe.
// Usa la BD de mantenimiento "postgres" porque no hay psql/createdb en el entorno local.

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const sourceUrl = process.env.DATABASE_URL;
if (!sourceUrl) {
  throw new Error("Falta DATABASE_URL en .env para crear la BD de test");
}
if (process.env.NODE_ENV === "production") {
  throw new Error("test:db:init está prohibido en producción");
}

const databaseName = process.env.MOVIA_TEST_DB ?? "movia_test";
if (!/^[a-z0-9_]+_test$/i.test(databaseName)) {
  throw new Error(`Nombre de BD de test inválido: ${databaseName}`);
}

const adminUrl = new URL(sourceUrl);
adminUrl.pathname = "/postgres";
adminUrl.searchParams.delete("schema");

const admin = new PrismaClient({ datasourceUrl: adminUrl.toString() });

try {
  const existing = await admin.$queryRaw<Array<{ datname: string }>>`
    SELECT datname FROM pg_database WHERE datname = ${databaseName}
  `;

  if (existing.length > 0) {
    console.log(`BD de test ya existe: ${databaseName}`);
  } else {
    await admin.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);
    console.log(`BD de test creada: ${databaseName}`);
  }
} finally {
  await admin.$disconnect();
}
