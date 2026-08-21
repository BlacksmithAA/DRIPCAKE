// POST /api/pedidos/:id/pago — Toggle manual de pagado

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

  return NextResponse.json({ ok: true, pagado: nuevoPagado });
}
