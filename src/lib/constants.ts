// Tipos auxiliares compartidos

export type RolUsuario = 'cliente' | 'empleado' | 'admin';

export type EstadoTicket =
  | 'recibido'
  | 'en_preparacion'
  | 'listo'
  | 'entregado'
  | 'cancelado'
  | 'no_retirado';

export const ESTADOS_TICKET: { value: EstadoTicket; label: string; color: string }[] = [
  { value: 'recibido', label: 'Recibido', color: 'bg-crema-200 text-cafe-800' },
  { value: 'en_preparacion', label: 'En preparación', color: 'bg-amber-100 text-amber-800' },
  { value: 'listo', label: 'Listo para retiro', color: 'bg-blue-100 text-blue-800' },
  { value: 'entregado', label: 'Entregado', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  { value: 'no_retirado', label: 'No retirado', color: 'bg-cafe-200 text-cafe-800' },
];

export function etiquetaEstado(estado: string): string {
  return ESTADOS_TICKET.find((e) => e.value === estado)?.label ?? estado;
}

export function colorEstado(estado: string): string {
  return ESTADOS_TICKET.find((e) => e.value === estado)?.color ?? 'bg-crema-200 text-cafe-800';
}
