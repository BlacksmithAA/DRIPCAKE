# Progreso del proyecto — Sistema de Pedidos (Panadería)

> Este archivo debe mantenerse actualizado por OpenCode al final de cada sesión de trabajo.
> Referencia funcional: `01-documento-requerimientos.md`
> Referencia técnica y estado rápido: `docs/ESTADO.md`

Última actualización: 20/08/2026

---

## Estado general

| Fase | Estado | % avance |
|---|---|---|
| Fase 0 — Setup del proyecto | ✅ Completo | 100% |
| Fase 1 — Modelo de datos y catálogo | ✅ Completo | 100% |
| Fase 2 — Pedidos y agenda | ✅ Completo | 95% |
| Fase 3 — Panel administrativo (kanban) | ✅ Completo | 95% |
| Fase 4 — Escaneo de QR | ✅ Completo | 95% |
| Fase 5 — Loyalty (cashback) | ❌ Eliminado | — |
| Fase 6 — Stock semanal y agenda | ✅ Completo | 95% |
| Fase 7 — Pulido, rediseño visual y navegación móvil | ✅ Completo | 90% |
| Fase F — Histórico de pedidos (admin) | ✅ Completo | 100% |
| Fase G — Calendario de días no laborables | ✅ Completo | 100% |
| Fase H — Edición de productos + snapshot en ItemPedido | ✅ Completo | 100% |
| Fase I — Lightbox de imagen de producto | ✅ Completo | 100% |

---

## ✅ Completado

### Fase 0: Setup del proyecto — Agosto 2026
- Next.js 13.5.6 + TypeScript + Tailwind CSS inicializado.
- Prisma configurado con SQLite (`prisma/dev.db`).
- NextAuth configurado con roles `cliente`, `empleado`, `admin` usando JWT.
- Seed funcional con usuarios, productos, días no laborables y configuración inicial.

### Fase 1: Modelo de datos y catálogo — Agosto 2026
- `schema.prisma` completo con todas las entidades del requerimiento.
- CRUD de productos desde `/admin/menu`: crear, activar/desactivar y eliminar/archivar.
- Campos `stockSemanal`, `imagenUrl` y `videoUrl` en `Producto`.
- Endpoint `POST /api/productos/:id/media` para subir foto/video de muestra (almacenamiento local en `public/uploads/productos/`).
- Eliminación con protección de integridad: si el producto tiene `ItemPedido` asociados, se archiva (`activo=false`, `archivado=true`) en lugar de borrarse.
- Seed crea 5 productos de ejemplo.

### Gestión de empleados — 11/08/2026
- Nueva sección `/admin/empleados` para crear y gestionar empleados.
- Endpoint `POST /api/empleados` protegido para admin.
- Endpoint `PATCH /api/empleados/[id]/toggle` para activar/desactivar empleados.
- Campo `activo` agregado al modelo `Usuario`; empleados inactivos no pueden iniciar sesión.

### Fase 2: Pedidos y agenda — Agosto 2026
- Formulario de nuevo pedido en `/pedidos/nuevo`.
- Validación de cantidades min/max por producto.
- Agenda de retiro con bloques de horario (8:00–18:00) solo viernes y sábado.
- Stock semanal por producto con cálculo en tiempo real.
- Sugerencia automática de semana siguiente cuando no hay stock.
- Generación automática de QR de retiro al crear pedido.
- Cancelación de pedidos futuros (sin regla de 48h).

### Fase 3: Panel administrativo (kanban) — Agosto 2026
- Vista kanban en `/admin/kanban` con dnd-kit.
- Tarjetas con cliente, teléfono, hora de retiro, descripción, costo, pago y entrega.
- Toggle manual de pagado/entregado.
- Marcado manual de no-show en `/admin/no-show`.

### Fase 4: Escaneo de QR — Agosto 2026
- Escáner de cámara en `/admin/escaner` con `html5-qrcode`.
- QR de retiro → marca pedido como entregado.
- Ruta pública `/qr/retiro/[token]` redirige al escáner.

### Fase F: Histórico de pedidos para administrador — 20/08/2026
- Endpoint `GET /api/pedidos/historial` con filtros (fecha, cliente, estado, pagado, entregado, no-show) y paginación.
- Página `/admin/historial` con tabla y modal de detalle de pedido.
- Enlace agregado a la navegación de escritorio y al drawer "Más" de `BottomNav`.

### Fase G: Calendario visual de días no laborables — 20/08/2026
- Nuevo componente `CalendarioDiasNoLaborables.tsx` con vista mensual.
- Modal al hacer click en un día para crear/editar/quitar día no laborable.
- Endpoint `PATCH /api/dias-no-laborables/[id]` para edición.
- Domingos resaltados como días cerrados por regla de negocio.

### Fase H: Edición de productos + snapshot en ItemPedido — 20/08/2026
- Schema: `ItemPedido` ahora guarda `nombreProducto` y `precioUnitario` como snapshots inmutables.
- Backfill creado y ejecutado (`scripts/backfill-snapshots.ts`) para poblar `nombreProducto` en ítems históricos.
- Endpoint `PATCH /api/productos/[id]` para editar productos (admin).
- `FormProducto.tsx` soporta modo creación y edición; `EditarProductoButton.tsx` abre modal de edición en `/admin/menu`.
- Vistas de pedidos (cliente, kanban, no-show, historial) leen el nombre del snapshot en lugar de `producto.nombre`.

