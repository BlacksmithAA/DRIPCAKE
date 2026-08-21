# Documento de Requerimientos
## Sistema de Pedidos — Panadería (Pan de Masa Madre)

**Versión:** 2.0
**Fecha:** Agosto 2026
**Zona horaria del sistema:** America/Panama (UTC-5), fija para todo el sistema, sin excepción.

---

## 1. Resumen ejecutivo

Web app responsive para gestionar pedidos estandarizados de panadería (inicialmente pan de masa madre, con visión de expansión a más productos), permitiendo a los clientes autogestionar sus pedidos y reduciendo la carga operativa que hoy recae en WhatsApp. Incluye confirmación de entregas mediante códigos QR.

### 1.1 Objetivo del proyecto

Descargar de WhatsApp los pedidos que son repetibles y estandarizados (sin personalización), dejando ese canal disponible únicamente para pedidos personalizados y atención puntual. El sistema debe permitir que el cliente pida, agende su retiro y pague en el mostrador, todo sin intervención manual del administrador salvo para confirmar pago y entrega.

### 1.2 Fuera de alcance (por ahora)

- Pedidos personalizados (seguirán gestionándose por WhatsApp).
- Pasarela de pago en línea.
- Aplicación móvil nativa (se descarta explícitamente a favor de web responsive).
- Integración directa con WhatsApp/Instagram (posible a futuro, la arquitectura debe permitirlo sin rediseño).

---

## 2. Roles de usuario

| Rol | Descripción | Permisos |
|---|---|---|
| **Cliente** | Usuario final que hace pedidos | Auto-registro, ver/crear pedidos, ver perfil, generar QR de retiro, cancelar pedidos |
| **Empleado** | Personal operativo | Acceso solo al panel kanban: marcar pagado/entregado, escanear QR de retiro, marcar no-show |
| **Administrador principal** | Dueño del negocio | Acceso total: todo lo del empleado + gestión de menú, stock semanal, días no laborables, WhatsApp de contacto, y demás configuración |

---

## 3. Módulos funcionales

### 3.1 Catálogo de productos

- Cada producto tiene: nombre, descripción, precio, **unidad de venta** (ej. "unidad", "paquete de 12"), cantidad mínima/máxima, stock semanal, foto de muestra, video de muestra y disponibilidad (activo/inactivo).
- La unidad de venta es configurable por producto — no todos se venden igual (ej. pan de masa madre por unidad, baguette por paquete de 12).
- Cada producto define su propia cantidad mínima y máxima por pedido.
- El stock semanal controla cuántas unidades de ese producto están disponibles por semana (viernes + sábado).
- La foto y el video de muestra son visibles para el cliente al hacer el pedido y para el personal en el kanban y el menú admin.
- El catálogo es extensible: agregar un nuevo producto no requiere cambios de código, solo configuración desde el panel admin.

### 3.2 Pedidos

- El cliente selecciona uno o más productos del catálogo, con cantidades dentro de los límites definidos por producto (sin personalización).
- Cada pedido incluye: cliente, ítems (producto + cantidad), fecha/hora de retiro, costo total, estado de pago, estado de entrega, estado del ticket (columna kanban).
- El pedido genera automáticamente un **QR de retiro** asociado.

### 3.3 Agenda de retiro (venta viernes/sábado)

- El negocio vende y entrega únicamente **viernes y sábados**.
- El cliente selecciona la fecha/hora de retiro desde bloques de horario disponibles (no texto libre).
- Cada producto tiene un **stock semanal configurable** (cantidad disponible para la semana de viernes + sábado).
- El stock disponible se calcula en tiempo real sumando las cantidades de `ItemPedido` de pedidos activos (no cancelados) cuya `fechaHoraRetiro` caiga dentro de esa semana.
- Si el stock de la semana más próxima se agota para algún producto del carrito, el sistema ofrece automáticamente agendar para la **semana siguiente**.
- Si el cliente no quiere esperar a la siguiente semana, puede contactar al negocio por **WhatsApp** (`whatsappContacto` en configuración).
- El negocio permanece **cerrado los domingos** y los días no laborables: no se ofrecen bloques de retiro esos días.
- Toda la lógica de fechas/horas opera en **hora de Panamá**, sin importar la zona horaria del dispositivo del cliente.

