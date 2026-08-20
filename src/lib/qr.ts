// Generación y validación de tokens QR
// Dos tipos: QR de retiro (asociado al pedido) y QR de canje (temporal, on-demand)

import crypto from 'crypto';

export type TipoQR = 'retiro' | 'canje';

/**
 * Genera un token único e impredecible para un QR.
 */
export function generarTokenQR(tipo: TipoQR): string {
  const random = crypto.randomBytes(24).toString('hex');
  const prefijo = tipo === 'retiro' ? 'rt' : 'cj';
  return `${prefijo}_${random}`;
}

/**
 * Hash para invalidar tokens de un solo uso sin guardar el token plano.
 * (opcional — para un sistema más estricto)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Valida formato básico de un token QR.
 */
export function esTokenValido(token: string, tipo: TipoQR): boolean {
  if (!token || typeof token !== 'string') return false;
  const prefijo = tipo === 'retiro' ? 'rt' : 'cj';
  return token.startsWith(`${prefijo}_`) && token.length > 10;
}
