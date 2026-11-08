// MOVIA — Configuración de Prisma (singleton)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
