// POST /api/agenda/bloques
// Recibe un carrito de productos y devuelve:
//  - la semana sugerida (actual o próxima con stock)
//  - las fechas viernes/sábado de esa semana
//  - los bloques de horario disponibles dentro de esos días

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { determinarSemanaParaCarrito, obtenerBloquesParaSemana } from '@/lib/agenda-stock';
import { z } from 'zod';

const schema = z.object({
  items: z
    .array(
      z.object({
        productoId: z.string(),
        cantidad: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json();
  const { items } = schema.parse(body);

  // Validar que los productos existan y estén activos
  const productos = await prisma.producto.findMany({
    where: { id: { in: items.map((i) => i.productoId) }, activo: true, archivado: false },
  });

  if (productos.length !== items.length) {
    return NextResponse.json({ error: 'Uno o más productos no están disponibles' }, { status: 400 });
  }

  const semanaSugerida = await determinarSemanaParaCarrito(items);

  if (!semanaSugerida) {
    return NextResponse.json({
      mensaje: 'No hay stock disponible en las próximas semanas para tu selección.',
      semana: null,
      bloques: { viernes: [], sabado: [] },
    });
  }

  // Para el cálculo de bloques usamos la cantidad total del producto con mayor demanda relativa
  // (cualquiera de los productos; si uno no tiene bloques, todos quedarían vacíos).
  const itemRepresentativo = items.reduce((max, it) => (it.cantidad > max.cantidad ? it : max), items[0]);

  const { viernes, sabado, semana } = await obtenerBloquesParaSemana(
    itemRepresentativo.productoId,
    semanaSugerida.semana.viernes,
    itemRepresentativo.cantidad
  );

  return NextResponse.json({
    semana: {
      esSemanaActual: semanaSugerida.esSemanaActual,
      label: semana.label,
      viernes: semana.viernes.toISOString(),
      sabado: semana.sabado.toISOString(),
    },
    bloques: {
      viernes: viernes.map((b) => b.toISOString()),
      sabado: sabado.map((b) => b.toISOString()),
    },
  });
}
