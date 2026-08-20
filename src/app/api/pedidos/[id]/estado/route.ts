// POST /api/pedidos/:id/estado — Cambia el estado del ticket (kanban)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  estado: z.enum(['recibido', 'en_preparacion', 'listo', 'entregado', 'cancelado', 'no_retirado']),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const rol = (session.user as any).rol;
  if (rol !== 'admin' && rol !== 'empleado') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const body = await req.json();
  const { estado } = schema.parse(body);

  await prisma.pedido.update({
    where: { id: params.id },
    data: { estadoTicket: estado, entregado: estado === 'entregado' ? true : undefined },
  });

  return NextResponse.json({ ok: true });
}
