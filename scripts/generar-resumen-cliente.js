// Genera un PDF con el resumen no técnico del sistema Dripcake
// Dirigido al dueño del negocio.
// Ejecutar: node scripts/generar-resumen-cliente.js
// Salida: docs/resumen-no-tecnico-dripcake.pdf

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'resumen-no-tecnico-dripcake.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 70, bottom: 60, left: 60, right: 60 },
  info: {
    Title: 'Dripcake — Resumen del Sistema',
    Author: 'Dripcake',
    Subject: 'Sistema de Pedidos',
  },
});

doc.pipe(fs.createWriteStream(outPath));

// ─── Paleta y constantes ─────────────────────────────────────────────────
const COLOR_PRIMARIO = '#74402d';     // cafe-700
const COLOR_SECUNDARIO = '#5a4630';
const COLOR_TEXTO = '#1f1f1f';
const COLOR_GRIS = '#555555';
const COLOR_LINEA = '#d4b896';

const escribirTexto = (texto, opciones = {}) => {
  doc.font('Helvetica').fontSize(opciones.size || 11).fillColor(opciones.color || COLOR_TEXTO);
  doc.text(texto, opciones);
};

const linea = (y, color = COLOR_LINEA) => {
  doc.strokeColor(color).lineWidth(0.7).moveTo(60, y).lineTo(doc.page.width - 60, y).stroke();
};

const saltar = (n = 1) => { for (let i = 0; i < n; i++) doc.moveDown(0.5); };

// ─── Portada ─────────────────────────────────────────────────────────────
doc.rect(0, 0, doc.page.width, 320).fill(COLOR_PRIMARIO);

doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(38).text('Dripcake', 60, 110);
doc.font('Helvetica').fontSize(16).text('Sistema de Pedidos', 60, 165);
doc.fontSize(12).fillColor('#f5e2cd').text('Resumen funcional para el dueño del negocio', 60, 195);

doc.fillColor('#ffffff').fontSize(10).font('Helvetica');
doc.text('Versión 2.0', 60, 260);
doc.text('Agosto 2026', 60, 275);

doc.fillColor('#1f1f1f');
doc.moveDown(8);
escribirTexto('Panadería Dripcake', { size: 11, color: COLOR_GRIS });
doc.text('Documento de referencia', { size: 11, color: COLOR_GRIS });

doc.addPage();

// ─── Contenido ───────────────────────────────────────────────────────────

// Título principal
escribirTexto('¿Qué es Dripcake?', { size: 20, color: COLOR_PRIMARIO });
saltar(1);
linea(doc.y);
saltar(1);

escribirTexto(
  'Dripcake es un sistema web que permite a tus clientes hacer pedidos de pan estandarizado ' +
  'desde su celular o computadora, agendar el día y la hora en que van a pasar a retirar, ' +
  'y ver el catálogo de productos con foto y video de muestra. Los pedidos se organizan en ' +
  'un tablero que vos y tus empleados pueden revisar desde el mostrador.'
);
saltar();
escribirTexto(
  'El objetivo es simple: que los pedidos repetitivos dejen de llegar por WhatsApp y pasen ' +
  'a un canal ordenado. Así WhatsApp queda libre para los pedidos personalizados y la ' +
  'atención puntual.'
);
saltar(2);

// ─── ¿A quién está dirigido?
escribirTexto('¿Quiénes usan el sistema?', { size: 16, color: COLOR_PRIMARIO });
saltar(1);

const roles = [
  {
    titulo: 'El cliente',
    descripcion:
      'Es la persona que quiere comprar pan. Se registra una sola vez, hace pedidos cuando ' +
      'quiere, ve su historial y muestra un código QR en el mostrador para retirar.',
  },
  {
    titulo: 'El empleado',
    descripcion:
      'Trabaja en el mostrador. Desde el sistema marca los pedidos como pagados y ' +
      'entregados, y escanea los códigos QR de los clientes para confirmar retiros.',
  },
  {
    titulo: 'El administrador (vos)',
    descripcion:
      'Sos quien configura todo: el catálogo de productos, el stock semanal de cada producto, ' +
      'los días que la panadería permanece cerrada, el número de WhatsApp de contacto y los empleados.',
  },
];

roles.forEach((r) => {
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_SECUNDARIO).text(r.titulo);
  saltar(0.3);
  escribirTexto(r.descripcion);
  saltar();
});
saltar();

