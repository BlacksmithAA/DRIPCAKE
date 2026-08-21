# AGENTS.md — Sistema de Pedidos (Panadería)

Este archivo guía a OpenCode (o cualquier agente de código) durante el desarrollo de este proyecto. Contiene el stack técnico, la estructura del proyecto y el estado actual por fases. La referencia funcional completa está en `01-documento-requerimientos.md` — léelo antes de generar código. El estado de avance detallado está en `03-PROGRESS.md`.

---

## 1. Stack técnico

| Capa | Tecnología | Motivo |
|---|---|---|
| Frontend + Backend | **Next.js 13.5.6 (TypeScript, App Router)** | Un solo proyecto/lenguaje para UI y API, ideal para un desarrollador único gestionando todo con un agente de código |
| Base de datos (local/dev) | **SQLite** | Cero configuración para correr en local, sin instalar servidor de base de datos |
| Base de datos (producción, futuro) | **PostgreSQL** | Migración directa vía Prisma sin reescribir lógica |
| ORM | **Prisma** | Tipado automático, cambia de SQLite a Postgres cambiando solo la variable de conexión. Actualmente se usa `prisma db push` (sin migraciones versionadas) |
| Autenticación | **NextAuth.js** con credenciales + sesión JWT | Maneja roles (`cliente` / `empleado` / `admin`) de forma nativa. No se usa `@auth/prisma-adapter` a pesar de estar instalado |
| UI | **React + Tailwind CSS** | Rapidez de desarrollo, responsive de forma natural |
| Kanban drag-and-drop | **dnd-kit** | Librería ligera y mantenida para tableros kanban en React |
| Generación de QR | **qrcode** (npm) | Genera QR de retiro |
| Lectura de QR (cámara) | **html5-qrcode** | Escaneo desde el navegador, funciona en celular/tablet sin app nativa |
| Manejo de fechas/horas | **date-fns** + **date-fns-tz** | Cálculo de semanas de venta y días no laborables fijando zona horaria `America/Panama` |
| Validación de formularios | **Zod** | Comparte esquemas entre frontend y backend (API routes) |

**Por qué Next.js y no separar frontend/backend (React + Express):** para un proyecto de este tamaño, con un solo desarrollador apoyado por un agente de código, tener todo en un solo repositorio/proyecto reduce la complejidad de configuración, despliegue y mantenimiento. La API vive en `app/api/*` dentro del mismo proyecto, pero sigue estando desacoplada de la UI (los mismos endpoints podrían ser consumidos después por un bot de WhatsApp sin tocar el frontend).

---

## 2. Estructura de carpetas real

