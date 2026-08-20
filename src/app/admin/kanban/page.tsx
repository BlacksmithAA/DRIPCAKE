import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { KanbanBoard } from './KanbanBoard';

export const dynamic = 'force-dynamic';

export default async function KanbanPage() {
  const session = await getServerSession(authOptions);
  const rol = (session!.user as any).rol;

  const pedidos = await prisma.pedido.findMany({
    where: {
      estadoTicket: { in: ['recibido', 'en_preparacion', 'listo', 'no_retirado'] },
    },
    include: {
      cliente: true,
      items: { include: { producto: true } },
    },
    orderBy: { fechaHoraRetiro: 'asc' },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Tablero de pedidos</h1>
        <p className="text-sm text-slate-600">Total activos: {pedidos.length}</p>
      </div>
      <KanbanBoard
        initialPedidos={pedidos.map((p) => ({
          id: p.id,
          estadoTicket: p.estadoTicket,
          cliente: { nombre: p.cliente.nombre, telefono: p.cliente.telefono },
          fechaHoraRetiro: p.fechaHoraRetiro.toISOString(),
          costoTotal: p.costoTotal,
          descuentoPuntos: p.descuentoPuntos,
          pagado: p.pagado,
          entregado: p.entregado,
          noShow: p.noShow,
          qrRetiroToken: p.qrRetiroToken,
          items: p.items.map((it) => ({
            cantidad: it.cantidad,
            producto: { nombre: it.producto.nombre, unidadVenta: it.producto.unidadVenta },
          })),
        }))}
        rol={rol}
      />
    </div>
  );
}
