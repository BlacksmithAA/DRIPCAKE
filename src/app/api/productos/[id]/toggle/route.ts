// POST /api/productos/:id/toggle — Activa/desactiva un producto

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const producto = await prisma.producto.findUnique({ where: { id: params.id } });
  if (!producto) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  await prisma.producto.update({
    where: { id: params.id },
    data: { activo: !producto.activo },
  });

  // Si el form fue enviado desde la página (no fetch), redirigir
  const accept = _req.headers.get('accept');
  if (accept?.includes('text/html')) redirect('/admin/menu');

  return NextResponse.json({ ok: true });
}
