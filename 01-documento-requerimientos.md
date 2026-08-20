# Documento de Requerimientos
## Sistema de Pedidos y Fidelización — Panadería (Pan de Masa Madre)

**Versión:** 1.0
**Fecha:** Agosto 2026
**Zona horaria del sistema:** America/Panama (UTC-5), fija para todo el sistema, sin excepción.

---

## 1. Resumen ejecutivo

Web app responsive para gestionar pedidos estandarizados de panadería (inicialmente pan de masa madre, con visión de expansión a más productos), permitiendo a los clientes autogestionar sus pedidos y reduciendo la carga operativa que hoy recae en WhatsApp. Incluye un sistema de fidelización tipo cashback y confirmación de entregas y canjes mediante códigos QR.

### 1.1 Objetivo del proyecto

Descargar de WhatsApp los pedidos que son repetibles y estandarizados (sin personalización), dejando ese canal disponible únicamente para pedidos personalizados y atención puntual. El sistema debe permitir que el cliente pida, agende su retiro, pague en el mostrador y acumule cashback, todo sin intervención manual del administrador salvo para confirmar pago y entrega.

### 1.2 Fuera de alcance (por ahora)

- Pedidos personalizados (seguirán gestionándose por WhatsApp).
- Pasarela de pago en línea.
- Aplicación móvil nativa (se descarta explícitamente a favor de web responsive).
- Integración directa con WhatsApp/Instagram (posible a futuro, la arquitectura debe permitirlo sin rediseño).

---

## 2. Roles de usuario

| Rol | Descripción | Permisos |
|---|---|---|
| **Cliente** | Usuario final que hace pedidos | Auto-registro, ver/crear pedidos, ver perfil y puntos, generar QR de canje y de retiro, cancelar pedidos (según regla de 48h) |
| **Empleado** | Personal operativo | Acceso solo al panel kanban: marcar pagado/entregado, escanear QRs (entrega y canje), marcar no-show |
| **Administrador principal** | Dueño del negocio | Acceso total: todo lo del empleado + gestión de menú, reglas de aceptación, días no laborables, mínimo de canje, y demás configuración |

---

## 3. Módulos funcionales

### 3.1 Catálogo de productos

- Cada producto tiene: nombre, descripción, precio, **unidad de venta** (ej. "unidad", "paquete de 12"), disponibilidad (activo/inactivo).
- La unidad de venta es configurable por producto — no todos se venden igual (ej. pan de masa madre por unidad, baguette por paquete de 12).
- Cada producto define su propia cantidad mínima y máxima por pedido.
- El catálogo es extensible: agregar un nuevo producto no requiere cambios de código, solo configuración desde el panel admin.

### 3.2 Pedidos

- El cliente selecciona uno o más productos del catálogo, con cantidades dentro de los límites definidos por producto (sin personalización).
- Cada pedido incluye: cliente, ítems (producto + cantidad), fecha/hora de retiro, costo total, estado de pago, estado de entrega, estado del ticket (columna kanban).
- El pedido genera automáticamente un **QR de retiro** asociado.

### 3.3 Agenda de retiro (estilo calendario tipo Teams)

- El cliente selecciona la fecha/hora de retiro desde una vista de calendario con bloques de horario disponibles (no texto libre).
- **Regla de anticipación: mínimo 48 horas hábiles** entre el momento del pedido y la hora de retiro seleccionada.
  - El conteo de horas **se salta domingos y días no laborables** (ver 3.4).
  - Ejemplo: un pedido hecho el viernes no puede agendarse para el domingo (cerrado) ni contar esas horas dentro del cálculo de 48h.
- El negocio permanece **cerrado los domingos**: no se ofrecen bloques de retiro ese día bajo ninguna circunstancia.
- Toda la lógica de fechas/horas opera en **hora de Panamá**, sin importar la zona horaria del dispositivo del cliente.

### 3.4 Días no laborables (tabla de configuración)

Tabla editable por el administrador con los siguientes campos:

| Campo | Descripción |
|---|---|
| Fecha | Día específico no laborable |
| Tipo | Feriado / Vacaciones / Eventualidad |
| Descripción | Texto libre (ej. "Día de la Independencia") |
| Recurrente | Sí/No — si se repite cada año en la misma fecha |

Esta tabla alimenta tanto el cálculo de las 48 horas hábiles como la disponibilidad de bloques en el calendario de retiro.

### 3.5 Reglas de aceptación de pedidos

- Modo por defecto: **sin límite**, se acepta todo pedido que cumpla la regla de 48h.
- El administrador puede activar reglas adicionales, de forma independiente entre sí:
  - Límite de unidades por producto por día.
  - Límite total de pedidos por día.
  - Corte de horario para pedidos de un día específico.
- Si una regla activa bloquea una fecha/producto, el sistema debe ofrecer al cliente las alternativas disponibles más cercanas.

### 3.6 Cancelación de pedidos

- El cliente puede cancelar su propio pedido **solo si faltan más de 48 horas** para la hora de retiro acordada.
- Dentro de esa ventana, la cancelación queda bloqueada desde el perfil del cliente (debe contactar directamente al negocio).

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