```
dripcake/
├── prisma/
│   ├── schema.prisma          # Modelo de datos completo
│   ├── seed.ts                # Usuarios, productos y config demo
│   └── dev.db                 # Base de datos SQLite (no versionar)
├── scripts/
│   └── generar-resumen-cliente.js
├── docs/
│   ├── resumen-no-tecnico-dripcake.pdf
│   └── ESTADO.md              # Referencia rápida del estado actual
├── src/
│   ├── app/
│   │   ├── (cliente)/         # Rutas protegidas para clientes
│   │   │   ├── pedidos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── nuevo/
│   │   │   │       ├── page.tsx
│   │   │   │       └── FormularioNuevoPedido.tsx
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── admin/             # Rutas protegidas para admin/empleado
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── kanban/
│   │   │   │   ├── page.tsx
│   │   │   │   └── KanbanBoard.tsx
│   │   │   ├── menu/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── FormProducto.tsx
│   │   │   │   ├── EditarProductoButton.tsx
│   │   │   │   └── EliminarProductoButton.tsx
│   │   │   ├── historial/
│   │   │   │   ├── page.tsx
│   │   │   │   └── HistorialPedidos.tsx
│   │   │   ├── empleados/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── FormEmpleado.tsx
│   │   │   │   └── ToggleEmpleadoButton.tsx
│   │   │   ├── dias-no-laborables/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── CalendarioDiasNoLaborables.tsx
│   │   │   │   ├── FormDiaNoLaborable.tsx
│   │   │   │   └── EliminarDiaButton.tsx
│   │   │   ├── configuracion/
│   │   │   │   ├── page.tsx
│   │   │   │   └── ConfigForm.tsx
│   │   │   ├── escaner/
│   │   │   │   ├── page.tsx
│   │   │   │   └── EscanerQR.tsx
│   │   │   └── no-show/
│   │   │       ├── page.tsx
│   │   │       └── MarcarNoShowButton.tsx
│   │   ├── api/               # API routes
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── registro/route.ts
│   │   │   ├── productos/route.ts
│   │   │   ├── productos/[id]/route.ts
│   │   │   ├── productos/[id]/toggle/route.ts
│   │   │   ├── empleados/route.ts
│   │   │   ├── empleados/[id]/toggle/route.ts
│   │   │   ├── pedidos/route.ts
│   │   │   ├── pedidos/[id]/cancelar/route.ts
│   │   │   ├── pedidos/[id]/pago/route.ts
│   │   │   ├── pedidos/[id]/entrega/route.ts
│   │   │   ├── pedidos/[id]/estado/route.ts
│   │   │   ├── pedidos/[id]/no-show/route.ts
│   │   │   ├── pedidos/historial/route.ts
│   │   │   ├── agenda/bloques/route.ts
│   │   │   ├── dias-no-laborables/route.ts
│   │   │   ├── dias-no-laborables/[id]/route.ts
│   │   │   ├── configuracion/route.ts
│   │   │   ├── productos/[id]/media/route.ts
│   │   │   └── qr/retiro/[token]/route.ts
│   │   ├── qr/[tipo]/[token]/page.tsx
│   │   ├── login/page.tsx
│   │   ├── registro/page.tsx
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── BottomNav.tsx
│   │   └── ImagenAmpliable.tsx
│   ├── lib/
│   │   ├── auth.ts              # Configuración de NextAuth
│   │   ├── prisma.ts            # Singleton de PrismaClient
│   │   ├── agenda-stock.ts      # Stock semanal, semanas de venta viernes/sábado, bloques
│   │   ├── reglas-fecha.ts      # Días no laborables y helpers de zona horaria
│   │   ├── qr.ts                # Generación/validación de tokens QR de retiro
│   │   ├── timezone.ts          # Helpers de zona horaria America/Panama
│   │   ├── format.ts            # Formateo de moneda/fecha
│   │   └── constants.ts         # Constantes del sistema
│   └── types/
│       └── next-auth.d.ts       # Tipado extendido de sesión JWT
├── .env                         # Variables de entorno (no versionar)
├── .env.local                   # Variables locales (no versionar)
├── 01-documento-requerimientos.md
├── 02-AGENTS.md                 # Este archivo
├── 03-PROGRESS.md               # Estado de avance
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── tsconfig.seed.json
```

---

## 3. Estado actual por fases

Las fases 0 a 5 y las fases F a I están implementadas. El trabajo activo se concentra en pulido y corrección de warnings.

### Fase 0 — Setup del proyecto ✅
- Next.js + TypeScript + Tailwind configurados.
- Prisma + SQLite funcionando.
- NextAuth con roles funcionando.

### Fase 1 — Modelo de datos y catálogo ✅
- Schema completo (incluye `activo` en `Usuario`, `archivado` en `Producto`, y snapshots `nombreProducto`/`precioUnitario` en `ItemPedido`).
- CRUD de productos: crear, editar, activar/desactivar y eliminar/archivar desde `/admin/menu`.
- Gestión de empleados: crear y activar/desactivar desde `/admin/empleados`.

### Fase 2 — Pedidos y agenda ✅
- Formulario de nuevo pedido.
- Agenda con bloques de horario (viernes y sábado).
- Stock semanal por producto.
- Sugerencia automática de semana siguiente cuando no hay stock.
- QR de retiro automático.

### Fase 3 — Panel administrativo (kanban) ✅
- Kanban con drag-and-drop.
- Toggle de pagado/entregado.
- Marcado de no-show.

