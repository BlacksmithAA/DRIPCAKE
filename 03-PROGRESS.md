# Progreso del proyecto — Sistema de Pedidos y Fidelización (Panadería)

> Este archivo debe mantenerse actualizado por OpenCode al final de cada sesión de trabajo.
> Referencia funcional: `01-documento-requerimientos.md`
> Referencia técnica y estado rápido: `docs/ESTADO.md`

Última actualización: 11/08/2026

---

## Estado general

| Fase | Estado | % avance |
|---|---|---|
| Fase 0 — Setup del proyecto | ✅ Completo | 100% |
| Fase 1 — Modelo de datos y catálogo | ✅ Completo | 95% |
| Fase 2 — Pedidos y agenda | ✅ Completo | 90% |
| Fase 3 — Panel administrativo (kanban) | ✅ Completo | 95% |
| Fase 4 — Escaneo de QR | ✅ Completo | 95% |
| Fase 5 — Loyalty (cashback) | ✅ Completo | 90% |
| Fase 6 — Reglas de negocio configurables | 🔄 En progreso | 40% |
| Fase 7 — Pulido y responsive | 🔄 En progreso | 70% |

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
- Agenda de retiro con bloques de horario (8:00–18:00).
- Regla de 48h hábiles respetando domingos y días no laborables.
- Generación automática de QR de retiro al crear pedido.
- Cancelación de pedidos si faltan más de 48h hábiles.

### Fase 3: Panel administrativo (kanban) — Agosto 2026
- Vista kanban en `/admin/kanban` con dnd-kit.
- Tarjetas con cliente, teléfono, hora de retiro, descripción, costo, pago y entrega.
- Toggle manual de pagado/entregado.
- Marcado manual de no-show en `/admin/no-show`.

### Fase 4: Escaneo de QR — Agosto 2026
- Escáner de cámara en `/admin/escaner` con `html5-qrcode`.
- QR de retiro → marca pedido como entregado.
- QR de canje → valida token temporal, aplica descuento y descuenta puntos.
- Ruta pública `/qr/[tipo]/[token]` redirige al escáner.

### Fase 5: Loyalty (cashback) — Agosto 2026
- Cálculo de puntos al marcar pedido como pagado (`monto × 10`).
- Saldo de puntos visible en `/perfil`.
- Generación de QR de canje con expiración de 10 minutos y un solo uso.
- Mínimo de canje configurable desde `/admin/configuracion`.

---

## 🔄 En progreso

### Fase 6: Reglas de negocio configurables
- [x] Panel de configuración UI en `/admin/configuracion`.
- [x] Persistencia de reglas en `ConfiguracionSistema`.
- [x] Regla de límite total de pedidos por día (evaluada en `/api/agenda/bloques`).
- [ ] Regla de límite de unidades por producto por día.
- [ ] Regla de corte horario por día.
- [ ] Sugerir alternativas disponibles más cercanas cuando una fecha queda bloqueada.

### Fase 7: Pulido y responsive
- [x] Responsive básico en todas las páginas principales.
- [x] Navbar responsive con logout.
- [ ] Revisión fina en tablet/celular para kanban y escáner.
- [ ] Limpiar warnings de ESLint (`<img>` en lugar de `Image` de Next.js).
- [ ] Manejo de estados vacíos y mensajes de error amigables.

---

## ⚠️ Decisiones o cambios respecto al plan original

- **Next.js 13.5.6 en lugar de 14+**: la versión fijada en `package.json` es `13.5.6`. Funciona correctamente; actualizar a 14+ es opcional y no bloqueante.
- **Prisma `db push` en lugar de migraciones**: se usa `npm run db:push` para sincronizar el schema. No hay migraciones versionadas aún.
- **NextAuth con JWT, sin Prisma Adapter**: aunque `@auth/prisma-adapter` está en `package.json`, no se utiliza. La sesión usa JWT y las credenciales se validan contra la tabla `Usuario` con bcrypt.
- **Gestión de empleados desde UI**: los empleados ahora se crean y gestionan desde `/admin/empleados`. Se agregó el campo `activo` al modelo `Usuario`; los empleados inactivos no pueden iniciar sesión. Los admin siguen creados por seed.
- **Eliminar vs archivar productos**: se agregó el campo `archivado` al modelo `Producto`. Un producto con `archivado=true` queda fuera de los listados activos y no puede solicitarse en nuevos pedidos. Si tiene `ItemPedido` asociados, la eliminación se convierte automáticamente en archivado para preservar la integridad referencial.
- **No-show en el pedido**: se registra `noShow=true` en el pedido. No existe un historial separado de no-shows por cliente; solo se muestra la etiqueta en el pedido afectado.
- **Cashback se reversa al desmarcar pago**: al desmarcar un pedido como pagado se elimina la transacción `ganado` asociada. Esto simplifica la lógica pero pierde trazabilidad del movimiento.

---

## 🐛 Pendientes / bugs conocidos

- Las reglas de **límite de unidades por producto por día** y **corte horario** están en la base de datos pero no se aplican en la lógica de negocio.
- No hay sugerencia automática de alternativas cuando una fecha queda bloqueada.
- No se puede **editar** productos desde la UI (crear, activar/desactivar y eliminar/archivar sí están disponibles).
- Algunos componentes usan `<img>` en lugar de `<Image />` de Next.js, generando warnings.
- `/login` genera advertencia de "deopted to client-side rendering" en build.
- La zona horaria se maneja principalmente con `TZ=America/Panama` y conversiones manuales; conviene auditar que todos los cálculos usen `date-fns-tz` consistentemente.

---

## 📌 Preguntas abiertas / por decidir

- ¿Se implementa **edición** de productos desde la UI o es suficiente con eliminar/archivar y volver a crear?
- ¿Se prioriza terminar las reglas de negocio configurables (Fase 6) o el pulido responsive (Fase 7)?
- ¿Se generan migraciones de Prisma para producción o se sigue con `db push`?
- ¿Se mantiene SQLite para producción inicial o se migra a PostgreSQL antes del lanzamiento?

---

## 📝 Notas para retomar el contexto rápidamente

El proyecto Dripcake tiene sus flujos principales funcionando: clientes pueden registrarse, hacer pedidos, ver puntos y generar QR de canje; admin/empleados pueden gestionar pedidos en kanban, escanear QRs y marcar no-shows. En esta sesión se agregaron la **gestión de empleados desde `/admin/empleados`** y la **eliminación/archivado de productos** con protección de integridad. El trabajo pendiente se concentra en completar la **Fase 6 (reglas de negocio configurables)**, conectar la **sugerencia de alternativas** cuando una fecha está bloqueada, y el **pulido final** del responsive. Antes de continuar, revisar `docs/ESTADO.md` para ver el stack, credenciales de prueba y comandos.
