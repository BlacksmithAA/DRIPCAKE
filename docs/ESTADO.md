# Estado actual del proyecto — Dripcake

> Documento de referencia rápida para agentes de IA y para validación del usuario. Actualizado al 11/08/2026.
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

### Primera vez

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Después de cambios en `schema.prisma`

```bash
npm run db:push
```

### Build de producción

```bash
npm run build
npm start
```

> El proyecto no usa migraciones versionadas de Prisma. Si se decide pasar a producción con trazabilidad de DB, usar `npx prisma migrate dev`.

---

## Variables de entorno

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="clave-segura-generada-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
TZ=America/Panama
```

Para Cloudflare Tunnel u otro dominio público, cambiar `NEXTAUTH_URL` al dominio HTTPS.

---

## Usuarios de prueba

Creados automáticamente por `npm run db:seed`.

| Rol | Email | Contraseña | Acceso |
|---|---|---|---|
| Admin | `admin@dripcake.com` | `admin123` | Todo: kanban, menú, configuración, días no laborables, escáner |
| Empleado | `empleado@dripcake.com` | `empleado123` | Kanban, escáner, no-show |
| Cliente | `cliente@dripcake.com` | `cliente123` | Pedidos, perfil, QR de canje |
| Cliente | `carlos@dripcake.com` | `cliente123` | Pedidos, perfil, QR de canje |

---

## Rutas principales

### Públicas
- `/` — Landing
- `/login` — Inicio de sesión
- `/registro` — Auto-registro de clientes
- `/qr/[tipo]/[token]` — Redirección pública de QRs

### Cliente (requiere rol `cliente`)
- `/pedidos` — Mis pedidos
- `/pedidos/nuevo` — Crear pedido
- `/perfil` — Perfil, puntos y QR de canje

### Admin / Empleado (requiere rol `admin` o `empleado`)
- `/admin/kanban` — Tablero de pedidos
- `/admin/escaner` — Escanear QR
- `/admin/no-show` — Marcar pedidos no retirados
- `/admin/menu` — Gestionar productos (solo `admin`)
- `/admin/empleados` — Gestionar empleados (solo `admin`)
- `/admin/dias-no-laborables` — Gestionar días no laborables (solo `admin`)
- `/admin/configuracion` — Configuración del sistema (solo `admin`)

---

## Estado de funcionalidades

| Funcionalidad | Estado | Notas |
|---|---|---|
| Login con roles | ✅ | JWT, bcrypt, roles cliente/empleado/admin |
| Auto-registro clientes | ✅ | `/registro` |
| Catálogo de productos | ✅ | Crear, activar/desactivar, eliminar/archivar. Falta editar |
| Nuevo pedido | ✅ | Con validación min/max |
| Agenda de retiro | ✅ | Bloques 8:00–18:00 |
| Regla 48h hábiles | ✅ | Respeta domingos y días no laborables |
| Días no laborables | ✅ | CRUD completo, soporte recurrente |
| QR de retiro | ✅ | Generado al crear pedido |
| Cancelación de pedidos | ✅ | Solo si faltan >48h hábiles |
| Kanban | ✅ | Drag-and-drop, estados, pago, entrega |
| No-show | ✅ | Marcado manual |
| Cashback | ✅ | 10 % al marcar pagado |
| QR de canje | ✅ | 10 minutos, un solo uso |
| Escáner QR | ✅ | Retiro y canje |
| Mínimo de canje configurable | ✅ | En `/admin/configuracion` |
| Límite total de pedidos/día | ⚠️ | Evaluado en disponibilidad de bloques; no sugiere alternativas |
| Límite unidades por producto/día | ❌ | Persistido pero no aplicado |
| Corte horario por día | ❌ | Persistido pero no aplicado |
| Sugerir alternativas | ❌ | Función existe en `lib/` pero no se usa |
| Editar productos | ❌ | No implementado (eliminar/archivar sí) |
| Gestionar empleados desde UI | ✅ | Crear y activar/desactivar desde `/admin/empleados` |

---

## Estructura clave del código

- `src/lib/auth.ts` — Configuración de NextAuth.
- `src/lib/prisma.ts` — Singleton de PrismaClient.
- `src/lib/reglas-fecha.ts` — Cálculo de 48h hábiles, bloques y alternativas.
- `src/lib/puntos.ts` — Lógica de cashback y canje.
- `src/lib/qr.ts` — Generación y validación de tokens QR.
- `prisma/seed.ts` — Datos iniciales.

---

## Bugs / advertencias conocidas

- Algunos componentes usan `<img>` en lugar de `<Image />` de Next.js (warnings de ESLint).
- `/login` genera advertencia de "deopted to client-side rendering".
- Al desmarcar un pedido como pagado se elimina la transacción de puntos ganados (sin historial de reversión).
- No hay migraciones de Prisma; se usa `db push`.

---

## Próximos pasos sugeridos

1. Completar Fase 6: aplicar límite de unidades por producto/día y corte horario.
2. Conectar sugerencia de alternativas cuando una fecha queda bloqueada.
3. Agregar edición de productos (si se requiere).
4. Limpiar warnings de ESLint y revisar responsive en tablet/celular.
5. Decidir si se generan migraciones de Prisma y/o se migra a PostgreSQL para producción.
