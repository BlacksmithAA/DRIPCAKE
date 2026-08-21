import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;

  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!usuario) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      <div className="card">
        <h2 className="font-semibold mb-2">Datos personales</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-cafe-500">Nombre</dt>
          <dd className="font-medium">{usuario.nombre}</dd>
          <dt className="text-cafe-500">Email</dt>
          <dd className="font-medium">{usuario.email}</dd>
          <dt className="text-cafe-500">Teléfono</dt>
          <dd className="font-medium">{usuario.telefono}</dd>
        </dl>
      </div>
    </div>
  );
}