// ─── ¿Cómo hace un pedido el cliente?
escribirTexto('¿Cómo hace un pedido un cliente?', { size: 16, color: COLOR_PRIMARIO });
saltar(1);

const pasosCliente = [
  'Se registra con su nombre, teléfono, email y una contraseña.',
  'Elige los productos que quiere comprar, por ejemplo, pan de masa madre o baguette.',
  'El sistema le ofrece automáticamente el próximo viernes o sábado con stock disponible.',
  'Selecciona el bloque de horario en el que va a venir a retirar.',
  'Confirma el pedido. A partir de ese momento, el pedido queda registrado.',
  'El sistema le entrega un código QR. Ese código es el comprobante para retirar.',
  'El día del retiro, viene al mostrador, muestra su código QR, paga y se lleva su pedido.',
];

pasosCliente.forEach((p, i) => {
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_PRIMARIO).text(`${i + 1}.`, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_TEXTO).text(' ' + p);
  saltar(0.5);
});
saltar();

// ─── Stock semanal y venta viernes/sábado
escribirTexto('Stock semanal y venta viernes/sábado', { size: 16, color: COLOR_PRIMARIO });
saltar(1);
escribirTexto(
  'La panadería vende únicamente viernes y sábado. Cada producto tiene un stock semanal ' +
  'configurable: la cantidad disponible para esa semana de venta.'
);
saltar();
escribirTexto(
  'El stock se calcula en tiempo real. Cada vez que un cliente hace un pedido, el sistema ' +
  'suma las cantidades ya reservadas y le muestra solo los horarios de la semana que aún ' +
  'tiene disponibilidad. Si se agota el stock de la semana próxima, el sistema ofrece ' +
  'automáticamente agendar para la semana siguiente.'
);
saltar();
escribirTexto(
  'Si un cliente no quiere esperar a la siguiente semana, puede contactar directamente al ' +
  'negocio por WhatsApp desde el mismo formulario de pedido.'
);
saltar(2);

// ─── Cancelaciones
escribirTexto('Cancelaciones', { size: 16, color: COLOR_PRIMARIO });
saltar(1);
escribirTexto(
  'Un cliente puede cancelar su propio pedido mientras la fecha y hora de retiro aún no ' +
  'hayan comenzado. Si el pedido ya está vencido o en curso, el sistema le pide que se ' +
  'contacte directamente con la panadería.'
);
saltar(2);

// ─── Códigos QR
escribirTexto('Código QR de retiro', { size: 16, color: COLOR_PRIMARIO });
saltar(1);

escribirTexto(
  'Cada pedido genera un código QR único. El cliente lo muestra en el mostrador al llegar ' +
  'a retirar. Vos o un empleado lo escanean con la cámara del celular o tablet, y el pedido ' +
  'queda marcado automáticamente como entregado. El QR de retiro es válido hasta que el ' +
  'cliente retire el pedido o el pedido se cancele.'
);
saltar(2);

// ─── Lo que ve el empleado / administrador
escribirTexto('El tablero de pedidos (kanban)', { size: 16, color: COLOR_PRIMARIO });
saltar(1);
escribirTexto(
  'Vos y tus empleados trabajan sobre un tablero visual con cuatro columnas:'
);
saltar(0.5);

const columnas = [
  ['Recibido', 'Pedidos recién confirmados que todavía no se empezaron a preparar.'],
  ['En preparación', 'Pedidos que están en proceso de amasado, fermentación u horneado.'],
  ['Listo para retiro', 'Pedidos terminados, esperando que el cliente venga a buscarlos.'],
  ['No retirado', 'Pedidos cuya fecha y hora de retiro ya pasó y el cliente no se presentó.'],
];

columnas.forEach(([t, d]) => {
  doc.font('Helvetica-Bold').fillColor(COLOR_PRIMARIO).text(t + ': ', { continued: true });
  doc.font('Helvetica').fillColor(COLOR_TEXTO).text(d);
  saltar(0.4);
});
saltar();

escribirTexto(
  'Cada tarjeta muestra el nombre del cliente, su teléfono, la hora de retiro, el detalle ' +
  'del pedido, el monto a cobrar, y dos botones: uno para marcar el pago y otro para marcar ' +
  'la entrega. Esos botones son independientes: un pedido puede estar pagado pero todavía ' +
  'no entregado, y viceversa.'
);
saltar(2);

