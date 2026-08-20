// POST /api/pedidos — Crea un pedido nuevo

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generarTokenQR } from '@/lib/qr';
import { validar48hHabiles, ahoraEnPanama } from '@/lib/reglas-fecha';

const schema = z.object({
  items: z
    .array(
      z.object({
        productoId: z.string(),
        cantidad: z.number().int().positive(),
      })
    )
    .min(1, 'Agregá al menos un producto'),
  fechaHoraRetiro: z.string(), // ISO string
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const rol = (session.user as any).rol;
  if (rol !== 'cliente') {
    return NextResponse.json({ error: 'Solo los clientes pueden crear pedidos' }, { status: 403 });
  }

  const clienteId = (session.user as any).id;
  const body = await req.json();
  const data = schema.parse(body);

  const fechaHoraRetiro = new Date(data.fechaHoraRetiro);

  // Validar 48h hábiles
  const validacion = await validar48hHabiles(fechaHoraRetiro, ahoraEnPanama());
  if (!validacion.valido) {
    return NextResponse.json({ error: validacion.mensaje }, { status: 400 });
  }

  // Cargar productos y validar cantidades
  const productos = await prisma.producto.findMany({
    where: { id: { in: data.items.map((i) => i.productoId) }, activo: true, archivado: false },
  });

  if (productos.length !== data.items.length) {
    return NextResponse.json({ error: 'Uno o más productos no están disponibles' }, { status: 400 });
  }

  for (const it of data.items) {
    const p = productos.find((p) => p.id === it.productoId)!;
    if (it.cantidad < p.cantidadMin || it.cantidad > p.cantidadMax) {
      return NextResponse.json({
        error: `${p.nombre}: la cantidad debe estar entre ${p.cantidadMin} y ${p.cantidadMax}`,
      }, { status: 400 });
    }
  }

  // Verificar si hay un canje de puntos activo (asumimos que se pasa como opcional)
  // Por simplicidad, el canje de puntos se aplica en el momento del pago por el admin.

  // Calcular costo
  const itemsConSubtotal = data.items.map((it) => {
    const p = productos.find((p) => p.id === it.productoId)!;
    return {
      productoId: p.id,
      cantidad: it.cantidad,
      precioUnitario: p.precio,
      subtotal: p.precio * it.cantidad,
    };
  });
  const costoTotal = itemsConSubtotal.reduce((a, b) => a + b.subtotal, 0);

  // Crear pedido
  const pedido = await prisma.pedido.create({
    data: {
      clienteId,
      fechaHoraRetiro,
      estadoTicket: 'recibido',
      costoTotal,
      qrRetiroToken: generarTokenQR('retiro'),
      items: {
        create: itemsConSubtotal,
      },
    },
  });

  return NextResponse.json({ id: pedido.id, qrRetiroToken: pedido.qrRetiroToken });
}