### 3.8 Sistema de fidelización (cashback)

- **Regla de acumulación:** 10% de cashback por compra → **100 puntos = $1**. Fórmula: `puntos ganados = monto de la compra en USD × 10`.
- Los puntos se acreditan **únicamente cuando el pedido queda marcado como Pagado por el administrador** (no antes, para evitar acreditar por pedidos cancelados o no retirados).
- El cliente ve su saldo de puntos en su perfil.
- **Mínimo de canje:** configurable por el administrador (valor por definir).
- El canje se realiza mediante el **QR de canje** (ver 3.9).

### 3.9 Códigos QR — dos flujos independientes

| QR | Generado por | Propósito | Al escanear (admin/empleado) | Duración |
|---|---|---|---|---|
| **QR de retiro/entrega** | Sistema, junto con el pedido | Confirmar que el cliente retiró su pedido en el mostrador | Marca el pedido como **Entregado** | Válido hasta el retiro o expiración del pedido |
| **QR de canje de puntos** | El cliente, on-demand desde su perfil | Canjear puntos acumulados por descuento en la compra actual | Aplica el descuento y descuenta los puntos del saldo | Token temporal, corta duración, un solo uso (evita replicación/reutilización) |

El pago sigue siendo confirmado manualmente por el administrador en todos los casos — el QR de entrega **no** marca el pago automáticamente, son acciones separadas.

### 3.10 Registro y autenticación

- Clientes: auto-registro (nombre, teléfono, email, contraseña).
- Administrador principal y empleados: cuentas creadas/gestionadas internamente (no auto-registro), con roles diferenciados en permisos.

---

## 4. Modelo de datos (entidades principales)

- **Usuario**: id, nombre, teléfono, email, contraseña (hash), rol (cliente / empleado / admin)
- **Producto**: id, nombre, descripción, precio, unidad_venta, cantidad_min, cantidad_max, activo
- **DiaNoLaborable**: id, fecha, tipo (feriado/vacaciones/eventualidad), descripción, recurrente
- **Pedido**: id, cliente_id, fecha_hora_retiro, estado_ticket, pagado (bool), entregado (bool), no_show (bool), costo_total, qr_retiro_token
- **ItemPedido**: id, pedido_id, producto_id, cantidad, subtotal
- **TransaccionPuntos**: id, cliente_id, tipo (ganado/canjeado), monto_puntos, pedido_id (nullable), fecha
- **CanjeQR**: id, cliente_id, token, puntos_solicitados, estado (pendiente/completado/expirado), fecha_expiracion
- **ConfiguracionSistema**: reglas de aceptación activas, mínimo de canje, y demás parámetros configurables

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
- Expiración de puntos acumulados.

---

## 7. Estado de implementación (resumen técnico)

> Esta sección documenta qué tan alineado está el código actual con los requerimientos anteriores. Se actualiza al final de cada sesión de trabajo. Ver detalles en `03-PROGRESS.md` y referencia rápida en `docs/ESTADO.md`.

### Implementado ✅
- Auto-registro de clientes y login con roles (`cliente`, `empleado`, `admin`).
- Catálogo de productos configurable (crear, activar/desactivar, eliminar/archivar).
- Creación de pedidos con cantidades min/max por producto.
- Agenda de retiro con bloques de horario y regla de 48h hábiles.
- Gestión de días no laborables recurrentes.
- Panel kanban con estados, pago, entrega y no-show.
- Generación de QR de retiro y QR de canje.
- Escáner de QR desde cámara.
- Sistema de cashback (10 %) y canje de puntos.
- Configuración del sistema (mínimo de canje y reglas de aceptación on/off).

### Parcialmente implementado ⚠️
- **Reglas de aceptación de pedidos (3.5):**
  - Límite total de pedidos por día: evaluado en disponibilidad de bloques, pero aún no sugiere alternativas.
  - Límite de unidades por producto por día: persistido en config, no aplicado.
  - Corte horario por día: persistido en config, no aplicado.
- **No-show en historial del cliente (3.7):** se marca en el pedido y se muestra en kanban, pero no existe una vista de historial acumulado por cliente.

### No implementado ❌
- **Edición** de productos desde la UI (crear, activar/desactivar y eliminar/archivar sí están implementados).
- Sugerencia automática de alternativas cuando una fecha/producto está bloqueado.
- Migraciones versionadas de Prisma (se usa `prisma db push`).

### Decisiones técnicas relevantes
- NextAuth usa **JWT** en lugar de Prisma Adapter.
- Las cuentas de **admin se crean por seed**; los empleados ahora se crean/gestionan desde `/admin/empleados`.
- Al desmarcar un pedido como pagado se **elimina** la transacción de puntos ganados (sin historial de reversión).
- Los productos con pedidos históricos no se eliminan; se **archivan** (`archivado=true`) para preservar la integridad referencial.
- Base de datos SQLite en archivo local; migración a PostgreSQL es directa cambiando `DATABASE_URL`.
