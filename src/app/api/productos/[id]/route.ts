// DELETE /api/productos/:id — Elimina o archiva un producto (solo admin)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if ((session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const producto = await prisma.producto.findUnique({ where: { id: params.id } });
  if (!producto) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const itemsAsociados = await prisma.itemPedido.count({
    where: { productoId: params.id },
  });

  if (itemsAsociados === 0) {
    await prisma.producto.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true, eliminado: true, mensaje: 'Producto eliminado permanentemente' });
  }

  const archivado = await prisma.producto.update({
    where: { id: params.id },
    data: { activo: false, archivado: true },
  });

  return NextResponse.json({
    ok: true,
    eliminado: false,
    archivado: true,
    mensaje: 'El producto tiene pedidos históricos, por lo que fue archivado en lugar de eliminado',
    producto: archivado,
  });
}
