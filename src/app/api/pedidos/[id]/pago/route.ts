// POST /api/pedidos/:id/pago — Toggle manual de pagado
// Al pasar de no pagado → pagado, acredita los puntos (10% del monto) al cliente.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calcularPuntosGanados } from '@/lib/puntos';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const rol = (session.user as any).rol;
  if (rol !== 'admin' && rol !== 'empleado') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const pedido = await prisma.pedido.findUnique({ where: { id: params.id } });
  if (!pedido) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const nuevoPagado = !pedido.pagado;
  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { pagado: nuevoPagado },
  });

  // Si acabamos de marcar como pagado, acreditar puntos
  if (nuevoPagado) {
    const montoNeto = pedido.costoTotal - pedido.descuentoPuntos;
    const puntos = calcularPuntosGanados(Math.max(0, montoNeto));
    if (puntos > 0) {
      await prisma.transaccionPuntos.create({
        data: {
          clienteId: pedido.clienteId,
          tipo: 'ganado',
          montoPuntos: puntos,
          pedidoId: pedido.id,
          descripcion: `Cashback por pedido #${pedido.id.slice(0, 8)}`,
        },
      });
    }
  } else {
    // Si desmarcamos, eliminar la transacción de puntos asociada
    await prisma.transaccionPuntos.deleteMany({
      where: { pedidoId: pedido.id, tipo: 'ganado' },
    });
  }

  return NextResponse.json({ ok: true, pagado: nuevoPagado });
}
