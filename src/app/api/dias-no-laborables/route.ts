// POST /api/dias-no-laborables — Crea un día no laborable (admin)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { dePanamaAInstant } from '@/lib/reglas-fecha';

const schema = z.object({
  fecha: z.string(),
  tipo: z.enum(['feriado', 'vacaciones', 'eventualidad']),
  descripcion: z.string().min(1),
  recurrente: z.boolean(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const body = await req.json();
  const data = schema.parse(body);

  // Parseamos la fecha como día en hora Panamá
  const [y, m, d] = data.fecha.split('-').map(Number);
  const fechaLocal = new Date(y, m - 1, d, 0, 0, 0);
  const fecha = dePanamaAInstant(fechaLocal);

  const created = await prisma.diaNoLaborable.create({
    data: {
      fecha,
      tipo: data.tipo,
      descripcion: data.descripcion,
      recurrente: data.recurrente,
    },
  });

  return NextResponse.json(created);
}