### 3.4 Días no laborables (tabla de configuración)

Tabla editable por el administrador con los siguientes campos:

| Campo | Descripción |
|---|---|
| Fecha | Día específico no laborable |
| Tipo | Feriado / Vacaciones / Eventualidad |
| Descripción | Texto libre (ej. "Día de la Independencia") |
| Recurrente | Sí/No — si se repite cada año en la misma fecha |

Esta tabla alimenta la disponibilidad de bloques en el calendario de retiro (días cerrados se omiten).

### 3.5 Reglas de aceptación de pedidos (stock semanal)

- El control de capacidad se realiza mediante **stock semanal por producto**.
- Cada producto puede tener un `stockSemanal` configurado; si es `null`, no tiene límite de stock.
- No existen reglas independientes de límite de unidades por producto por día, límite total de pedidos por día ni corte horario por día — quedan reemplazadas por el stock semanal.
- Si un producto no tiene stock para la semana próxima, el sistema ofrece automáticamente la semana siguiente con disponibilidad.

### 3.6 Cancelación de pedidos

- El cliente puede cancelar su propio pedido siempre que la fecha/hora de retiro **aún no haya comenzado** y el pedido no esté entregado ni cancelado.
- Si el pedido ya está vencido o en curso, la cancelación queda bloqueada desde el perfil del cliente (debe contactar directamente al negocio).

### 3.7 Panel administrativo — Kanban de tickets

- Vista kanban con columnas por estado del pedido (ej. Recibido → En preparación → Listo para retiro → Entregado / Cancelado / No retirado).
- Cada tarjeta (ticket) muestra:
  - Nombre del cliente
  - Teléfono
  - Hora de retiro acordada
  - Descripción del pedido (producto[s] + cantidad)
  - Costo total
  - Estado de pago (Pagado / Sin pagar) — **toggle manual**, sin pasarela
  - Estado de entrega (Entregado / No entregado)
- El estado de pago y el de entrega son independientes entre sí (un pedido puede estar listo sin estar pagado, por ejemplo).
- **No-show**: al final del día, el administrador o empleado marca manualmente como "No retirado" los pedidos vencidos sin entregar. Esto se registra en el historial del cliente como una etiqueta visible (no bloquea ni penaliza), para dar contexto en futuros pedidos.

### 3.8 Sistema de fidelización (cashback) — ELIMINADO

> **Estado:** Esta funcionalidad fue eliminada de la versión actual del sistema.
>
> El sistema ya no utiliza puntos, cashback, canje ni QR de canje. El negocio priorizó un modelo de venta por stock semanal (viernes y sábado) en lugar de fidelización por puntos. Ver sección 3.3 y 3.5 para el nuevo modelo de agenda.
>
> **Historial (solo referencia):** en versiones anteriores se acumulaba 10% de cashback (`100 pts = $1`), con acreditación al marcar pagado y canje mediante QR temporal.

### 3.9 Código QR de retiro

| QR | Generado por | Propósito | Al escanear (admin/empleado) | Duración |
|---|---|---|---|---|
| **QR de retiro/entrega** | Sistema, junto con el pedido | Confirmar que el cliente retiró su pedido en el mostrador | Marca el pedido como **Entregado** | Válido hasta el retiro o expiración del pedido |

> **QR de canje de puntos:** eliminado junto con el sistema de fidelización (ver 3.8).

El pago sigue siendo confirmado manualmente por el administrador — el QR de entrega **no** marca el pago automáticamente, son acciones separadas.

### 3.10 Registro y autenticación

- Clientes: auto-registro (nombre, teléfono, email, contraseña).
- Administrador principal y empleados: cuentas creadas/gestionadas internamente (no auto-registro), con roles diferenciados en permisos.

---

## 4. Modelo de datos (entidades principales)

