# Tennis Star — Panel administrativo full-stack

Aplicación desarrollada como prueba técnica para gestionar la operación de un ecommerce de tenis. El proyecto cubre autenticación, catálogo, clientes, ventas y métricas mediante una arquitectura full-stack con datos persistidos en PostgreSQL.

La interfaz está completamente en español, utiliza el formato regional `es-AR` y expresa todos los importes en dólares estadounidenses (`USD`). El diseño toma como referencia un panel administrativo minimalista y prioriza responsive, accesibilidad, estados de carga y reutilización de componentes.

## Acceso administrativo

El repositorio no incluye credenciales de acceso. Antes de ejecutar el seed se deben definir `ADMIN_EMAIL` y `ADMIN_PASSWORD` en un archivo `.env` local, que está excluido de Git. El administrador podrá iniciar sesión con esos valores una vez cargado el dataset.

## Funcionalidades

| Módulo | Alcance implementado |
| --- | --- |
| Autenticación | Login y logout, sesión JWT en cookie HTTP-only, “mantener sesión iniciada”, usuario actual, recuperación simulada y avatar de perfil. |
| Inicio | Inventario, valor total, ventas recientes y productos más vendidos calculados desde datos reales. |
| Categorías y marcas | CRUD, búsqueda, estado activo y restricción de eliminación cuando existen productos relacionados. |
| Productos | CRUD, archivado/restauración, búsqueda por nombre/SKU/ID, filtros unificados, orden, opciones dinámicas, imagen y stock informativo. |
| Importación | Carga CSV con plantilla, vista previa, validación por fila y creación transaccional. |
| Clientes | CRUD, membresía, datos de contacto, dirección, puntos y archivado/restauración. |
| Ventas | Creación transaccional, búsqueda de clientes y productos, cálculo de totales en el servidor, gestión de estado/pago/envío, historial y ocultamiento/restauración. |
| Estadísticas | Ingresos, pedidos, ticket promedio, tendencia y rankings por rango de fechas. |
| Descuentos | CRUD de códigos fijos o porcentuales, vigencia y estado. |
| Membresías | CRUD de planes, precio, descripción, beneficios y estado. |
| Puntos de lealtad | Saldo por cliente y ajustes manuales positivos o negativos con motivo e historial. |
| Notificaciones | Persistencia, filtros, lectura individual/masiva y eliminación. |
| Configuración | Datos públicos de la tienda, contacto, dirección, prefijo de órdenes y foto de perfil. |
| Ayuda | Preguntas frecuentes buscables y datos de contacto. |

### Decisiones de alcance

- El stock es informativo: una venta no valida, reserva ni descuenta unidades.
- No existe pasarela de pagos y no se almacena información sensible de tarjetas.
- Los precios de una venta se releen en el backend; cada ítem conserva snapshots de nombre, SKU y precio.
- Productos y clientes se archivan en lugar de eliminarse físicamente.
- Las ventas se ocultan/restauran, pero no se destruyen.
- Descuentos y puntos de lealtad se administran, pero no se aplican automáticamente.
- Google, Facebook y Apple se muestran como integraciones futuras, sin OAuth activo.

## Stack técnico

### Frontend

- Next.js 16 con App Router y React 19.
- TypeScript, Tailwind CSS 4 y componentes basados en Shadcn UI/Radix.
- TanStack Query para caché, mutaciones e invalidaciones.
- React Hook Form y Zod para formularios y validación.
- Recharts para estadísticas.
- Motion para microinteracciones con soporte de `prefers-reduced-motion`.
- Playwright y Vitest para pruebas.

### Backend

- NestJS 11 y API REST bajo `/api/v1`.
- Prisma 6 y PostgreSQL 17.
- JWT, Argon2, cookies HTTP-only, Helmet y CORS con origen configurable.
- Swagger/OpenAPI.
- Sharp para convertir imágenes a WebP y almacenamiento persistente local.
- Jest y Supertest para pruebas unitarias y E2E.

