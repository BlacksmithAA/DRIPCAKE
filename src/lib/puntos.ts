// Sistema de cashback — Lógica de puntos
// Regla: 10% de cashback por compra → 100 puntos = $1
// Fórmula: puntos ganados = monto de la compra en USD × 10

export const PUNTOS_POR_DOLAR = 10;
export const PUNTOS_POR_DOLAR_CANJE = 100; // 100 puntos = $1 de descuento

/**
 * Calcula los puntos ganados por una compra.
 */
export function calcularPuntosGanados(montoUSD: number): number {
  return Math.floor(montoUSD * PUNTOS_POR_DOLAR);
}

/**
 * Convierte puntos a descuento en USD.
 */
export function puntosADescuento(puntos: number): number {
  return puntos / PUNTOS_POR_DOLAR_CANJE;
}

/**
 * Convierte USD a puntos (para el camino inverso).
 */
export function descuentoAPuntos(usd: number): number {
  return Math.ceil(usd * PUNTOS_POR_DOLAR_CANJE);
}

/**
 * Calcula el saldo de puntos de un cliente a partir de sus transacciones.
 */
export function calcularSaldoPuntos(
  transacciones: { tipo: string; montoPuntos: number }[]
): number {
  return transacciones.reduce((acc, t) => {
    return acc + (t.tipo === 'ganado' ? t.montoPuntos : -t.montoPuntos);
  }, 0);
}