// ─── No-shows
escribirTexto('¿Qué pasa si el cliente no viene a retirar?', { size: 16, color: COLOR_PRIMARIO });
saltar(1);
escribirTexto(
  'Al final del día, vos o un empleado pueden revisar los pedidos cuya hora de retiro ya ' +
  'pasó y marcarlos como "no retirado". Esto queda registrado en el historial del cliente ' +
  'como una etiqueta visible, pero no lo bloquea ni lo penaliza. Sirve para tener ' +
  'contexto la próxima vez que ese cliente haga un pedido.'
);
saltar(2);

// ─── Configuración
escribirTexto('¿Qué podés configurar vos como administrador?', { size: 16, color: COLOR_PRIMARIO });
saltar(1);

const configItems = [
  ['Catálogo de productos', 'Agregar, activar o desactivar productos. Cada producto tiene nombre, descripción, precio, unidad de venta, cantidades mínima y máxima por pedido, stock semanal, foto y video de muestra.'],
  ['Stock semanal', 'Definir cuántas unidades de cada producto están disponibles por semana (viernes + sábado). Dejar vacío si un producto no tiene límite de stock.'],
  ['Días no laborables', 'Cargar feriados, vacaciones o eventualidades. Esos días quedan automáticamente bloqueados para retiros. Podés marcar si se repiten cada año.'],
  ['WhatsApp de contacto', 'Número al que se dirigirán los clientes cuando un producto no tenga stock disponible y prefieran contactar directamente.'],
];

configItems.forEach(([t, d]) => {
  doc.font('Helvetica-Bold').fillColor(COLOR_SECUNDARIO).text(t);
  saltar(0.2);
  doc.font('Helvetica').fillColor(COLOR_TEXTO).text(d);
  saltar();
});
saltar();

// ─── Lo que NO está incluido
escribirTexto('¿Qué cosas NO están incluidas (por ahora)?', { size: 16, color: COLOR_PRIMARIO });
saltar(1);

const noIncluidos = [
  'Pedidos personalizados: siguen llegando por WhatsApp, como hasta ahora.',
  'Pago en línea: el pago siempre se hace en el mostrador, en efectivo o por el medio que decidas. No hay integración con tarjeta, Yappy ni otras pasarelas.',
  'App móvil nativa: el sistema se usa desde cualquier navegador, en celular, tablet o computadora. No hay que descargar nada.',
  'Integración con WhatsApp o Instagram: en el futuro podrían sumarse como canales adicionales, pero en esta versión no.',
];

noIncluidos.forEach((n) => {
  doc.font('Helvetica-Bold').fillColor(COLOR_PRIMARIO).text('✗  ', { continued: true });
  doc.font('Helvetica').fillColor(COLOR_TEXTO).text(n);
  saltar(0.4);
});
saltar(2);

// ─── Beneficios
escribirTexto('¿Qué gana la panadería con este sistema?', { size: 16, color: COLOR_PRIMARIO });
saltar(1);

const beneficios = [
  ['Menos WhatsApp', 'Los pedidos repetitivos y estandarizados salen de WhatsApp. Tu número queda libre para pedidos personalizados y consultas puntuales.'],
  ['Pedidos organizados', 'Cada pedido tiene un estado claro: recibido, en preparación, listo o no retirado. Nada se pierde.'],
  ['Historial por cliente', 'Podés ver qué pidió cada cliente, si retiró, si pagó, y si tiene historial de no-shows.'],
  ['Stock controlado', 'El stock semanal evita sobreventas y te permite planificar la producción con anticipación.'],
  ['Pago en el mostrador', 'El cliente paga siempre en el local. No hay dinero pasando por la plataforma. Vos mantenés tu forma de cobro.'],
  ['Funciona en cualquier dispositivo', 'El sistema está pensado para usarse desde el mostrador con una tablet o un celular, sin instalar nada.'],
];

beneficios.forEach(([t, d]) => {
  doc.font('Helvetica-Bold').fillColor(COLOR_SECUNDARIO).text('✓  ' + t, { continued: false });
  saltar(0.2);
  doc.font('Helvetica').fillColor(COLOR_TEXTO).text(d, { indent: 16 });
  saltar(0.5);
});
saltar();

// ─── Pie de página
linea(doc.y);
saltar(0.5);
escribirTexto('Dripcake — Sistema de Pedidos · Resumen funcional v2.0', { size: 9, color: COLOR_GRIS });
escribirTexto('Documento de referencia para el dueño del negocio', { size: 9, color: COLOR_GRIS });

doc.end();

console.log('✓ PDF generado en:', outPath);
