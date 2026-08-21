// Generación y validación de tokens QR de retiro

import crypto from 'crypto';

/**
 * Genera un token único e impredecible para el QR de retiro de un pedido.
 */
export function generarTokenQR(): string {
  const random = crypto.randomBytes(24).toString('hex');
  return `rt_${random}`;
}

/**
 * Hash para invalidar tokens de un solo uso sin guardar el token plano.
 * (opcional — para un sistema más estricto)
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Valida formato básico de un token QR de retiro.
 */
export function esTokenValido(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  return token.startsWith('rt_') && token.length > 10;
}