### Fase I: Lightbox de imagen de producto — 20/08/2026
- Componente reutilizable `ImagenAmpliable.tsx`.
- Aplicado en catálogo de nuevo pedido, tabla de menú admin y tarjetas del kanban.

---

## 🔄 En progreso

### Fase 6: Stock semanal y agenda
- [x] Campo `stockSemanal` en `Producto` y `whatsappContacto` en `ConfiguracionSistema`.
- [x] Lógica de semanas de venta (viernes/sábado) y disponibilidad en `src/lib/agenda-stock.ts`.
- [x] Endpoint `/api/agenda/bloques` reescrito para stock semanal.
- [x] Flujo de sugerencia automática de semana siguiente en formulario de pedido.
- [x] Integración de contacto por WhatsApp cuando no hay stock.
- [x] Admin: campo stock semanal en formulario y listado con reservados.

### Fase 7: Pulido, rediseño visual y navegación móvil
- [x] Responsive básico en todas las páginas principales.
- [x] Navbar responsive con logout.
- [x] Foto/video de muestra por producto en formulario, catálogo, kanban y video modal.
- [x] Paleta marrón/crema/dorado y tipografía serif en Tailwind.
- [x] Navegación inferior fija en móvil (`BottomNav`).
- [ ] Revisión fina en tablet/celular para kanban y escáner.
- [ ] Limpiar warnings de ESLint (`<img>` en lugar de `Image` de Next.js).
- [ ] Manejo de estados vacíos y mensajes de error amigables.

---

## ⚠️ Decisiones o cambios respecto al plan original

- **Eliminación completa del cashback/fidelización**: se retiraron los modelos `TransaccionPuntos` y `CanjeQR`, el campo `descuentoPuntos` de `Pedido`, y el campo `minimoCanjePuntos` de `ConfiguracionSistema`. El negocio decidió simplificar el modelo y no usar puntos ni canjes; en su lugar se implementa un sistema de reservas por stock semanal con venta exclusiva viernes/sábado.
- **Reemplazo de la regla de 48h hábiles**: la regla de 48 horas hábiles se elimina por completo. El negocio vende únicamente viernes y sábado. Cada producto tiene un stock semanal configurable y, si se agota la semana próxima, el sistema ofrece automáticamente agendar para la semana siguiente o contactar por WhatsApp.
- **Reemplazo de reglas de aceptación configurables**: los límites de unidades por producto por día, total de pedidos por día y corte horario por día quedan obsoletos y se eliminan. El control de capacidad pasa a ser el stock semanal por producto.
- **Next.js 13.5.6 en lugar de 14+**: la versión fijada en `package.json` es `13.5.6`. Funciona correctamente; actualizar a 14+ es opcional y no bloqueante.
- **Prisma `db push` en lugar de migraciones**: se usa `npm run db:push` para sincronizar el schema. No hay migraciones versionadas aún.
- **NextAuth con JWT, sin Prisma Adapter**: aunque `@auth/prisma-adapter` está en `package.json`, no se utiliza. La sesión usa JWT y las credenciales se validan contra la tabla `Usuario` con bcrypt.
- **Gestión de empleados desde UI**: los empleados ahora se crean y gestionan desde `/admin/empleados`. Se agregó el campo `activo` al modelo `Usuario`; los empleados inactivos no pueden iniciar sesión. Los admin siguen creados por seed.
- **Eliminar vs archivar productos**: se agregó el campo `archivado` al modelo `Producto`. Un producto con `archivado=true` queda fuera de los listados activos y no puede solicitarse en nuevos pedidos. Si tiene `ItemPedido` asociados, la eliminación se convierte automáticamente en archivado para preservar la integridad referencial.
- **No-show en el pedido**: se registra `noShow=true` en el pedido. No existe un historial separado de no-shows por cliente; solo se muestra la etiqueta en el pedido afectado.

---

## 🐛 Pendientes / bugs conocidos

- No hay sugerencia automática de semana siguiente cuando un producto no tiene stock.
- Algunos componentes usan `<img>` en lugar de `<Image />` de Next.js, generando warnings.
- `/login` genera advertencia de "deopted to client-side rendering" en build.
- La zona horaria se maneja principalmente con `TZ=America/Panama` y conversiones manuales; conviene auditar que todos los cálculos usen `date-fns-tz` consistentemente.

---

## 📌 Preguntas abiertas / por decidir

- ¿Se generan migraciones de Prisma para producción o se sigue con `db push`?
- ¿Se mantiene SQLite para producción inicial o se migra a PostgreSQL antes del lanzamiento?

---

## 📝 Notas para retomar el contexto rápidamente

El proyecto Dripcake completó un rediseño mayor: se eliminó por completo el cashback/fidelización (puntos, canje, QR de canje), se reemplazó la regla de 48h hábiles por un sistema de stock semanal con venta exclusiva viernes/sábado, se agregó foto/video de muestra por producto, se aplicó un rediseño visual con paleta marrón/crema/dorado y tipografía serif, y se agregó navegación inferior fija en móvil. Además, se implementaron las fases F a I: historial de pedidos para admin, calendario visual de días no laborables, edición de productos con snapshot inmutable en `ItemPedido`, y lightbox de imagen de producto. El build de Next.js pasa correctamente. Antes de continuar, revisar `docs/ESTADO.md` para ver el stack, credenciales de prueba y comandos.
