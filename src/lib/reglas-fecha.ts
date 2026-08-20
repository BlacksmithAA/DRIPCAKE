// Reglas de fecha/hora — Núcleo de la lógica de agendamiento
// Manejo de:
//  - Zona horaria fija America/Panama
//  - Días no laborables (tabla DB + domingos fijos)
//  - Regla de 48h hábiles
//  - Bloques de horario disponibles para retiro

import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { addDays, addHours, isBefore, isEqual, startOfDay, isSameDay } from 'date-fns';
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
 * Esta es la "fecha real" que usa todo el sistema, no la del dispositivo del cliente.
 */
export function ahoraEnPanama(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

/**
 * Convierte un objeto Date (que se asume UTC o naive) a un Date que representa
 * el mismo instante de pared en America/Panama.
 *
 * Caso típico: el cliente selecciona "2026-08-10 10:00" en el calendario.
 * Queremos guardar el instante UTC que corresponde a las 10:00 hora Panamá de ese día.
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
 * Considera:
 *  - Domingos (regla fija)
 *  - Días no laborables cargados en la tabla DiaNoLaborable
 */
export async function esDiaNoLaborable(fecha: Date): Promise<boolean> {
  const fechaPanama = toZonedTime(fecha, TIMEZONE);
  const dia = startOfDay(fechaPanama);

  // Regla fija: domingos
  if (DIAS_NO_LABORABLES_FIJOS.includes(dia.getDay())) return true;

  // Buscar en la tabla
  const inicio = new Date(dia);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(dia);
  fin.setHours(23, 59, 59, 999);

  // Buscar coincidencia exacta o recurrente por mes/día
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
 * Valida si una hora de retiro cumple la regla de las 48 horas hábiles.
 * El conteo se salta domingos y días no laborables.
 *
 * @param fechaHoraRetiro fecha/hora objetivo de retiro
 * @param ahora fecha actual (en hora Panamá)
 * @returns { valido: boolean, horasReales: number, mensaje?: string }
 */
export async function validar48hHabiles(
  fechaHoraRetiro: Date,
  ahora: Date = ahoraEnPanama()
): Promise<{ valido: boolean; horasReales: number; mensaje?: string }> {
  if (!isBefore(ahora, fechaHoraRetiro)) {
    return { valido: false, horasReales: 0, mensaje: 'La hora de retiro debe ser futura' };
  }

  // Contar horas hábiles entre `ahora` y `fechaHoraRetiro`,
  // saltando domingos y días no laborables.
  let horasAcumuladas = 0;
  let cursor = new Date(ahora);

  // Si hay menos de 48h brutas, igual verificamos que hayan pasado 48h hábiles
  // Caso simple: si la diferencia bruta es >= 48h y la fecha de retiro NO es
  // un día no laborable, la regla se cumple. Pero si está justo en el límite
  // o cruza un día no laborable, hay que iterar.

  // Estrategia: avanzamos hora por hora desde `ahora` hasta `fechaHoraRetiro`,
  // contando solo las horas que caen en días laborables.
  const targetMs = fechaHoraRetiro.getTime();
  const horasTotales = Math.ceil((targetMs - ahora.getTime()) / (1000 * 60 * 60));

  // Cache de "es laborable" por día para no consultar la DB en cada iteración
  const cacheDias: Record<string, boolean> = {};

  for (let h = 0; h < horasTotales; h++) {
    const horaEvaluada = addHours(ahora, h);
    const diaKey = formatInTimeZone(horaEvaluada, TIMEZONE, 'yyyy-MM-dd');

    if (!(diaKey in cacheDias)) {
      cacheDias[diaKey] = !(await esDiaNoLaborable(horaEvaluada));
    }

    if (cacheDias[diaKey]) {
      horasAcumuladas++;
    }
  }

  if (horasAcumuladas < 48) {
    return {
      valido: false,
      horasReales: horasAcumuladas,
      mensaje: `Se requieren 48 horas hábiles de anticipación (solo hay ${horasAcumuladas}h disponibles)`,
    };
  }

  return { valido: true, horasReales: horasAcumuladas };
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
 * Devuelve la primera fecha/hora disponible para retiro,
 * respetando la regla de 48h hábiles.
 * Útil para sugerirle al cliente cuándo puede retirar lo más pronto posible.
 */
export async function proximaFechaDisponible(
  diasAConsultar: number = 14
): Promise<Date | null> {
  const ahora = ahoraEnPanama();

  for (let i = 2; i < diasAConsultar; i++) {
    const dia = addDays(ahora, i);
    if (await esDiaNoLaborable(dia)) continue;

    // Primer bloque del día: 8:00 hora Panamá
    const diaPanama = toZonedTime(dia, TIMEZONE);
    const candidato = new Date(diaPanama);
    candidato.setHours(8, 0, 0, 0);

    const validacion = await validar48hHabiles(dePanamaAInstant(candidato), ahora);
    if (validacion.valido) return dePanamaAInstant(candidato);
  }

  return null;
}

/**
 * Sugiere fechas alternativas cuando la fecha solicitada no está disponible.
 * Busca los N días laborables más cercanos hacia adelante.
 */
export async function sugerirAlternativas(
  fechaOriginal: Date,
  cantidad: number = 3
): Promise<Date[]> {
  const alternativas: Date[] = [];
  let cursor = addDays(fechaOriginal, 1);

  for (let i = 0; i < 30 && alternativas.length < cantidad; i++) {
    if (!(await esDiaNoLaborable(cursor))) {
      const diaPanama = toZonedTime(cursor, TIMEZONE);
      const candidato = new Date(diaPanama);
      candidato.setHours(10, 0, 0, 0);
      alternativas.push(dePanamaAInstant(candidato));
    }
    cursor = addDays(cursor, 1);
  }

  return alternativas;
}
