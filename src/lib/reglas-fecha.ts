// Helpers de fecha/hora y días no laborables
// Zona horaria fija America/Panama

import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { startOfDay, isSameDay, addDays } from 'date-fns';
import { TIMEZONE, DIAS_NO_LABORABLES_FIJOS } from './timezone';
import { prisma } from './prisma';

export type DiaNoLaborable = {
  fecha: Date;
  tipo: string;
  descripcion: string;
  recurrente: boolean;
};

/**
 * Devuelve la fecha/hora actual en la zona horaria de Panamá.
 */
export function ahoraEnPanama(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Convierte un objeto Date (naive/UTC) a un Date que representa el mismo instante de pared en America/Panama.
 */
export function dePanamaAInstant(fechaLocalPanama: Date): Date {
  return fromZonedTime(fechaLocalPanama, TIMEZONE);
}

/**
 * Formatea una fecha para mostrar al usuario, siempre en hora Panamá.
 */
export function formatearEnPanama(fecha: Date, formato: string = "yyyy-MM-dd HH:mm"): string {
  return formatInTimeZone(fecha, TIMEZONE, formato);
}

/**
 * Determina si una fecha dada (en hora Panamá) es un día no laborable.
 * Considera domingos y días cargados en DiaNoLaborable.
 */
export async function esDiaNoLaborable(fecha: Date): Promise<boolean> {
  const fechaPanama = toZonedTime(fecha, TIMEZONE);
  const dia = startOfDay(fechaPanama);

  // Regla fija: domingos
  if (DIAS_NO_LABORABLES_FIJOS.includes(dia.getDay())) return true;

  const inicio = startOfDay(dia);
  const fin = new Date(inicio);
  fin.setHours(23, 59, 59, 999);

  const registros = await prisma.diaNoLaborable.findMany({
    where: {
      OR: [
        { fecha: { gte: inicio, lte: fin } },
        { recurrente: true },
      ],
    },
  });

  for (const r of registros) {
    const f = toZonedTime(r.fecha, TIMEZONE);
    if (r.recurrente) {
      if (f.getMonth() === dia.getMonth() && f.getDate() === dia.getDate()) return true;
    } else {
      if (isSameDay(f, dia)) return true;
    }
  }

  return false;
}

/**
 * Genera los bloques de horario disponibles para un día específico (en hora Panamá).
 * Por defecto: bloques de 1 hora entre 8:00 y 18:00, respetando días no laborables.
 */
export async function generarBloquesDelDia(
  fecha: Date,
  horaApertura: number = 8,
  horaCierre: number = 18,
  duracionBloqueMinutos: number = 60
): Promise<Date[]> {
  if (await esDiaNoLaborable(fecha)) return [];

  const fechaPanama = toZonedTime(fecha, TIMEZONE);
  const bloques: Date[] = [];

  for (let h = horaApertura; h < horaCierre; h++) {
    for (let m = 0; m < 60; m += duracionBloqueMinutos) {
      const bloque = new Date(fechaPanama);
      bloque.setHours(h, m, 0, 0);
      bloques.push(dePanamaAInstant(bloque));
    }
  }

  return bloques;
}

/**
 * Avanza día a día hasta encontrar un día laborable.
 */
export async function proximoDiaLaborable(desde: Date = ahoraEnPanama()): Promise<Date> {
  let cursor = new Date(desde);
  while (await esDiaNoLaborable(cursor)) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}
