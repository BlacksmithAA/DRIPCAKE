// POST /api/productos — Crea un producto (solo admin)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  nombre: z.string().min(2),
  descripcion: z.string().min(2),
  precio: z.number().positive(),
  unidadVenta: z.string().min(1),
  cantidadMin: z.number().int().positive(),
  cantidadMax: z.number().int().positive(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if ((session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const body = await req.json();
  const data = schema.parse(body);

  if (data.cantidadMax < data.cantidadMin) {
    return NextResponse.json({ error: 'cantidadMax debe ser >= cantidadMin' }, { status: 400 });
  }

  const producto = await prisma.producto.create({ data });
  return NextResponse.json(producto);
}
