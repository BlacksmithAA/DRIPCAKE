import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto'),
  telefono: z.string().min(6, 'Teléfono inválido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existe = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (existe) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email,
        passwordHash,
        rol: 'cliente',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? 'Datos inválidos' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
