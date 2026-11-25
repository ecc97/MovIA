# MOVIA API — Backend

API REST de MOVIA: Express con TypeScript, validación en servidor con Zod y persistencia en PostgreSQL mediante Prisma. Es la única capa con acceso a la base de datos y la fuente de verdad para autenticación, roles y reglas de negocio.

## Índice

- [Responsabilidades](#responsabilidades)
- [Stack](#stack)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Configuración local](#configuración-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [API REST](#api-rest)
- [Reglas de negocio](#reglas-de-negocio)
- [Modelo de datos](#modelo-de-datos)
- [Seed](#seed)
- [Tests](#tests)
- [Docker](#docker)
- [Troubleshooting](#troubleshooting)
- [Limitaciones y deuda técnica](#limitaciones-y-deuda-técnica)

## Responsabilidades

- Exponer el catálogo público de vehículos publicados.
- Gestionar el inventario completo con permisos de ADMIN.
- Recibir consultas públicas y permitir su gestión a ASESOR y ADMIN.
- Autenticar usuarios con JWT en cookie `httpOnly`.
- Autorizar operaciones por rol.
- Validar todas las entradas con Zod en el servidor.
- Publicar la especificación OpenAPI y Swagger UI.

## Stack

| Pieza | Versión / tecnología |
| --- | --- |
| Runtime | Node.js 22 |
| Servidor | Express 4 |
| Lenguaje | TypeScript estricto, ESM |
| Validación | Zod 3 |
| ORM | Prisma Client 5 |
| Base de datos | PostgreSQL 16 |
| Passwords | argon2 |
| Tests | Vitest + Supertest |
| Documentación de API | OpenAPI 3.0.3 + Swagger UI |

`package.json` declara `"type": "module"`. Los imports internos en `src/` usan extensión `.js`.

## Arquitectura

El código está organizado por módulos de negocio y separado por capas:

```text
routes → controllers → services → repositories → Prisma
```

- `routes`: declara paths, middlewares de autenticación y autorización. No contiene Prisma.
- `controllers`: adaptan HTTP; no contienen reglas de negocio.
- `services`: concentran las reglas de negocio; no conocen objetos HTTP.
- `repositories`: consultan Prisma; no deciden permisos.

Estructura principal:

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── scripts/
│   └── create-test-db.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── inquiries/
│   │   └── vehicles/
│   └── services/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── helpers/
│   └── setup.ts
├── .env.example
├── .env.test.example
├── Dockerfile
├── docker-entrypoint.sh
├── openapi.yaml
└── package.json
```

## Requisitos

- Node.js 22 y npm.
- PostgreSQL 16. Para desarrollo local se recomienda usar el servicio `db` de Compose:

```powershell
docker compose up -d db
```

## Configuración local

Desde `backend/`:

```powershell
npm install
Copy-Item .env.example .env
# Edita .env: DATABASE_URL con localhost y secretos reales para desarrollo
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

En Linux o macOS, usa `cp .env.example .env`.

La API queda en `http://localhost:4000`. El healthcheck está en `/api/health`.

`dotenv` no expande variables dentro de `DATABASE_URL`: escríbela con valores literales.

## Variables de entorno

| Variable | Ejemplo | Uso |
| --- | --- | --- |
| `DB_HOST` | `localhost` | Referencia de la base; Compose usa el host `db`. |
| `DB_PORT` | `5432` | Puerto local de PostgreSQL. |
| `DB_NAME` | `movia` | Nombre de la base. |
| `DB_USER` | `movia` | Usuario de la base. |
| `DB_PASSWORD` | `cambiar_en_produccion` | Password de la base. |
| `DATABASE_URL` | `postgresql://...localhost:5432/movia?schema=public` | Cadena de conexión de Prisma. |
| `PORT` | `4000` | Puerto de Express. |
| `NODE_ENV` | `development` | Entorno de ejecución. |
| `SESSION_SECRET` | valor secreto | Firma del JWT. |
| `SESSION_COOKIE_NAME` | `movia_session` | Nombre de la cookie. |
| `SESSION_MAX_AGE_MS` | `86400000` | Duración de la sesión en milisegundos. |
| `SESSION_COOKIE_SECURE` | `false` | `true` solo bajo HTTPS. |
| `CORS_ORIGIN` | `http://localhost:3000` | Orígenes permitidos separados por comas. |

Si `CORS_ORIGIN` está vacía, `cors` mantiene `origin: true`. Si está definida, solo se permiten esos orígenes y se habilitan credenciales.

`SEED_IF_EMPTY=true` se usa dentro del contenedor `api` para cargar el seed solo cuando la tabla `User` está vacía.

## Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Servidor con `tsx watch`. |
| `npm run build` | Compilación a `dist/` con `tsconfig.build.json`. |
| `npm run start` | Ejecuta `dist/server.js`. |
| `npm run prisma:generate` | Genera Prisma Client. |
| `npm run prisma:seed` | Carga o resetea los datos demo. |
| `npm run test` | Suite completa de Vitest. |
| `npm run test:unit` | Solo tests unitarios. |
| `npm run test:integration` | Solo tests de integración. |
| `npm run test:setup` | Crea y siembra `movia_test`. |
| `npm run test:server` | Servidor de tests usado por Playwright. |
| `npm run typecheck` | Verificación de tipos de `src/`. |
| `npm run typecheck:test` | Verificación de tipos de tests. |
| `npm run format` | Prettier sobre `src/`. |
| `npm run lint` | ESLint sobre `src/`. Estado actual: ver [Troubleshooting](#troubleshooting). |
| `npm run db:reset` | Script heredado; no es el flujo recomendado porque hoy no hay migraciones. |
| `npm run prisma:migrate` / `npm run prisma:migrate:deploy` | Scripts heredados; requieren migraciones, actualmente ausentes. |

El flujo real de esquema es `prisma db push`, no migraciones.

## API REST

Base URL local: `http://localhost:4000`.

Swagger UI: `http://localhost:4000/api/docs`. La especificación se sirve desde la propia API. Toda modificación de endpoints debe reflejarse en `openapi.yaml`.

La API aplica `helmet`, CORS con credenciales, `cookie-parser` y un rate limit global de 100 peticiones por 15 minutos. El rate limit se desactiva con `NODE_ENV=test`.

### Autenticación

- `POST /api/auth/login` devuelve la sesión en la cookie `httpOnly` `movia_session`.
- `GET /api/auth/me` y `POST /api/auth/logout` requieren sesión activa.
- El middleware `authenticate` verifica el JWT, comprueba que el usuario exista y esté activo, y expone `req.authUser`.
- Nunca se guardan tokens en `localStorage`.

### Endpoints

| Método | Path | Acceso | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Público | Healthcheck. |
| `GET` | `/api/vehicles` | Público | Lista vehículos `PUBLICADO` con filtros y paginación. |
| `POST` | `/api/vehicles` | ADMIN | Crea vehículo; acepta `photos` opcionales. |
| `GET` | `/api/vehicles/meta` | Público | Facetas `{ years, makes }`. |
| `GET` | `/api/vehicles/inventory` | ADMIN | Lista todos los estados con filtro y paginación. |
| `GET` | `/api/vehicles/:id` | Público | Detalle de vehículo. |
| `PATCH` | `/api/vehicles/:id` | ADMIN | Edición parcial; no cambia estado ni fotos. |
| `PATCH` | `/api/vehicles/:id/status` | ADMIN | Cambia `status`. |
| `PUT` | `/api/vehicles/:id/photos` | ADMIN | Reemplaza todas las fotos. |
| `POST` | `/api/inquiries` | Público | Crea consulta general o asociada a vehículo. |
| `GET` | `/api/inquiries` | ASESOR / ADMIN | Lista consultas con filtro y paginación. |
| `GET` | `/api/inquiries/:id` | ASESOR / ADMIN | Detalle de consulta. |
| `PATCH` | `/api/inquiries/:id/status` | ASESOR / ADMIN | Cambia estado. |
| `PATCH` | `/api/inquiries/:id/notes` | ASESOR / ADMIN | Añade notas con timestamp y autor. |
| `POST` | `/api/auth/login` | Público | Inicia sesión. |
| `GET` | `/api/auth/me` | Autenticado | Usuario actual. |
| `POST` | `/api/auth/logout` | Autenticado | Cierra sesión. |

No existe `DELETE /api/vehicles` ni un `PATCH /api/inquiries/:id` genérico.

### Filtros de vehículos

`GET /api/vehicles` acepta:

- `bodyType`: `AUTO | SUV | CAMIONETA`.
- `condition`: `NUEVO | USADO`.
- `make`: coincidencia parcial insensible a mayúsculas.
- `minPrice`, `maxPrice`: enteros en COP.
- `yearMin`, `yearMax`.
- `mileageMin`, `mileageMax`.
- `sortBy`: `createdAt_desc | price_asc | price_desc | year_desc`.
- `page`, `limit`.

Los parámetros desconocidos se descartan por Zod. La respuesta usa `{ data, pagination }`.

`GET /api/vehicles/inventory` acepta `status`, `page` y `limit` con el mismo envelope. `GET /api/inquiries` acepta `status`, `page` y `limit` con `{ items, total, page, limit }`.

### Formatos y errores

- Los precios son enteros en COP, sin decimales.
- Los errores de validación usan `{ error, details }`.
- Hoy conviven `validacion_error` en vehículos y `validation_error` en consultas.
- No hay un error handler global JSON: los errores no controlados pueden devolver el HTML 500 de Express.
- El campo `reason` aceptado en `PATCH /api/vehicles/:id/status` no se utiliza.

## Reglas de negocio

- Los vehículos no se borran físicamente: cambian entre `BORRADOR`, `PUBLICADO` y `ARCHIVADO`.
- El catálogo público solo muestra `PUBLICADO`.
- `POST /api/vehicles` crea por defecto en `PUBLICADO`; el frontend también permite guardar como `BORRADOR`.
- Las fotos se crean anidadas al crear el vehículo; máximo 6 y el menor `order` es la principal.
- Una consulta puede estar asociada a un vehículo o ser general.
- Se permite saltar entre estados de consulta.
- ADMIN y ASESOR pueden cambiar estados; solo ADMIN puede reabrir una consulta cerrada.
- Cada consulta conserva `updatedAt` y `notes`.
- ADMIN y ASESOR ven todas las consultas; la asignación por asesor queda fuera del MVP.

Matriz resumida:

| Operación | Visitante | ASESOR | ADMIN |
| --- | --- | --- | --- |
| Ver catálogo y crear consulta | Sí | Sí | Sí |
| Ver y cambiar estado de consultas | No | Sí | Sí |
| Reabrir consulta cerrada | No | No | Sí |
| Inventario | No | No | Sí |

## Modelo de datos

| Entidad | Descripción |
| --- | --- |
| `User` | Usuario con `email` único, `role` e `isActive`. |
| `Vehicle` | Vehículo con `status`, `condition`, `bodyType`, precio y datos comerciales. |
| `Photo` | Foto asociada a un vehículo. |
| `Inquiry` | Consulta con estado, notas y relaciones opcionales. |

Enums:

- `Role`: `ADMIN | ASESOR`.
- `VehicleStatus`: `BORRADOR | PUBLICADO | ARCHIVADO`.
- `InquiryStatus`: `NUEVA | EN_CONTACTO | EN_SEGUIMIENTO | VENDIDA | DESCARTADA`.
- `condition`: `NUEVO | USADO`.
- `bodyType`: `AUTO | SUV | CAMIONETA`.

Cardinalidades:

- `Vehicle 1 — N Photo`: `vehicle_id` obligatorio.
- `Vehicle 0..1 — N Inquiry`: `vehicle_id` opcional.
- `User 0..1 — N Inquiry`: `assignedToId` opcional.

## Seed

El seed carga datos simulados:

- 3 usuarios: 1 ADMIN y 2 ASESOR.
- 44 vehículos: 16 AUTO, 22 SUV y 6 CAMIONETA.
- 3 fotos por vehículo.
- 15 consultas con estados variados.

Credenciales:

| Rol | Email | Password |
| --- | --- | --- |
| ADMIN | `maria@movia.demo` | `demo123` |
| ASESOR | `carlos@movia.demo` | `demo123` |
| ASESOR | `ana@movia.demo` | `demo123` |

El seed es re-ejecutable y destructivo: elimina fotos, consultas y vehículos. Los usuarios se actualizan con `upsert`. También elimina vehículos creados manualmente desde el panel.

## Tests

Se usan Vitest y Supertest. La suite cubre reglas de negocio, validación, autenticación, roles y endpoints.

Configuración inicial:

```powershell
Copy-Item .env.test.example .env.test
npm run test:setup
npm test
```

La base de tests es `movia_test`. El guard `_test` evita apuntar accidentalmente a la base principal. Los tests usan un esquema con `prisma db push --force-reset` y luego seed.

`tests/setup.ts` prepara la base antes de cada archivo. `fileParallelism` está desactivado. El rate limit se omite con `NODE_ENV=test`.

Comandos útiles:

```powershell
npm run test:unit
npm run test:integration
npm run typecheck:test
npm run test:server
```

El job de backend en CI levanta PostgreSQL y ejecuta la suite contra `movia_test`.

## Docker

La imagen:

- Usa `node:22-bookworm-slim` en etapas `deps`, `build` y `runtime`.
- Instala `openssl` y `ca-certificates`, necesarios para Prisma.
- Usa `npm install --no-audit --no-fund`, no `npm ci`, por un conflicto del lockfile con dependencias opcionales.
- Conserva las dependencias de desarrollo en runtime para poder ejecutar Prisma y el seed.
- Compila con `tsconfig.build.json` y ejecuta `dist/server.js`.
- Incluye `openapi.yaml` para Swagger UI.

El entrypoint:

1. Ejecuta `prisma db push --skip-generate`.
2. Si `SEED_IF_EMPTY=true`, cuenta usuarios.
3. Si no hay usuarios, ejecuta `npm run prisma:seed`.
4. Lanza el comando principal.

En Compose, el servicio `api` usa el host `db` en `DATABASE_URL` y expone el puerto `4000`. El healthcheck consulta `/api/health`.

## Troubleshooting

- **`npm ci` falla por dependencias opcionales.** Usa `npm install --no-audit --no-fund`. Docker y CI ya lo hacen.
- **`npm run lint` falla.** Falta una configuración flat de ESLint en el backend. `typecheck`, `build` y tests funcionan.
- **`db:reset` o `prisma:migrate` fallan.** No hay migraciones. Usa `prisma db push`; para un reset manual y destructivo, `prisma db push --force-reset` seguido de seed.
- **Swagger UI sin estilos.** La ruta `/api/docs` se monta antes de `helmet` y del rate limit; no la muevas después.
- **`ECONNREFUSED` local.** Comprueba que PostgreSQL esté arriba y que `DATABASE_URL` use `localhost` fuera de Docker, o `db` dentro de Compose.
- **CORS o cookie rechazada.** Revisa `CORS_ORIGIN` y `SESSION_COOKIE_SECURE`. Bajo HTTP local debe ser `false`; bajo HTTPS, `true`.
- **404 al importar módulos compilados.** Los imports de `src/` deben terminar en `.js` porque el proyecto es ESM.

## Limitaciones y deuda técnica

- Zod 3 tiene un CVE alto known; migrar a Zod 4 es un cambio rompiente pendiente.
- No hay error handler global JSON.
- Los envelopes de respuesta no son uniformes entre vehículos y consultas.
- Los códigos de error de validación no son uniformes.
- `POST /api/auth/login` no usa Zod.
- `reason` en el cambio de estado de vehículo se acepta pero se ignora.
- No hay migraciones de Prisma.
- No hay subida real de archivos: las fotos son URLs.
- La expiración y renovación de sesión no están implementadas.
- La configuración de CORS para producción debe revisarse antes de desplegar.

## Enlaces

- [README raíz](../README.md)
- [README del frontend](../frontend/README.md)
- Swagger UI: `http://localhost:4000/api/docs`
