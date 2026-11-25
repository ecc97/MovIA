# MOVIA Web — Frontend

Aplicación web de MOVIA construida con Next.js 16. Consume exclusivamente la API REST del backend: el catálogo público, el detalle de vehículo, el formulario de consultas, la autenticación y el panel de ADMIN/ASESOR.

## Índice

- [Responsabilidades](#responsabilidades)
- [Stack](#stack)
- [Funcionalidades por rol](#funcionalidades-por-rol)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Configuración local](#configuración-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts](#scripts)
- [Autenticación y roles](#autenticación-y-roles)
- [Diseño y UX](#diseño-y-ux)
- [Tests E2E](#tests-e2e)
- [Docker](#docker)
- [Troubleshooting](#troubleshooting)
- [Limitaciones](#limitaciones)

## Responsabilidades

- Renderizar el catálogo público con filtros persistidos en la URL.
- Mostrar el detalle de vehículo con galería y formulario de consulta.
- Permitir consultas generales sin vehículo asociado.
- Gestionar la sesión del usuario mediante cookies del backend.
- Mostrar el panel de consultas a ASESOR y ADMIN.
- Mostrar el inventario solo a ADMIN.
- Aplicar tema claro/oscuro, diseño responsive y accesibilidad básica.
- Abrir conversaciones de WhatsApp sin persistir el clic.

## Stack

| Pieza | Tecnología |
| --- | --- |
| Framework | Next.js 16.4.5 |
| UI | React 19.3 |
| Lenguaje | TypeScript 5.9 |
| Estilos | Tailwind CSS 4, CSS-first |
| Estado de servidor | TanStack Query 5 |
| Formularios | react-hook-form + Zod 4 |
| Iconos | lucide-react |
| Utilidades | clsx + tailwind-merge, date-fns |
| Tests | Playwright con Chromium |

TypeScript está fijado en 5.9 porque `typescript-eslint` no soporta TypeScript 7.

## Funcionalidades por rol

| Funcionalidad | Visitante | ASESOR | ADMIN |
| --- | --- | --- | --- |
| Ver catálogo y detalle | Sí | Sí | Sí |
| Crear consulta | Sí | Sí | Sí |
| Ver y gestionar consultas | No | Sí | Sí |
| Reabrir consulta cerrada | No | No | Sí |
| Inventario y fotos | No | No | Sí |

Los guards del frontend son solo UX. La autoridad real está en el backend.

## Arquitectura

### Rutas

Los route groups no cambian las URLs públicas.

| Grupo | Rutas | Layout |
| --- | --- | --- |
| `(public)` | `/`, `/catalogo`, `/contacto`, `/vehiculos/[id]` | Header y footer públicos. |
| `(private)/(auth)` | `/login` | Sin cabecera pública. |
| `(private)/(dashboard)` | `/panel`, `/panel/consultas` | Sidebar oscura, topbar y drawer móvil. |
| `(private)/(dashboard)/panel/(admin)` | `/panel/inventario` | Guard adicional de rol ADMIN. |

La home y el detalle de vehículo renderizan en servidor y llaman al service directamente. El catálogo usa TanStack Query y mantiene los filtros en query params.

### Flujo de datos

```text
componente → hook (TanStack Query) → service → apiFetch → API REST
```

`lib/api/index.ts` centraliza `apiFetch` y usa `credentials: "include"` para enviar la cookie de sesión. Solo los services por feature invocan `apiFetch`.

### Estructura

```text
frontend/
├── e2e/
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   └── (private)/
│   │       ├── (auth)/
│   │       └── (dashboard)/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── auth/
│   │   ├── inquiries/
│   │   └── vehicles/
│   ├── lib/
│   │   └── api/
│   └── types/
├── .env.example
├── Dockerfile
├── next.config.js
├── playwright.config.ts
└── package.json
```

Cada feature agrupa sus `components/`, `hooks/`, `services/` y `types/` cuando tiene contenido. `components/ui/` contiene los componentes visuales compartidos; `components/layout/` contiene Header, Footer y Sidebar.

## Requisitos

- Node.js 22 y npm.
- Backend en `http://localhost:4000`, o Compose levantado.
- Para E2E, navegador Chromium de Playwright.

## Configuración local

Desde `frontend/`:

```powershell
npm install
Copy-Item .env.example .env
# Ajusta NEXT_PUBLIC_WHATSAPP_NUMBER
npm run dev
```

En Linux o macOS, usa `cp .env.example .env`.

La web queda en `http://localhost:3000`.

Para desarrollo local, `INTERNAL_API_URL` debe apuntar a `http://localhost:4000`. Dentro de Docker, Compose la fija en `http://api:4000`.

## Variables de entorno

| Variable | Ejemplo | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | URL que usa el navegador para llamar a la API. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `573000000000` | Número de los enlaces de WhatsApp. |
| `INTERNAL_API_URL` | `http://localhost:4000` | URL usada por el renderizado en servidor. |

`lib/api/index.ts` elige la URL según el entorno:

- En navegador: `NEXT_PUBLIC_API_URL` o `http://localhost:4000`.
- En servidor: `INTERNAL_API_URL`, luego `NEXT_PUBLIC_API_URL`, luego `http://localhost:4000`.

Las variables `NEXT_PUBLIC_*` se inlinean en el build. Si cambias una de ellas, reconstruye el bundle.

El número de WhatsApp va sin `+`, espacios ni guiones, con prefijo `57`.

## Scripts

| Script | Uso |
| --- | --- |
| `npm run dev` | Next.js con Turbopack. |
| `npm run build` | Build de producción. |
| `npm run start` | Servidor de producción. |
| `npm run lint` | ESLint sobre `src/`. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run format` | Prettier sobre archivos de `src/`. |
| `npm run test:e2e` | Suite de Playwright. |
| `npm run test:e2e:ui` | Playwright en modo UI. |

## Autenticación y roles

- La sesión viaja en la cookie `httpOnly` `movia_session`; el frontend no almacena tokens.
- `AuthProvider` expone el usuario actual mediante TanStack Query.
- Las rutas del panel comprueban sesión y rol para evitar pantallas incorrectas.
- El botón de reabrir consulta cerrada aparece solo para ADMIN.
- Para ASESOR, los estados abiertos aparecen deshabilitados cuando la consulta está cerrada.
- Un guard solo frontend no protege nada: la API vuelve a verificar identidad y rol.

## Diseño y UX

- Tipografías: Sora para titulares y DM Sans para interfaz.
- Tokens semánticos en `globals.css`, con variantes `.dark`.
- Sidebar del panel siempre oscura; topbar y contenido siguen el tema global.
- Paleta principal: grafito, fondo claro, dorado, éxito, error y pendiente.
- Componentes compartidos: Button, Badge, FormField, Modal, Skeleton, EmptyState, PageHeader, StatCard, FilterChip, Pagination, Spinner, ThemeToggle, Toast y ConfirmDialog.
- Toasts para éxito; errores inline salvo logout.
- Confirmaciones para archivar vehículo, logout y cambios a estados de cierre.
- Imágenes de vehículo con skeleton, fallback y foto principal según menor `order`.
- Enlaces de WhatsApp usan `encodeURIComponent`, `target="_blank"` y `rel="noopener noreferrer"`.

## Tests E2E

La suite usa Playwright con Chromium y cubre flujos públicos, login, consultas de ASESOR, consultas de ADMIN, inventario y permisos.

Preparación:

```powershell
npx playwright install chromium
npm --prefix ../backend run test:setup
npm run test:e2e
```

`playwright.config.ts`:

- Usa `http://localhost:3000` como base URL.
- Arranca el backend en `http://localhost:4000` con `test:server`.
- Arranca la web con `npm run dev` local o `npm run start` en CI.
- Inyecta `NEXT_PUBLIC_API_URL=http://localhost:4000`.
- Reutiliza servidores existentes fuera de CI.
- Usa un único worker y genera reporte HTML.

Antes de ejecutar E2E conviene detener Docker: si los puertos están ocupados, Playwright puede reutilizar servicios que apuntan a otra base. La base aislada es `movia_test`.

Comando para abrir la UI de Playwright:

```powershell
npm run test:e2e:ui
```

## Docker

La imagen de `web`:

- Usa `node:22-bookworm-slim`.
- Instala dependencias con `npm install --no-audit --no-fund`.
- Recibe `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_WHATSAPP_NUMBER` como build args.
- Genera el output `standalone` de Next.js.
- Copia `public`, `.next/standalone` y `.next/static` a la imagen final.
- Escucha en `0.0.0.0:3000`.
- Usa `INTERNAL_API_URL=http://api:4000` para SSR dentro de Compose.
- Tiene healthcheck sobre `/`.

Si cambias `NEXT_PUBLIC_WHATSAPP_NUMBER` o `NEXT_PUBLIC_API_URL`, reconstruye la imagen; no basta con recrear el contenedor.

## Troubleshooting

- **Typecheck con rutas antiguas.** Borra `.next` y vuelve a ejecutar `npm run build` o `npm run typecheck`.
- **La web llama a `localhost:4000` desde el contenedor.** Revisa `INTERNAL_API_URL`; dentro de Docker debe ser `http://api:4000`.
- **CORS o cookie rechazada.** Comprueba `CORS_ORIGIN`, `SESSION_COOKIE_SECURE` y que la API use `credentials: true`.
- **Playwright conecta con la base equivocada.** Detén Docker, ejecuta `npm --prefix ../backend run test:setup` y vuelve a correr E2E.
- **Fallo de instalación con `npm ci`.** Usa `npm install --no-audit --no-fund`; Docker y CI ya lo hacen.
- **Error de ESLint por TypeScript 7.** No actualices TypeScript por encima de 5.9 sin resolver la incompatibilidad con `typescript-eslint`.

## Limitaciones

- No hay subida real de archivos a storage; el alta y edición de fotos usan URLs.
- El clic en WhatsApp no se guarda como consulta.
- No hay filtros de combustible ni transmisión en el catálogo público.
- La expiración y renovación de sesión no están implementadas.
- El catálogo usa TanStack Query con `staleTime` de 60 segundos; no hay una estrategia de invalidación más avanzada.
- Los guards de rol protegen la UI, no los datos: la autoridad está en la API.

## Enlaces

- [README raíz](../README.md)
- [README del backend](../backend/README.md)
- Swagger UI: `http://localhost:4000/api/docs`
