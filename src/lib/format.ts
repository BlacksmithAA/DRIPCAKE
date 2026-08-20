// Helpers de formato

export function formatMonto(usd: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usd);
}

export function formatFechaCorta(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-PA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatHora(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-PA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}
