// DELETE /api/dias-no-laborables/:id — Elimina un día no laborable (admin)
// PATCH /api/dias-no-laborables/:id — Edita un día no laborable (admin)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { dePanamaAInstant } from '@/lib/reglas-fecha';

const patchSchema = z.object({
  fecha: z.string().optional(),
  tipo: z.enum(['feriado', 'vacaciones', 'eventualidad']).optional(),
  descripcion: z.string().min(1).optional(),
  recurrente: z.boolean().optional(),
});

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  await prisma.diaNoLaborable.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const body = await req.json();
  const data = patchSchema.parse(body);

  const updateData: any = { ...data };
  if (data.fecha) {
    const [y, m, d] = data.fecha.split('-').map(Number);
    const fechaLocal = new Date(y, m - 1, d, 0, 0, 0);
    updateData.fecha = dePanamaAInstant(fechaLocal);
  }

  const updated = await prisma.diaNoLaborable.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(updated);
}
