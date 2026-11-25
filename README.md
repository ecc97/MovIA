# MOVIA — Concesionario Web MVP

Proyecto de demostración de un concesionario web: catálogo público, consultas sin registro y panel para ADMIN/ASESOR. Los vehículos, precios, fotos y consultas son **datos simulados**.

## Requisitos

- Docker Engine 24+ o Docker Desktop con Docker Compose v2.
- Puertos libres: `3000` (web), `4000` (API) y el definido en `DB_PORT` (PostgreSQL).

## Arranque con Docker

```powershell
Copy-Item .env.example .env
# Edita .env: secretos y NEXT_PUBLIC_WHATSAPP_NUMBER
docker compose up --build -d
```

Al levantar:

1. `db` arranca y pasa el healthcheck.
2. `api` aplica el esquema con `prisma db push`.
3. Si la tabla `User` está vacía, `api` carga el seed demo antes de escuchar.
4. `web` espera a que `api` esté sano y sirve el frontend.

| Servicio | URL | Contenedor |
| --- | --- | --- |
| Web | http://localhost:3000 | `movia-web` |
| API | http://localhost:4000/api/health | `movia-api` |
| Swagger UI | http://localhost:4000/api/docs | `movia-api` |
| Spec OpenAPI | http://localhost:4000/api/docs/openapi.yaml | `movia-api` |
| PostgreSQL | `localhost:${DB_PORT}` | `movia-db` |

### Credenciales del seed

- ADMIN: `maria@movia.demo` / `demo123`
- ASESOR: `carlos@movia.demo` / `demo123`
- ASESOR: `ana@movia.demo` / `demo123`

## Comandos útiles

```powershell
docker compose ps
docker compose logs -f api web
docker compose restart api web
docker compose down
docker compose down -v
```

El volumen `movia-pgdata` conserva los datos. `down -v` borra el volumen; el siguiente `up` vuelve a aplicar el esquema y hacer el seed automático.

Para forzar un reset de los datos demo sin borrar el volumen:

```powershell
docker compose --profile seed run --rm seed
```

El seed es destructivo: borra vehículos, fotos y consultas. Solo se ejecuta automáticamente cuando no hay usuarios.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores.

| Variable | Uso |
| --- | --- |
| `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Compose y PostgreSQL. |
| `DATABASE_URL` | Backend fuera de Docker; Compose usa el host `db`. |
| `SESSION_SECRET` | Firma del JWT. |
| `SESSION_COOKIE_NAME`, `SESSION_MAX_AGE_MS` | Cookie `httpOnly`. |
| `SESSION_COOKIE_SECURE` | `false` para HTTP local; `true` en producción con HTTPS. |
| `CORS_ORIGIN` | Orígenes permitidos, separados por comas. |
| `NEXT_PUBLIC_API_URL` | URL de la API para el navegador, normalmente `http://localhost:4000`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número usado en los enlaces de WhatsApp. |
| `INTERNAL_API_URL` | URL de la API para renderizado en servidor; Compose la fija en `http://api:4000`. |
| `SEED_IF_EMPTY` | Control interno del entrypoint de la API; no hace falta editarlo. |

`NEXT_PUBLIC_*` se inlinea durante `docker compose build`: si cambias esas variables, reconstruye la imagen `web`.

## Desarrollo sin Docker

Los comandos locales siguen disponibles:

```powershell
cd backend
npm install
npm run dev
npm test
```

```powershell
cd frontend
npm install
npm run dev
npm run typecheck
npm run lint
npm run test:e2e
```

Antes de E2E, siembra la base aislada:

```powershell
npm --prefix backend run test:setup
```

## Arquitectura en Docker

- `db`: `postgres:16-alpine` con volumen persistente y healthcheck `pg_isready`.
- `api`: Express + TypeScript en `node:22-bookworm-slim`. El entrypoint aplica `prisma db push`, hace seed si la BD está vacía y luego ejecuta el servidor.
- `web`: Next.js 16 con output `standalone`. El navegador llama a `NEXT_PUBLIC_API_URL`; el renderizado en servidor usa `INTERNAL_API_URL` para llegar a `api:4000`.
- `seed`: perfil opcional para reset manual; no arranca con `up`.

No hay migraciones de Prisma: el esquema se sincroniza con `db push`. Para producción se recomienda añadir migraciones antes del despliegue.

## Seguridad

- La autoridad real está en el backend: `authenticate`, `requireAdmin` y `requireAdvisorOrAdmin`.
- El JWT viaja en cookie `httpOnly`, nunca en `localStorage`.
- CORS queda restringido a `CORS_ORIGIN` cuando la variable está definida.
- HTTP local usa `SESSION_COOKIE_SECURE=false`. En producción: HTTPS, `SESSION_COOKIE_SECURE=true` y orígenes CORS explícitos.
