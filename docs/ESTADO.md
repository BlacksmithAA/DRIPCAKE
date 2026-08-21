# Estado actual del proyecto — Dripcake

> Documento de referencia rápida para agentes de IA y para validación del usuario. Actualizado al 20/08/2026.
>
> - Requerimientos funcionales: `01-documento-requerimientos.md`
> - Guía técnica completa: `02-AGENTS.md`
> - Avance por fases: `03-PROGRESS.md`

---

## Stack y versiones

| Tecnología | Versión / Nota |
|---|---|
| Next.js | 13.5.6 (App Router + TypeScript) |
| React | 18.3.1 |
| Tailwind CSS | 3.4.13 |
| Prisma | 5.20.0 |
| Base de datos | SQLite (`prisma/dev.db`) |
| Autenticación | NextAuth.js 4.24.8 con JWT |
| ORM client | `@prisma/client` 5.20.0 |
| QR | `qrcode` + `html5-qrcode` |
| Drag-and-drop | `@dnd-kit/*` |
| Zona horaria | `America/Panama` (fija) |

---

## Cómo correrlo

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Después de cambios en `schema.prisma`: `npm run db:push`.

Build de producción: `npm run build && npm start`.

> El proyecto no usa migraciones versionadas de Prisma.

---

## Variables de entorno

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="clave-segura-generada-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
TZ=America/Panama
```

---

## Usuarios de prueba

| Rol | Email | Contraseña | Acceso |
|---|---|---|---|
| Admin | `admin@dripcake.com` | `admin123` | Todo: kanban, menú, configuración, días no laborables, escáner |
| Empleado | `empleado@dripcake.com` | `empleado123` | Kanban, escáner, no-show |
| Cliente | `cliente@dripcake.com` | `cliente123` | Pedidos, perfil, QR de retiro |
| Cliente | `carlos@dripcake.com` | `cliente123` | Pedidos, perfil, QR de retiro |

---

## Rutas principales

**Públicas:** `/`, `/login`, `/registro`, `/qr/retiro/[token]`.

**Cliente:** `/pedidos`, `/pedidos/nuevo`, `/perfil`.

**Admin/Empleado:** `/admin/kanban`, `/admin/escaner`, `/admin/no-show`, `/admin/historial`, `/admin/menu`, `/admin/empleados`, `/admin/dias-no-laborables`, `/admin/configuracion`.

---

## Estado de funcionalidades

| Funcionalidad | Estado | Notas |
|---|---|---|
| Login con roles | ✅ | JWT, bcrypt, roles cliente/empleado/admin |
| Auto-registro clientes | ✅ | `/registro` |
| Catálogo de productos | ✅ | Crear, editar, activar/desactivar, eliminar/archivar, foto/video |
| Histórico de pedidos (admin) | ✅ | Filtros, paginación y detalle en `/admin/historial` |
| Calendario de días no laborables | ✅ | Vista mensual con modal de edición en `/admin/dias-no-laborables` |
| Lightbox de imagen | ✅ | Click para ampliar en catálogo, menú y kanban |
| Nuevo pedido | ✅ | Con validación min/max y media |
| Agenda de retiro | ✅ | Bloques 8:00–18:00, solo viernes/sábado |
| Stock semanal por producto | ✅ | Campo agregado; lógica en `src/lib/agenda-stock.ts` |
| Venta viernes/sábado | ✅ | Reemplaza regla de 48h |
| Días no laborables | ✅ | CRUD completo, soporte recurrente |
| QR de retiro | ✅ | Generado al crear pedido |
| Cancelación de pedidos | ✅ | Pedidos futuros |
| Kanban | ✅ | Drag-and-drop, estados, pago, entrega |
| No-show | ✅ | Marcado manual |
| Cashback | ❌ | Eliminado de esta versión |
| QR de canje | ❌ | Eliminado de esta versión |
| Escáner QR | ✅ | Solo retiro |
| Mínimo de canje configurable | ❌ | Eliminado junto con cashback |
| Límite total de pedidos/día | ❌ | Reemplazado por stock semanal |
| Límite unidades por producto/día | ❌ | Reemplazado por stock semanal |
| Corte horario por día | ❌ | Reemplazado por stock semanal |
| Sugerir alternativas | ✅ | Automático al agotarse stock semanal |
| Editar productos | ✅ | Desde modal en `/admin/menu`; pedidos históricos conservan snapshot de nombre/precio |
| Gestionar empleados desde UI | ✅ | Crear y activar/desactivar desde `/admin/empleados` |
| Foto/video por producto | ✅ | Upload local en `public/uploads/productos/` |
| Navegación inferior móvil | ✅ | `BottomNav` con rol cliente/empleado/admin |
| Rediseño visual panadería | ✅ | Paleta cafe/crema/dorado, Playfair Display + Inter |

---

## Estructura clave del código

- `src/lib/auth.ts` — Configuración de NextAuth.
- `src/lib/prisma.ts` — Singleton de PrismaClient.
- `src/lib/agenda-stock.ts` — Stock semanal, semanas de venta y bloques.
- `src/lib/reglas-fecha.ts` — Días no laborables y helpers de zona horaria.
- `src/lib/qr.ts` — Generación y validación de tokens QR de retiro.
- `src/components/BottomNav.tsx` — Navegación inferior móvil.
- `src/app/api/productos/[id]/media/route.ts` — Subida de foto/video.
- `src/app/api/pedidos/historial/route.ts` — Histórico de pedidos con filtros.
- `src/app/admin/dias-no-laborables/CalendarioDiasNoLaborables.tsx` — Calendario visual.
- `src/components/ImagenAmpliable.tsx` — Lightbox reutilizable.
- `prisma/seed.ts` — Datos iniciales.

---

## Bugs / advertencias conocidas

- Algunos componentes usan `<img>` en lugar de `<Image />` de Next.js (warnings de ESLint).
- `/login` genera advertencia de "deopted to client-side rendering".
- No hay migraciones de Prisma; se usa `db push`.
