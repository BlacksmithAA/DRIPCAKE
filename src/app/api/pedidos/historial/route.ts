// GET /api/pedidos/historial
// Devuelve el histórico de pedidos con filtros y paginación. Solo admin.

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const DEFAULT_PAGE_SIZE = 20;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);

  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');
  const clienteQuery = searchParams.get('clienteQuery')?.trim();
  const estadoTicket = searchParams.get('estadoTicket');
  const pagado = searchParams.get('pagado');
  const entregado = searchParams.get('entregado');
  const noShow = searchParams.get('noShow');
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const pageSize = Math.max(1, Math.min(100, Number(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE))));

  const where: Prisma.PedidoWhereInput = {};

  if (desde || hasta) {
    where.fechaHoraRetiro = {};
    if (desde) where.fechaHoraRetiro.gte = new Date(desde);
    if (hasta) where.fechaHoraRetiro.lte = new Date(hasta + 'T23:59:59.999Z');
  }

  if (clienteQuery) {
    where.cliente = {
      OR: [
        { nombre: { contains: clienteQuery } },
        { telefono: { contains: clienteQuery } },
        { email: { contains: clienteQuery } },
      ],
    };
  }

  if (estadoTicket) where.estadoTicket = estadoTicket;
  if (pagado === 'true') where.pagado = true;
  if (pagado === 'false') where.pagado = false;
  if (entregado === 'true') where.entregado = true;
  if (entregado === 'false') where.entregado = false;
  if (noShow === 'true') where.noShow = true;
  if (noShow === 'false') where.noShow = false;

  const [pedidos, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      include: {
        cliente: true,
        items: true,
      },
      orderBy: { fechaHoraRetiro: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pedido.count({ where }),
  ]);

  return NextResponse.json({
    pedidos: pedidos.map((p) => ({
      id: p.id,
      cliente: { nombre: p.cliente.nombre, telefono: p.cliente.telefono, email: p.cliente.email },
      fechaHoraRetiro: p.fechaHoraRetiro.toISOString(),
      estadoTicket: p.estadoTicket,
      pagado: p.pagado,
      entregado: p.entregado,
      noShow: p.noShow,
      costoTotal: p.costoTotal,
      items: p.items.map((it) => ({
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        subtotal: it.subtotal,
        nombreProducto: it.nombreProducto,
      })),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
