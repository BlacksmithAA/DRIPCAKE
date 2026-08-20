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
    Subject: 'Sistema de Pedidos y Fidelización',
  },
});

doc.pipe(fs.createWriteStream(outPath));

// ─── Paleta y constantes ─────────────────────────────────────────────────
const COLOR_PRIMARIO = '#974d27';     // drip-700
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
doc.font('Helvetica').fontSize(16).text('Sistema de Pedidos y Fidelización', 60, 165);
doc.fontSize(12).fillColor('#f5e2cd').text('Resumen funcional para el dueño del negocio', 60, 195);

doc.fillColor('#ffffff').fontSize(10).font('Helvetica');
doc.text('Versión 1.0', 60, 260);
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
  'y acumular puntos por cada compra. Los pedidos se organizan en un tablero que vos y tus ' +
  'empleados pueden revisar desde el mostrador.'
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
      'quiere, ve su historial y sus puntos, y muestra un código QR en el mostrador para ' +
      'retirar.',
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
      'Sos quien configura todo: el catálogo de productos, los días que la panadería ' +
      'permanece cerrada, las reglas para aceptar pedidos, y los parámetros del sistema ' +
      'de puntos.',
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
  'Selecciona el día y la hora en que va a venir a retirar. El sistema solo le muestra horarios disponibles.',
  'Confirma el pedido. A partir de ese momento, el pedido queda registrado.',
  'El sistema le entrega un código QR. Ese código es el comprobante para retirar.',
  'El día del retiro, viene al mostrador, muestra su código QR, paga y se lleva su pedido.',
  'Cuando el administrador marca el pedido como pagado, los puntos se suman a su cuenta automáticamente.',
];

pasosCliente.forEach((p, i) => {
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_PRIMARIO).text(`${i + 1}.`, { continued: true });
  doc.font('Helvetica').fillColor(COLOR_TEXTO).text(' ' + p);
  saltar(0.5);
});
saltar();

// ─── Regla de las 48 horas
escribirTexto('La regla de las 48 horas hábiles', { size: 16, color: COLOR_PRIMARIO });
saltar(1);
escribirTexto(
  'Para que la panadería tenga tiempo suficiente de preparar cada pedido, el cliente debe ' +
  'agendar su retiro con al menos 48 horas hábiles de anticipación.'
);
saltar();
escribirTexto(
  '¿Qué significa "horas hábiles"? Que no se cuentan las horas en que la panadería está ' +
  'cerrada. En la práctica:'
);
saltar(0.5);

const reglas48 = [
  'No se cuentan los domingos: la panadería no abre los domingos.',
  'No se cuentan los días feriados ni los días no laborables que vos configures.',
  'El sistema hace el cálculo automáticamente y solo muestra al cliente los horarios que cumplen la regla.',
];

reglas48.forEach((r) => {
  doc.font('Helvetica-Bold').fillColor(COLOR_PRIMARIO).text('•  ', { continued: true });
  doc.font('Helvetica').fillColor(COLOR_TEXTO).text(r);
  saltar(0.4);
});
saltar();

escribirTexto('Ejemplo:', { size: 12, color: COLOR_SECUNDARIO });
saltar(0.3);
escribirTexto(
  'Si un cliente hace un pedido el viernes a las 10 de la mañana, no puede pedir para el ' +
  'domingo (la panadería está cerrada) ni contar ese día dentro de las 48 horas. Recién ' +
  'podría retirar a partir del martes, en el primer horario disponible que el sistema le muestre.'
);
saltar(2);

// ─── Cancelaciones
escribirTexto('Cancelaciones', { size: 16, color: COLOR_PRIMARIO });
saltar(1);
escribirTexto(
  'Un cliente puede cancelar su propio pedido mientras falten más de 48 horas hábiles para ' +
  'el retiro. Si está dentro de esa ventana, el sistema no le permite cancelar desde la ' +
  'app y se le pide que se contacte directamente con la panadería.'
);
saltar(2);

// ─── Sistema de puntos
escribirTexto('Sistema de puntos y fidelización', { size: 16, color: COLOR_PRIMARIO });
saltar(1);

escribirTexto('Cómo se ganan puntos:', { size: 12, color: COLOR_SECUNDARIO });
saltar(0.3);
escribirTexto(
  'Por cada compra, el cliente recibe como cashback el 10% del monto pagado. ' +
  'En concreto, por cada dólar gastado el cliente suma 10 puntos.'
);
saltar();

