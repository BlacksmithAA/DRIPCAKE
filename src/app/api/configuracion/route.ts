// POST /api/configuracion — Actualiza la configuración del sistema (admin)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  limiteUnidadesPorProducto: z.boolean(),
  limiteUnidadesMax: z.number().int().nonnegative(),
  limiteTotalPedidosPorDia: z.boolean(),
  limiteTotalPedidosMax: z.number().int().nonnegative(),
  corteHorarioPorDia: z.boolean(),
  corteHorarioHora: z.string().regex(/^\d{2}:\d{2}$/),
  minimoCanjePuntos: z.number().int().nonnegative(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const body = await req.json();
  const data = schema.parse(body);

  await prisma.configuracionSistema.update({
    where: { id: 1 },
    data,
  });

  return NextResponse.json({ ok: true });
}