- **Usuario**: id, nombre, teléfono, email, contraseña (hash), rol (cliente / empleado / admin)
- **Producto**: id, nombre, descripción, precio, unidad_venta, cantidad_min, cantidad_max, stock_semanal, imagen_url, video_url, activo
- **DiaNoLaborable**: id, fecha, tipo (feriado/vacaciones/eventualidad), descripción, recurrente
- **Pedido**: id, cliente_id, fecha_hora_retiro, estado_ticket, pagado (bool), entregado (bool), no_show (bool), costo_total, qr_retiro_token
- **ItemPedido**: id, pedido_id, producto_id, cantidad, subtotal
- **ConfiguracionSistema**: whatsapp_contacto

---

## 5. Requisitos no funcionales

- **Responsive**: debe adaptarse correctamente a celulares, tablets y computadoras de escritorio, ya que el administrador probablemente use tablet/celular para escanear QRs en el mostrador.
- **Zona horaria fija**: America/Panama en todo cálculo de fecha/hora, independientemente del dispositivo del cliente.
- **Sin app nativa**: acceso 100% vía navegador web.
- **Arquitectura desacoplada**: la lógica de negocio (pedidos, reglas, puntos) debe vivir en una API independiente del frontend, de forma que en el futuro se puedan sumar otros canales (ej. WhatsApp) sin reconstruir el sistema.
- **Extensibilidad de catálogo**: agregar productos nuevos no debe requerir cambios de código.

---

## 6. Consideraciones futuras (no incluidas en esta fase)

- Pedidos personalizados dentro del mismo sistema.
- Pasarela de pago en línea (tarjeta, Yappy, etc.).
- Notificaciones automáticas (email/SMS/WhatsApp) por cambio de estado del pedido.
- Integración con WhatsApp/Instagram como canal adicional de pedido.

---

## 7. Estado de implementación (resumen técnico)

> Esta sección documenta qué tan alineado está el código actual con los requerimientos anteriores. Se actualiza al final de cada sesión de trabajo. Ver detalles en `03-PROGRESS.md` y referencia rápida en `docs/ESTADO.md`.

### Implementado ✅
- Auto-registro de clientes y login con roles (`cliente`, `empleado`, `admin`).
- Catálogo de productos configurable (crear, activar/desactivar, eliminar/archivar) con foto/video de muestra.
- Creación de pedidos con cantidades min/max por producto.
- Agenda de retiro con bloques de horario y venta exclusiva viernes/sábado.
- Stock semanal por producto (reemplaza reglas de límite por día).
- Gestión de días no laborables recurrentes.
- Panel kanban con estados, pago, entrega y no-show.
- Generación de QR de retiro.
- Escáner de QR desde cámara.
- Configuración del sistema (WhatsApp de contacto).
- Navegación inferior fija en móvil.
- Rediseño visual con paleta marrón/crema/dorado y tipografía serif.

### Parcialmente implementado ⚠️
- **No-show en historial del cliente (3.7):** se marca en el pedido y se muestra en kanban, pero no existe una vista de historial acumulado por cliente.

### No implementado ❌
- **Edición** de productos desde la UI (crear, activar/desactivar y eliminar/archivar sí están implementados).
- Migraciones versionadas de Prisma (se usa `prisma db push`).

### Funcionalidades eliminadas de esta versión ❌
- Sistema de fidelización / cashback / puntos.
- QR de canje de puntos.
- Regla de 48 horas hábiles (reemplazada por stock semanal con venta viernes/sábado).
- Límites configurables de unidades por producto por día, total de pedidos por día y corte horario por día (reemplazados por stock semanal).

### Decisiones técnicas relevantes
- NextAuth usa **JWT** en lugar de Prisma Adapter.
- Las cuentas de **admin se crean por seed**; los empleados ahora se crean/gestionan desde `/admin/empleados`.
- Los productos con pedidos históricos no se eliminan; se **archivan** (`archivado=true`) para preservar la integridad referencial.
- Base de datos SQLite en archivo local; migración a PostgreSQL es directa cambiando `DATABASE_URL`.
- El stock disponible se calcula en tiempo real sumando `ItemPedido` de pedidos activos en la semana de retiro, sin mantener un contador separado.
