// POST /api/pedidos/:id/cancelar — Cliente cancela su pedido (>48h hábiles)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validar48hHabiles, ahoraEnPanama } from '@/lib/reglas-fecha';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const clienteId = (session.user as any).id;
  const pedido = await prisma.pedido.findUnique({ where: { id: params.id } });

  if (!pedido) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  if (pedido.clienteId !== clienteId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  if (pedido.estadoTicket === 'entregado' || pedido.estadoTicket === 'cancelado') {
    return NextResponse.json({ error: 'No se puede cancelar este pedido' }, { status: 400 });
  }

  const validacion = await validar48hHabiles(pedido.fechaHoraRetiro, ahoraEnPanama());
  if (!validacion.valido) {
    return NextResponse.json(
      { error: 'Dentro de la ventana de 48h hábiles, contactanos para cancelar' },
      { status: 400 }
    );
  }

  await prisma.pedido.update({
    where: { id: pedido.id },
    data: { estadoTicket: 'cancelado' },
  });

  return NextResponse.json({ ok: true });
}
