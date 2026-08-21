import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatFechaCorta, formatHora, formatMonto } from '@/lib/format';
import { ahoraEnPanama } from '@/lib/reglas-fecha';
import { MarcarNoShowButton } from './MarcarNoShowButton';

export const dynamic = 'force-dynamic';

export default async function NoShowPage() {
  const session = await getServerSession(authOptions);
  const ahora = ahoraEnPanama();

  // Pedidos vencidos y no entregados (fecha de retiro ya pasó, no entregados, no cancelados)
  const vencidos = await prisma.pedido.findMany({
    where: {
      fechaHoraRetiro: { lt: ahora },
      entregado: false,
      estadoTicket: { in: ['recibido', 'en_preparacion', 'listo'] },
    },
    include: { cliente: true, items: true },
    orderBy: { fechaHoraRetiro: 'asc' },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">No-shows del día</h1>
      <p className="text-sm text-cafe-600">
        Pedidos cuya hora de retiro ya pasó y no fueron entregados. Marcarlos como no-show queda
        registrado en el historial del cliente.
      </p>

      {vencidos.length === 0 ? (
        <div className="card text-center py-8 text-cafe-500">No hay pedidos vencidos pendientes.</div>
      ) : (
        <div className="space-y-3">
          {vencidos.map((p) => (
            <div key={p.id} className="card flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{p.cliente.nombre} · {p.cliente.telefono}</div>
                <div className="text-sm text-cafe-600">
                  Retiro: {formatFechaCorta(p.fechaHoraRetiro)} a las {formatHora(p.fechaHoraRetiro)}
                </div>
                <ul className="text-xs text-cafe-700 mt-1">
                  {p.items.map((it) => (
                    <li key={it.id}>{it.cantidad}× {it.nombreProducto}</li>
                  ))}
                </ul>
                <div className="text-sm font-medium mt-1">{formatMonto(p.costoTotal)}</div>
              </div>
              <MarcarNoShowButton pedidoId={p.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
