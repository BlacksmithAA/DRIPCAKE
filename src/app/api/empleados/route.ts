// POST /api/empleados — Crea un usuario con rol empleado (solo admin)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const schema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto'),
  telefono: z.string().min(6, 'Teléfono inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if ((session.user as any).rol !== 'admin') {
      return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
    }

    const body = await req.json();
    const data = schema.parse(body);

    const existe = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (existe) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const empleado = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email,
        passwordHash,
        rol: 'empleado',
        activo: true,
      },
    });

    return NextResponse.json({ ok: true, empleado: { id: empleado.id, nombre: empleado.nombre, email: empleado.email } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Datos inválidos' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