### Infraestructura

- Monorepo administrado con pnpm workspaces.
- Dockerfiles multi-stage para frontend y API.
- Docker Compose para desarrollo y producción.
- GitHub Actions con lint, typecheck, tests, build y pruebas E2E.

## Arquitectura

```mermaid
flowchart LR
    Browser[Navegador] -->|HTTPS| Proxy[Reverse proxy]
    Proxy -->|Aplicación| Web[Next.js]
    Proxy -->|/api/v1| API[NestJS]
    Web -->|SSR / rewrite interno| API
    API --> Prisma[Prisma]
    Prisma --> DB[(PostgreSQL)]
    API -->|WebP optimizado| Uploads[(Volumen de imágenes)]
```

El navegador consume rutas relativas `/api/v1` y `/uploads`, por lo que frontend, API e imágenes comparten origen. En producción, Next.js reenvía ambas rutas internamente al servicio `api`.

### Organización del repositorio

```text
.
├── apps/
│   ├── api/
│   │   ├── prisma/              # Schema, migraciones y seed
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── catalog/
│   │   │   ├── customers/
│   │   │   ├── sales/
│   │   │   └── admin/
│   │   └── test/
│   └── web/
│       ├── e2e/
│       └── src/
│           ├── app/             # Rutas y layouts
│           ├── components/      # UI, layout y feedback reutilizable
│           ├── features/        # Módulos de negocio
│           ├── lib/             # Cliente HTTP y utilidades
│           └── types/
├── .github/workflows/ci.yml
├── compose.dev.yml
├── compose.prod.yml
└── pnpm-workspace.yaml
```

## Requisitos

- Node.js 24
- pnpm 10
- Docker Engine con Docker Compose

## Desarrollo local

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Iniciar PostgreSQL

```bash
docker compose -f compose.dev.yml up -d
```

El contenedor de desarrollo publica PostgreSQL en `localhost:5432`.

### 3. Configurar la API

Crear `apps/api/.env`:

```env
DATABASE_URL=postgresql://tennis:tennis@localhost:5432/tennis_star?schema=public
JWT_SECRET=development-secret-with-at-least-32-characters
ADMIN_EMAIL=<tu-correo-administrativo>
ADMIN_PASSWORD=<una-contrasena-local-segura>
WEB_ORIGIN=http://localhost:3000
PORT=4000

UPLOAD_DIR=uploads
```

### 4. Preparar la base de datos

```bash
pnpm db:generate
pnpm db:deploy
pnpm db:seed
```

El seed es idempotente y crea datos representativos de todos los módulos. Se detiene con un error claro si faltan `ADMIN_EMAIL` o `ADMIN_PASSWORD`; no existen credenciales predeterminadas en el código.

### 5. Iniciar las aplicaciones

Para iniciar frontend y backend:

```bash
pnpm dev
```

También se pueden ejecutar por separado:

```bash
pnpm --filter api dev
pnpm --filter web dev
```

| Servicio | URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/api/docs |
| Healthcheck | http://localhost:4000/api/v1/health |

## API y contratos

- Prefijo global: `/api/v1`.
- Listados: `{ data, meta }`.
- Paginación y consulta mediante `page`, `pageSize`, `search`, `sortBy`, `sortOrder` y filtros específicos.
- Importes enviados como strings decimales para evitar pérdida de precisión.
- Fechas almacenadas en UTC y presentadas con formato argentino.
- Validación global con whitelist y errores Prisma normalizados.
- Autenticación requerida por defecto; login, recuperación y healthcheck son públicos.

La especificación interactiva se encuentra en Swagger una vez iniciada la API.

## Importación CSV

La pantalla Productos permite descargar una plantilla y validar el archivo antes de confirmar la carga.

- Las categorías y marcas deben existir previamente.
- Las opciones utilizan el formato `Color=Negro|Blanco;Talla=S|M|L`.
- Cada error se informa por fila.
- La importación queda bloqueada mientras existan filas inválidas.
- La creación se ejecuta dentro de una transacción.