### Fase 4 — Escaneo de QR ✅
- Escáner con cámara.
- Flujo QR de retiro.

### Fase 5 — Loyalty (cashback) ❌ Eliminado
- El sistema de puntos, cashback y QR de canje fue retirado por completo.
- Ver decisión en `03-PROGRESS.md`.

### Fase 6 — Stock semanal y agenda ✅
- Reemplaza las reglas de negocio configurables por producto (límite por día, total pedidos, corte horario).
- Stock semanal por producto con cálculo en tiempo real sobre `ItemPedido`.
- Venta exclusiva viernes y sábado.
- Sugerencia automática de semana siguiente y contacto por WhatsApp.

### Fase 7 — Pulido, rediseño visual y navegación móvil ✅
- Responsive base presente.
- Paleta marrón/crema/dorado y tipografía serif (Playfair Display + Inter).
- Navegación inferior fija en móvil (`BottomNav`).
- Foto/video de muestra por producto.

### Fase F — Histórico de pedidos para administrador ✅
- Endpoint y UI con filtros/paginación en `/admin/historial`.

### Fase G — Calendario visual de días no laborables ✅
- Calendario mensual con modal de edición.

### Fase H — Edición de productos + snapshot en ItemPedido ✅
- Edición de productos; pedidos históricos conservan nombre/precio originales.

### Fase I — Lightbox de imagen de producto ✅
- Click para ampliar imágenes en catálogo, menú y kanban.

---

## 4. Convenciones para el agente de código

- Todo el código y comentarios en **español** para nombres de dominio (ej. `pedido`, `cliente`, `stockSemanal`), pero identificadores técnicos estándar en inglés cuando sea idiomático (ej. `useState`, `handleSubmit`).
- Toda fecha/hora se maneja y se muestra en **America/Panama**, nunca en hora local del navegador sin conversión explícita.
- La lógica de reglas de negocio (stock semanal, semanas de venta, validación de QR) debe vivir en `src/lib/`, no mezclada dentro de componentes de UI — así es reutilizable y testeable.
- No implementar pasarela de pago ni lógica de personalización de pedidos — están explícitamente fuera de alcance (ver documento de requerimientos, sección 1.2 y 6).
- Antes de modificar reglas de negocio complejas, revisar `src/lib/agenda-stock.ts`, `src/lib/reglas-fecha.ts` y `src/lib/qr.ts`.

---

## 5. Cómo correr el proyecto en local

### Primera vez

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Después de cambios en el schema

```bash
npm run db:push
```

> **Nota:** el proyecto no usa migraciones versionadas de Prisma. Si se requiere producción con trazabilidad de cambios de DB, generar migraciones con `npx prisma migrate dev`.

### Variables de entorno

Copiar `.env` a `.env.local` y ajustar:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="clave-segura-aleatoria"
NEXTAUTH_URL="http://localhost:3000"
TZ=America/Panama
```

Para producción, `NEXTAUTH_SECRET` debe generarse con `openssl rand -base64 32` y `NEXTAUTH_URL` debe apuntar al dominio público.

### Credenciales de prueba (creadas por seed)

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@dripcake.com` | `admin123` |
| Empleado | `empleado@dripcake.com` | `empleado123` |
| Cliente | `cliente@dripcake.com` | `cliente123` |
| Cliente | `carlos@dripcake.com` | `cliente123` |

La app quedará disponible en `http://localhost:3000`. La base de datos SQLite se crea como un archivo local (`prisma/dev.db`), sin necesidad de instalar ni configurar un servidor de base de datos aparte.

---

## 6. Notas para despliegue

- Este proyecto puede exponerse a internet con **Cloudflare Tunnel** apuntando a `http://localhost:3000`.
- Para producción se recomienda cambiar `NEXTAUTH_SECRET`, usar HTTPS y considerar migrar a PostgreSQL.
- SQLite es válido para un solo servidor/local; no es adecuado para múltiples réplicas o despliegues serverless sin almacenamiento persistente.