escribirTexto('Cómo se canjean:', { size: 12, color: COLOR_SECUNDARIO });
saltar(0.3);
escribirTexto(
  'Cada 100 puntos equivalen a un dólar de descuento en una compra futura. El cliente ' +
  'puede generar un código QR de canje desde su perfil, mostrarlo en el mostrador y el ' +
  'descuento se aplica al pedido en curso. Ese código QR vence a los pocos minutos y solo ' +
  'se puede usar una vez.'
);
saltar();

escribirTexto('Cuándo se acreditan los puntos:', { size: 12, color: COLOR_SECUNDARIO });
saltar(0.3);
escribirTexto(
  'Los puntos se suman a la cuenta del cliente únicamente cuando vos o un empleado ' +
  'marcan el pedido como pagado. Esto evita sumar puntos por pedidos cancelados o no retirados.'
);
saltar(2);

// ─── Códigos QR
escribirTexto('Los dos tipos de códigos QR', { size: 16, color: COLOR_PRIMARIO });
saltar(1);

const tablaQR = [
  ['Tipo de QR', '¿Para qué sirve?', '¿Cuándo se usa?'],
  [
    'QR de retiro',
    'Confirmar que el cliente vino a buscar su pedido.',
    'El cliente lo muestra al llegar al mostrador. El empleado lo escanea y el pedido queda marcado como entregado.',
  ],
  [
    'QR de canje',
    'Aplicar un descuento en la compra actual usando los puntos acumulados.',
    'El cliente lo genera desde su perfil cuando quiere gastar sus puntos. Tiene una vigencia corta y se puede usar solo una vez.',
  ],
];

let y = doc.y;
const colXs = [60, 160, 350];
const colW = [100, 190, 180];

// Encabezado
doc.rect(60, y, doc.page.width - 120, 28).fill(COLOR_PRIMARIO);
tablaQR[0].forEach((cell, i) => {
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
  doc.text(cell, colXs[i], y + 9, { width: colW[i] });
});
y += 28;

// Filas
tablaQR.slice(1).forEach((row, idx) => {
  const rowH = idx === 0 ? 50 : 50;
  const bg = idx % 2 === 0 ? '#fdf8f3' : '#ffffff';
  doc.rect(60, y, doc.page.width - 120, rowH).fill(bg);
  doc.strokeColor(COLOR_LINEA).lineWidth(0.5).rect(60, y, doc.page.width - 120, rowH).stroke();
  row.forEach((cell, i) => {
    doc.fillColor(COLOR_TEXTO).font('Helvetica-Bold').fontSize(10);
    if (i === 0) doc.text(cell, colXs[i], y + 8, { width: colW[i] });
    else {
      doc.font('Helvetica').fontSize(9.5);
      doc.text(cell, colXs[i], y + 8, { width: colW[i] });
    }
  });
  y += rowH;
});

doc.y = y + 15;
saltar();

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
  ['Catálogo de productos', 'Agregar, editar, activar o desactivar productos. Cada producto tiene nombre, descripción, precio, unidad de venta (por unidad, por paquete, etc.) y cantidades mínima y máxima por pedido.'],
  ['Días no laborables', 'Cargar feriados, vacaciones o eventualidades. Esos días quedan automáticamente bloqueados para retiros y no se cuentan en las 48 horas hábiles. Podés marcar si se repiten cada año.'],
  ['Reglas de aceptación', 'Activar o desactivar límites: cantidad máxima de unidades por producto por día, cantidad máxima de pedidos por día, o un corte horario para pedidos de un día específico.'],
  ['Mínimo de puntos para canjear', 'Definir cuántos puntos necesita acumular un cliente antes de poder generar un QR de canje.'],
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
  'Integración con WhatsApp o Instagram: en el futuro podrían sumarse como canales adicionales, pero en esta primera versión no.',
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
  ['Fidelización automática', 'El sistema de puntos corre solo. No tenés que llevar una planilla a mano.'],
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
escribirTexto('Dripcake — Sistema de Pedidos y Fidelización · Resumen funcional v1.0', { size: 9, color: COLOR_GRIS });
escribirTexto('Documento de referencia para el dueño del negocio', { size: 9, color: COLOR_GRIS });

doc.end();

console.log('✓ PDF generado en:', outPath);
