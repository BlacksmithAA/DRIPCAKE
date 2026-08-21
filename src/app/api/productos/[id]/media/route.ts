// POST /api/productos/:id/media
// Sube una imagen o video de muestra para un producto.
// Almacenamiento local en disco; válido para el despliegue actual (Windows local + Cloudflare Tunnel).
// Si en el futuro se migra a un entorno serverless, reemplazar por almacenamiento externo (S3/Cloudflare R2).

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { randomBytes } from 'crypto';

const MAX_IMAGEN_MB = 5;
const MAX_VIDEO_MB = 30;
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const TIPOS_VIDEO = ['video/mp4', 'video/webm'];
const EXTENSIONES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const producto = await prisma.producto.findUnique({ where: { id: params.id } });
  if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  const formData = await req.formData();
  const archivo = formData.get('archivo') as File | null;
  const tipoCampo = formData.get('tipo') as 'imagen' | 'video' | null;

  if (!archivo || !tipoCampo) {
    return NextResponse.json({ error: 'Falta archivo o tipo' }, { status: 400 });
  }

  const esImagen = TIPOS_IMAGEN.includes(archivo.type);
  const esVideo = TIPOS_VIDEO.includes(archivo.type);

  if (!esImagen && !esVideo) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
  }

  if (tipoCampo === 'imagen' && !esImagen) {
    return NextResponse.json({ error: 'El archivo no es una imagen válida' }, { status: 400 });
  }
  if (tipoCampo === 'video' && !esVideo) {
    return NextResponse.json({ error: 'El archivo no es un video válido' }, { status: 400 });
  }

  const maxBytes = (tipoCampo === 'imagen' ? MAX_IMAGEN_MB : MAX_VIDEO_MB) * 1024 * 1024;
  if (archivo.size > maxBytes) {
    return NextResponse.json(
      { error: `El archivo excede el límite de ${tipoCampo === 'imagen' ? MAX_IMAGEN_MB : MAX_VIDEO_MB} MB` },
      { status: 400 }
    );
  }

  const ext = EXTENSIONES[archivo.type];
  const nombreUnico = `${randomBytes(16).toString('hex')}.${ext}`;
  const rutaRelativa = `/uploads/productos/${nombreUnico}`;
  const directorio = path.join(process.cwd(), 'public', 'uploads', 'productos');
  const rutaCompleta = path.join(directorio, nombreUnico);

  if (!existsSync(directorio)) {
    await mkdir(directorio, { recursive: true });
  }

  const bytes = await archivo.arrayBuffer();
  await writeFile(rutaCompleta, Buffer.from(bytes));

  const data = tipoCampo === 'imagen' ? { imagenUrl: rutaRelativa } : { videoUrl: rutaRelativa };
  const actualizado = await prisma.producto.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ ok: true, producto: actualizado });
}
