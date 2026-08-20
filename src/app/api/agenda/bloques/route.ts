// GET /api/agenda/bloques?fecha=YYYY-MM-DD
// Devuelve los bloques de retiro disponibles para esa fecha, aplicando:
//  - Días no laborables
//  - Regla de 48h hábiles
//  - Límites de configuración

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  ahoraEnPanama,
  esDiaNoLaborable,
  generarBloquesDelDia,
  validar48hHabiles,
} from '@/lib/reglas-fecha';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fechaStr = searchParams.get('fecha');
  if (!fechaStr) return NextResponse.json({ error: 'Falta fecha' }, { status: 400 });

  // Parseamos la fecha como día en hora Panamá
  const [y, m, d] = fechaStr.split('-').map(Number);
  const fecha = new Date(y, m - 1, d, 0, 0, 0);

  if (await esDiaNoLaborable(fecha)) {
    return NextResponse.json({ bloques: [], mensaje: 'Día no laborable' });
  }

  const todosLosBloques = await generarBloquesDelDia(fecha);
  const ahora = ahoraEnPanama();
  const config = await prisma.configuracionSistema.findUnique({ where: { id: 1 } });

  // Filtrar por 48h hábiles
  const bloquesValidos: string[] = [];
  for (const b of todosLosBloques) {
    const v = await validar48hHabiles(b, ahora);
    if (v.valido) bloquesValidos.push(b.toISOString());
  }

  // Si está activado el límite de pedidos por día, descontar
  if (config?.limiteTotalPedidosPorDia) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);

    const pedidosDelDia = await prisma.pedido.count({
      where: {
        fechaHoraRetiro: { gte: inicio, lte: fin },
        estadoTicket: { not: 'cancelado' },
      },
    });

    if (pedidosDelDia >= config.limiteTotalPedidosMax) {
      return NextResponse.json({ bloques: [], mensaje: 'Cupo diario agotado' });
    }
  }

  return NextResponse.json({ bloques: bloquesValidos });
}
