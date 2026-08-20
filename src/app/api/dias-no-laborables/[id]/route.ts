// DELETE /api/dias-no-laborables/:id — Elimina un día no laborable (admin)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  await prisma.diaNoLaborable.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
