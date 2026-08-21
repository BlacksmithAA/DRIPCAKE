import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ConfigForm } from './ConfigForm';

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  if ((session!.user as any).rol !== 'admin') redirect('/admin/kanban');

  const config = await prisma.configuracionSistema.findUnique({ where: { id: 1 } });
  if (!config) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Configuración del sistema</h1>
      <ConfigForm
        initial={{
          whatsappContacto: config.whatsappContacto,
        }}
      />
    </div>
  );
}
