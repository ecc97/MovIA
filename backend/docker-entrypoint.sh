#!/bin/sh
set -e

./node_modules/.bin/prisma db push --skip-generate

if [ "${SEED_IF_EMPTY:-false}" = "true" ]; then
  USER_COUNT=$(node --input-type=module -e 'import { PrismaClient } from "@prisma/client"; const prisma = new PrismaClient(); try { const count = await prisma.user.count(); process.stdout.write(String(count)); } finally { await prisma.$disconnect(); }')
  if [ "$USER_COUNT" = "0" ]; then
    echo "Base de datos vacía: cargando datos demo..."
    npm run prisma:seed
  fi
fi

exec "$@"