## Calidad y pruebas

Validación general:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Pruebas E2E del backend:

```bash
pnpm --filter api test:e2e
```

Pruebas de navegador:

```bash
pnpm --filter web exec playwright install chromium
pnpm test:e2e
```

Playwright cubre login, CRUD principal, importación CSV, creación y gestión de ventas, avatar y comportamiento responsive. Los artefactos creados por las pruebas se limpian antes y después de la ejecución para no llenar la base con productos E2E.

El pipeline de CI reproduce el flujo completo sobre PostgreSQL 17: instalación, generación Prisma, lint, typecheck, pruebas, build, migraciones, seed y E2E.

## Despliegue con Docker Compose

La configuración productiva publica web y API únicamente sobre loopback; PostgreSQL permanece dentro de la red privada de Docker.

### Variables de producción

Crear `.env` en la raíz del proyecto:

```env
POSTGRES_DB=tennis_star
POSTGRES_USER=tennis
POSTGRES_PASSWORD=reemplazar-por-un-valor-seguro

JWT_SECRET=reemplazar-por-un-secreto-largo-y-aleatorio
ADMIN_EMAIL=administrador@tu-dominio.com
ADMIN_PASSWORD=reemplazar-por-una-contrasena-unica-y-segura
WEB_ORIGIN=https://tennisstar.zuzudev.pro

WEB_PORT=3000
API_PORT=4000

UPLOAD_DIR=/app/apps/api/uploads
```

No se deben guardar secretos ni credenciales productivas en Git.

### Construcción e inicio

```bash
docker compose -f compose.prod.yml up -d --build
docker compose -f compose.prod.yml ps
```

La API ejecuta `prisma migrate deploy` antes de iniciar. Para cargar el dataset inicial usando las credenciales guardadas en el `.env` local:

```bash
docker compose -f compose.prod.yml exec api \
  node node_modules/tsx/dist/cli.mjs prisma/seed.ts
```

### Reverse proxy

Para `tennisstar.zuzudev.pro`, el proxy debe enviar:

```text
/api/v1/*  → http://127.0.0.1:4000
/*         → http://127.0.0.1:3000
```

Se deben preservar los headers `Host`, `X-Forwarded-For` y `X-Forwarded-Proto`, habilitar HTTPS y permitir cuerpos de al menos 5 MB para imágenes. Si el reverse proxy se ejecuta dentro de Docker, debe compartir una red Docker con los servicios en lugar de usar `127.0.0.1`.

## Backup y restauración

Crear un backup:

```bash
docker compose -f compose.prod.yml exec -T db \
  pg_dump -U tennis tennis_star > tennis-star.sql
docker compose -f compose.prod.yml cp \
  api:/app/apps/api/uploads ./tennis-star-uploads
```

Restaurar un backup:

```bash
docker compose -f compose.prod.yml stop web api
docker compose -f compose.prod.yml exec -T db \
  psql -U tennis tennis_star < tennis-star.sql
docker compose -f compose.prod.yml cp \
  ./tennis-star-uploads/. api:/app/apps/api/uploads
docker compose -f compose.prod.yml start api web
```

## Criterios técnicos destacados

- Separación por funcionalidades tanto en NestJS como en React.
- Componentes reutilizables para tablas, formularios, dialogs, estados vacíos, carga y error.
- Operaciones monetarias y creación de ventas resueltas en el servidor.
- Relaciones y restricciones respaldadas por PostgreSQL/Prisma.
- Caché e invalidaciones explícitas con TanStack Query.
- Responsive verificado en escritorio y viewport móvil.
- Temas claro/oscuro, navegación por teclado y foco visible.
- Contenedores reproducibles y servicios internos protegidos.

---

Proyecto realizado con foco en claridad arquitectónica, consistencia de interfaz y trazabilidad de las decisiones de negocio solicitadas para la evaluación técnica.
