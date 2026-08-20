// POST /api/qr/canje/:token — Escaneo de QR de canje: aplica descuento a pedido activo del cliente
//
// Comportamiento: el canje se descuenta del pedido más reciente del cliente que aún no esté pagado.
// Si el cliente no tiene un pedido pendiente, devuelve error.
// Al aplicar, marca el CanjeQR como completado y descuenta los puntos.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const rol = (session.user as any).rol;
  if (rol !== 'admin' && rol !== 'empleado') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const canje = await prisma.canjeQR.findUnique({ where: { token: params.token } });
  if (!canje) {
    return NextResponse.json({ error: 'QR de canje no válido' }, { status: 404 });
  }
  if (canje.estado !== 'pendiente') {
    return NextResponse.json({ error: 'Este QR de canje ya fue utilizado o expiró' }, { status: 400 });
  }
  if (new Date(canje.fechaExpiracion) < new Date()) {
    await prisma.canjeQR.update({ where: { id: canje.id }, data: { estado: 'expirado' } });
    return NextResponse.json({ error: 'Este QR de canje expiró' }, { status: 400 });
  }

  // Encontrar el pedido más reciente no pagado y no cancelado del cliente
  const pedido = await prisma.pedido.findFirst({
    where: {
      clienteId: canje.clienteId,
      pagado: false,
      estadoTicket: { in: ['recibido', 'en_preparacion', 'listo'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!pedido) {
    return NextResponse.json({
      error: 'El cliente no tiene pedidos pendientes. Aplicá el descuento manualmente.',
    }, { status: 400 });
  }

  // Aplicar descuento al pedido
  await prisma.pedido.update({
    where: { id: pedido.id },
    data: {
      descuentoPuntos: canje.descuentoUSD,
      costoTotal: Math.max(0, pedido.costoTotal - canje.descuentoUSD),
    },
  });

  // Descontar puntos del cliente
  await prisma.transaccionPuntos.create({
    data: {
      clienteId: canje.clienteId,
      tipo: 'canjeado',
      montoPuntos: canje.puntosSolicitados,
      pedidoId: pedido.id,
      descripcion: `Canje de puntos en pedido #${pedido.id.slice(0, 8)}`,
    },
  });

  // Marcar el canje como completado
  await prisma.canjeQR.update({
    where: { id: canje.id },
    data: { estado: 'completado', usadoEn: new Date() },
  });

  return NextResponse.json({
    ok: true,
    message: `Descuento de $${canje.descuentoUSD.toFixed(2)} aplicado al pedido #${pedido.id.slice(0, 8)}`,
    descuentoUSD: canje.descuentoUSD,
  });
}
