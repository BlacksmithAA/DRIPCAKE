// PATCH /api/empleados/:id/toggle — Activa/desactiva un empleado (solo admin)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if ((session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const empleado = await prisma.usuario.findUnique({ where: { id: params.id } });
  if (!empleado) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  if (empleado.rol !== 'empleado') {
    return NextResponse.json({ error: 'Solo se pueden activar/desactivar empleados' }, { status: 400 });
  }

  const actualizado = await prisma.usuario.update({
    where: { id: params.id },
    data: { activo: !empleado.activo },
  });

  return NextResponse.json({ ok: true, activo: actualizado.activo });
}
