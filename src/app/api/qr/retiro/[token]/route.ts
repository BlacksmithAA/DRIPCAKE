// POST /api/qr/retiro/:token — Escaneo de QR de retiro: marca el pedido como entregado

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

  const pedido = await prisma.pedido.findUnique({
    where: { qrRetiroToken: params.token },
    include: { cliente: true },
  });

  if (!pedido) {
    return NextResponse.json({ error: 'QR no válido o no encontrado' }, { status: 404 });
  }
  if (pedido.entregado) {
    return NextResponse.json({ message: 'Este pedido ya fue entregado' }, { status: 400 });
  }
  if (pedido.estadoTicket === 'cancelado') {
    return NextResponse.json({ error: 'Este pedido está cancelado' }, { status: 400 });
  }

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { entregado: true, estadoTicket: 'entregado' },
  });

  return NextResponse.json({
    ok: true,
    message: `Entregado a ${pedido.cliente.nombre}`,
  });
}
