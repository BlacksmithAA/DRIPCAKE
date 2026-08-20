import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatFechaCorta, formatHora, formatMonto } from '@/lib/format';
import { etiquetaEstado, colorEstado, EstadoTicket } from '@/lib/constants';
import { LinkMisQR } from './LinkMisQR';
import { CancelarButton } from './CancelarButton';
import { ahoraEnPanama, validar48hHabiles } from '@/lib/reglas-fecha';

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
  const session = await getServerSession(authOptions);
  const clienteId = (session!.user as any).id;

  const pedidos = await prisma.pedido.findMany({
    where: { clienteId },
    include: { items: { include: { producto: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Para cada pedido, evaluar si se puede cancelar
  const pedidosConCancelable = await Promise.all(
    pedidos.map(async (p) => {
      const val = await validar48hHabiles(p.fechaHoraRetiro, ahoraEnPanama());
      return { ...p, puedeCancelar: val.valido && p.estadoTicket !== 'entregado' && p.estadoTicket !== 'cancelado' };
    })
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mis pedidos</h1>
        <a href="/pedidos/nuevo" className="btn-primary">+ Nuevo pedido</a>
      </div>

      {pedidosConCancelable.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4">Todavía no tenés pedidos.</p>
          <a href="/pedidos/nuevo" className="btn-primary">Hacé tu primer pedido</a>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosConCancelable.map((p) => (
            <article key={p.id} className="card">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="text-sm text-slate-500">
                    Retiro: {formatFechaCorta(p.fechaHoraRetiro)} a las {formatHora(p.fechaHoraRetiro)}
                  </div>
                  <div className="font-semibold text-slate-900">
                    {formatMonto(p.costoTotal)}
                    {p.descuentoPuntos > 0 && (
                      <span className="text-xs text-emerald-600 ml-2">
                        (desc. {formatMonto(p.descuentoPuntos)})
                      </span>
                    )}
                  </div>
                </div>
                <span className={`badge ${colorEstado(p.estadoTicket)}`}>
                  {etiquetaEstado(p.estadoTicket)}
                </span>
              </div>

              <ul className="text-sm text-slate-700 mb-3 space-y-0.5">
                {p.items.map((it) => (
                  <li key={it.id}>
                    {it.cantidad}× {it.producto.nombre} — {formatMonto(it.subtotal)}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2 text-xs">
                  <span className={`badge ${p.pagado ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                    {p.pagado ? '✓ Pagado' : 'Sin pagar'}
                  </span>
                  <span className={`badge ${p.entregado ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                    {p.entregado ? '✓ Entregado' : 'No entregado'}
                  </span>
                </div>

                <div className="flex gap-2">
                  {p.estadoTicket !== 'entregado' && p.estadoTicket !== 'cancelado' && (
                    <LinkMisQR token={p.qrRetiroToken} />
                  )}
                  {p.puedeCancelar && <CancelarButton pedidoId={p.id} />}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
