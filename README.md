# MOVIA — Concesionario Web MVP

MOVIA es un proyecto de demostración de un concesionario web: catálogo público de vehículos, consultas sin registro y un panel para ADMIN y ASESOR. Los vehículos, precios, fotos y consultas son **datos simulados**.

## Índice

- [Qué incluye](#qué-incluye)
- [Stack](#stack)
- [Arquitectura](#arquitectura)
- [Inicio rápido con Docker](#inicio-rápido-con-docker)
- [Mapa de documentación](#mapa-de-documentación)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Variables de entorno](#variables-de-entorno)
- [Desarrollo local](#desarrollo-local)
- [Tests y calidad](#tests-y-calidad)
- [Seguridad](#seguridad)
- [Limitaciones](#limitaciones)

## Qué incluye

- Catálogo público con filtros en la URL, ordenamiento y paginación.
- Detalle de vehículo con galería, WhatsApp y formulario de consulta.
- Consulta general sin seleccionar vehículo.
- Autenticación con JWT en cookie `httpOnly`.
- Panel de consultas para ADMIN y ASESOR, con cambio de estado y notas.
- Panel de inventario solo para ADMIN: crear, editar, publicar, archivar y gestionar fotos.
- Tema claro/oscuro y diseño responsive.
- Arranque completo con Docker Compose, incluyendo carga automática de datos demo.

## Stack

| Capa | Tecnología | Paquete |
| --- | --- | --- |
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS 4, TanStack Query 5 | `frontend/` |
| API | Express 4, TypeScript, Zod 3, Prisma 5 | `backend/` |
| Base de datos | PostgreSQL 16 | `db` en Compose |

## Arquitectura

```text
Navegador
   │
   ▼
web (Next.js) ──── peticiones del navegador ────► api (Express) ────► db (PostgreSQL)
   │
   └── renderizado en servidor ──── INTERNAL_API_URL ────► api:4000
```

El frontend nunca habla con PostgreSQL. Solo consume la API REST. La autoridad real está en el backend; los guards del frontend son solo experiencia de usuario.

## Inicio rápido con Docker

### Requisitos

- Docker Engine 24+ o Docker Desktop con Docker Compose v2.
- Puertos libres `3000`, `4000` y el valor configurado en `DB_PORT`.

### Arranque

```powershell
Copy-Item .env.example .env
# Edita .env: secretos y NEXT_PUBLIC_WHATSAPP_NUMBER
docker compose up --build -d
```

En Linux o macOS:

```bash
cp .env.example .env
docker compose up --build -d
```

Al iniciar:

1. `db` arranca y supera el healthcheck con `pg_isready`.
2. `api` aplica el esquema con `prisma db push`.
3. Si la tabla `User` está vacía, `api` carga el seed demo antes de escuchar.
4. `web` espera a que `api` esté sano y sirve la aplicación.

| Servicio | URL | Contenedor |
| --- | --- | --- |
| Web | http://localhost:3000 | `movia-web` |
| API | http://localhost:4000/api/health | `movia-api` |
| Swagger UI | http://localhost:4000/api/docs | `movia-api` |
| PostgreSQL | `localhost:${DB_PORT}` | `movia-db` |

### Credenciales del seed

| Rol | Email | Password |
| --- | --- | --- |
| ADMIN | `maria@movia.demo` | `demo123` |
| ASESOR | `carlos@movia.demo` | `demo123` |
| ASESOR | `ana@movia.demo` | `demo123` |

### Comandos útiles

| Comando | Uso |
| --- | --- |
| `docker compose ps` | Estado de los servicios. |
| `docker compose logs -f api web` | Logs de API y web. |
| `docker compose restart api web` | Reinicio de API y web. |
| `docker compose down` | Detiene los servicios y conserva el volumen. |
| `docker compose down -v` | Detiene y borra el volumen `movia-pgdata`. |
| `docker compose --profile seed run --rm seed` | Fuerza un reset manual de los datos demo. |

El seed manual es destructivo: elimina vehículos, fotos y consultas. El seed automático solo se ejecuta cuando la base no tiene usuarios.

## Mapa de documentación

| Documento | Contenido |
| --- | --- |
| `README.md` | Vista general, arranque con Docker y acceso al proyecto. |
| `backend/README.md` | Configuración de la API, Prisma, endpoints, reglas de negocio y tests. |
| `frontend/README.md` | Configuración de Next.js, rutas, arquitectura frontend y tests E2E. |
| Swagger UI en `/api/docs` | Referencia interactiva de la API REST. |

## Estructura del repositorio

```text
MovIA/
├── backend/             API Express + TypeScript + Prisma
├── frontend/            Web Next.js + TypeScript + Tailwind
├── docker-compose.yml   Servicios db, api, web y perfil seed
├── .env.example         Variables para Compose
└── README.md            Este archivo
```

Cada paquete tiene su propio README con comandos y variables específicas.

## Variables de entorno

Hay tres archivos de entorno con responsabilidades distintas:

| Archivo | Uso |
| --- | --- |
| `.env` en la raíz | Interpolación de `docker-compose.yml` y build args de `web`. |
| `backend/.env` | Backend ejecutado fuera de Docker. |
| `frontend/.env` | Next.js ejecutado fuera de Docker. |

Ninguno de estos archivos con valores reales debe versionarse.

### Variables de Compose

| Variable | Uso |
| --- | --- |
| `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL y exposición local del puerto. |
| `DATABASE_URL` | Referencia local; Compose usa el host `db`. |
| `SESSION_SECRET` | Firma del JWT. |
| `SESSION_COOKIE_NAME`, `SESSION_MAX_AGE_MS` | Cookie `httpOnly`. |
| `SESSION_COOKIE_SECURE` | `false` para HTTP local; `true` en producción con HTTPS. |
| `CORS_ORIGIN` | Orígenes permitidos separados por comas. |
| `NEXT_PUBLIC_API_URL` | URL de la API para el navegador. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número usado en los enlaces de WhatsApp. |

Las variables `NEXT_PUBLIC_*` se fijan durante el build de `web`. Si cambias una de ellas, reconstruye la imagen:

```powershell
docker compose up --build -d web
```

Compose fija `INTERNAL_API_URL=http://api:4000` para el renderizado en servidor.

## Desarrollo local

Sin Docker, consulta los READMEs de cada paquete:

- [Backend](backend/README.md): PostgreSQL, Prisma, seed, API y tests unitarios/integración.
- [Frontend](frontend/README.md): Next.js, variables públicas, E2E con Playwright y build standalone.

Resumen:

```powershell
cd backend
npm install
npm run dev
```

```powershell
cd frontend
npm install
npm run dev
```

Para ejecutar E2E, siembra primero la base aislada:

```powershell
npm --prefix backend run test:setup
```

## Tests y calidad

| Paquete | Herramienta | Cobertura principal |
| --- | --- | --- |
| Backend | Vitest + Supertest | Reglas de negocio, validación, roles y endpoints. |
| Frontend | Playwright | Flujos públicos, login, panel ADMIN y permisos ASESOR. |
| CI | GitHub Actions | Typecheck, lint disponible, build, tests y build Docker. |

Los tests del backend usan una base `movia_test`. Los E2E arrancan API y web en los puertos `4000` y `3000`; conviene detener Docker antes de ejecutarlos.

## Seguridad

- El JWT viaja en la cookie `httpOnly` `movia_session`, nunca en `localStorage`.
- La autoridad real vive en la API: `authenticate`, `requireAdmin` y `requireAdvisorOrAdmin`.
- `CORS_ORIGIN` restringe los orígenes cuando está definida y mantiene `credentials: true`.
- HTTP local usa `SESSION_COOKIE_SECURE=false`. En producción: HTTPS, `SESSION_COOKIE_SECURE=true` y orígenes CORS explícitos.
- No existen endpoints para borrar vehículos físicamente; solo cambian de estado.

## Limitaciones

- No hay migraciones de Prisma: el esquema se sincroniza con `prisma db push`.
- La subida real de archivos a storage no está implementada; el alta y edición de fotos usan URLs.
- El clic en WhatsApp no se registra como consulta.
- La expiración y renovación de sesión quedan fuera del MVP.
- No se exponen filtros de combustible ni transmisión en el catálogo público.
- La configuración de CORS y secretos para producción debe revisarse antes de desplegar.

Para detalles y soluciones específicas, consulta [backend/README.md](backend/README.md) y [frontend/README.md](frontend/README.md).
