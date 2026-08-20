// POST /api/canje/generar — Cliente genera un QR de canje (token temporal, un solo uso)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generarTokenQR } from '@/lib/qr';
import { puntosADescuento } from '@/lib/puntos';

const schema = z.object({
  puntos: z.number().int().positive().multipleOf(100),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const clienteId = (session.user as any).id;

  const body = await req.json();
  const { puntos } = schema.parse(body);

  const config = await prisma.configuracionSistema.findUnique({ where: { id: 1 } });
  if (!config) return NextResponse.json({ error: 'Sin configuración' }, { status: 500 });
  if (puntos < config.minimoCanjePuntos) {
    return NextResponse.json({ error: `Mínimo: ${config.minimoCanjePuntos} puntos` }, { status: 400 });
  }

  // Verificar saldo real
  const transacciones = await prisma.transaccionPuntos.findMany({ where: { clienteId } });
  const saldo = transacciones.reduce(
    (acc, t) => acc + (t.tipo === 'ganado' ? t.montoPuntos : -t.montoPuntos),
    0
  );

  if (puntos > saldo) {
    return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
  }

  // Verificar que no tenga un canje pendiente
  const canjePendiente = await prisma.canjeQR.findFirst({
    where: {
      clienteId,
      estado: 'pendiente',
      fechaExpiracion: { gt: new Date() },
    },
  });
  if (canjePendiente) {
    return NextResponse.json({ error: 'Ya tenés un QR de canje activo' }, { status: 400 });
  }

  const token = generarTokenQR('canje');
  const descuentoUSD = puntosADescuento(puntos);
  const fechaExpiracion = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

  const canje = await prisma.canjeQR.create({
    data: {
      clienteId,
      token,
      puntosSolicitados: puntos,
      descuentoUSD,
      fechaExpiracion,
    },
  });

  return NextResponse.json({ token: canje.token });
}
