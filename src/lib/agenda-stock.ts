// Lógica de agenda y stock semanal
// El negocio vende únicamente viernes y sábado.
// Cada producto tiene un stock semanal configurable.
// El stock disponible se calcula en tiempo real sumando ItemPedido de pedidos activos
// cuya fechaHoraRetiro caiga dentro de esa semana (viernes+sábado).

import { addDays, startOfDay, isFriday, isSameDay } from 'date-fns';
import { toZonedTime, formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { TIMEZONE } from './timezone';
import { prisma } from './prisma';
import { esDiaNoLaborable, generarBloquesDelDia } from './reglas-fecha';

export const MAX_SEMANAS_A_BUSCAR = 6;
export const HORA_APERTURA = 8;
export const HORA_CIERRE = 18;
export const DURACION_BLOQUE_MINUTOS = 60;

export type SemanaVenta = {
  viernes: Date;
  sabado: Date;
  label: string;
};

export type DisponibilidadSemana = {
  stockTotal: number | null; // null = sin control de stock
  reservado: number;
  disponible: number; // Infinity representado como Number.POSITIVE_INFINITY
};

/**
 * Devuelve el inicio (viernes) y fin (sábado) de la semana de venta que contiene una fecha.
 * La semana de venta se define como viernes y sábado.
 */
export function semanaDeVentaQueContiene(fecha: Date): { inicio: Date; fin: Date } {
  const panama = toZonedTime(fecha, TIMEZONE);
  const dia = panama.getDay(); // 0=dom, ..., 5=vie, 6=sab

  let offsetViernes = 0;
  if (dia === 5) offsetViernes = 0; // viernes
  else if (dia === 6) offsetViernes = -1; // sábado
  else offsetViernes = 5 - dia; // próximo viernes

  const viernes = startOfDay(addDays(panama, offsetViernes));
  const sabado = addDays(viernes, 1);

  return {
    inicio: dePanamaAInstant(viernes),
    fin: new Date(dePanamaAInstant(addDays(sabado, 1)).getTime() - 1),
  };
}

function dePanamaAInstant(fechaLocalPanama: Date): Date {
  return fromZonedTime(fechaLocalPanama, TIMEZONE);
}

/**
 * Devuelve una lista de fechas de viernes y sábado hacia adelante,
 * saltando los días marcados como no laborables.
 */
export async function obtenerProximosDiasVenta(cantidadSemanas: number = MAX_SEMANAS_A_BUSCAR): Promise<Date[]> {
  const hoy = startOfDay(ahoraEnPanamaParaCalculos());
  const dias: Date[] = [];

  // Encontrar el primer viernes desde hoy (incluyendo hoy si es viernes)
  let cursor = new Date(hoy);
  while (cursor.getDay() !== 5) {
    cursor = addDays(cursor, 1);
  }

  let semanasEncontradas = 0;
  while (semanasEncontradas < cantidadSemanas) {
    const viernes = new Date(cursor);
    const sabado = addDays(viernes, 1);

    const viernesLaborable = !(await esDiaNoLaborable(viernes));
    const sabadoLaborable = !(await esDiaNoLaborable(sabado));

    if (viernesLaborable || sabadoLaborable) {
      semanasEncontradas++;
    }

    if (viernesLaborable) dias.push(dePanamaAInstant(viernes));
    if (sabadoLaborable) dias.push(dePanamaAInstant(sabado));

    cursor = addDays(cursor, 7); // siguiente viernes
  }

  return dias;
}

/**
 * Calcula la disponibilidad de un producto para la semana que comienza en fechaViernes.
 * Si stockSemanal es null, disponible es Infinity.
 */
export async function calcularDisponibilidad(
  productoId: string,
  fechaViernes: Date
): Promise<DisponibilidadSemana> {
  const producto = await prisma.producto.findUnique({ where: { id: productoId } });
  const stockTotal = producto?.stockSemanal ?? null;

  const inicio = startOfDay(fechaViernes);
  const fin = addDays(inicio, 2); // domingo 00:00 (exclusivo)

  const reservado = await prisma.itemPedido.aggregate({
    where: {
      productoId,
      pedido: {
        fechaHoraRetiro: { gte: inicio, lt: fin },
        estadoTicket: { not: 'cancelado' },
      },
    },
    _sum: { cantidad: true },
  });

  const cantidadReservada = reservado._sum.cantidad ?? 0;
  const disponible = stockTotal === null ? Number.POSITIVE_INFINITY : Math.max(0, stockTotal - cantidadReservada);

  return {
    stockTotal,
    reservado: cantidadReservada,
    disponible,
  };
}

/**
 * Evalúa la semana más próxima con disponibilidad suficiente para la cantidad solicitada.
 * Retorna la semana sugerida y un flag esSemanaActual.
 */
export async function determinarSemanaParaPedido(
  productoId: string,
  cantidadSolicitada: number
): Promise<{ semana: SemanaVenta; esSemanaActual: boolean } | null> {
  const diasVenta = await obtenerProximosDiasVenta(MAX_SEMANAS_A_BUSCAR);
  if (diasVenta.length === 0) return null;

  // Agrupar por semanas
  const semanas: SemanaVenta[] = [];
  for (const dia of diasVenta) {
    const panama = toZonedTime(dia, TIMEZONE);
    if (isFriday(panama)) {
      semanas.push({
        viernes: dia,
        sabado: addDays(dia, 1),
        label: formatInTimeZone(dia, TIMEZONE, "dd 'de' MMMM"),
      });
    }
  }

  const primeraSemana = semanas[0];

  for (let i = 0; i < semanas.length; i++) {
    const semana = semanas[i];
    const disp = await calcularDisponibilidad(productoId, semana.viernes);
    if (disp.disponible >= cantidadSolicitada) {
      return { semana, esSemanaActual: isSameDay(semana.viernes, primeraSemana.viernes) };
    }
  }

  return null;
}

/**
 * Devuelve los bloques de horario disponibles para un producto y semana,
 * considerando el stock semanal ya reservado.
 */
export async function obtenerBloquesParaSemana(
  productoId: string,
  fechaViernes: Date,
  cantidadSolicitada: number
): Promise<{ viernes: Date[]; sabado: Date[]; semana: SemanaVenta }> {
  const semana: SemanaVenta = {
    viernes: fechaViernes,
    sabado: addDays(fechaViernes, 1),
    label: formatInTimeZone(fechaViernes, TIMEZONE, "dd 'de' MMMM"),
  };

  const disp = await calcularDisponibilidad(productoId, fechaViernes);
  if (disp.disponible < cantidadSolicitada) {
    return { viernes: [], sabado: [], semana };
  }

  const [viernes, sabado] = await Promise.all([
    generarBloquesDelDia(semana.viernes, HORA_APERTURA, HORA_CIERRE, DURACION_BLOQUE_MINUTOS),
    generarBloquesDelDia(semana.sabado, HORA_APERTURA, HORA_CIERRE, DURACION_BLOQUE_MINUTOS),
  ]);

  return { viernes, sabado, semana };
}

/**
 * Para un carrito de productos, determina la semana más próxima en la que TODOS
 * los productos tengan stock suficiente.
 */
export async function determinarSemanaParaCarrito(
  items: { productoId: string; cantidad: number }[]
): Promise<{ semana: SemanaVenta; esSemanaActual: boolean } | null> {
  const diasVenta = await obtenerProximosDiasVenta(MAX_SEMANAS_A_BUSCAR);
  if (diasVenta.length === 0) return null;

  const semanas: SemanaVenta[] = [];
  for (const dia of diasVenta) {
    const panama = toZonedTime(dia, TIMEZONE);
    if (isFriday(panama)) {
      semanas.push({
        viernes: dia,
        sabado: addDays(dia, 1),
        label: formatInTimeZone(dia, TIMEZONE, "dd 'de' MMMM"),
      });
    }
  }

  if (semanas.length === 0) return null;
  const primeraSemana = semanas[0];

  for (const semana of semanas) {
    const todosTienenStock = await Promise.all(
      items.map(async (it) => {
        const disp = await calcularDisponibilidad(it.productoId, semana.viernes);
        return disp.disponible >= it.cantidad;
      })
    );

    if (todosTienenStock.every(Boolean)) {
      return { semana, esSemanaActual: isSameDay(semana.viernes, primeraSemana.viernes) };
    }
  }

  return null;
}

function ahoraEnPanamaParaCalculos(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Devuelve el viernes de la semana de venta actual (o próxima si hoy es domingo-martes).
 * Útil para mostrar indicadores de stock en el admin.
 */
export async function semanaVentaActual(): Promise<Date> {
  const hoy = ahoraEnPanamaParaCalculos();
  const dias = await obtenerProximosDiasVenta(1);
  if (dias.length === 0) return dePanamaAInstant(startOfDay(hoy));
  const primerViernes = dias.find((d) => isFriday(toZonedTime(d, TIMEZONE)));
  return primerViernes ?? dias[0];
}
