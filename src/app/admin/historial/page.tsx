import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { HistorialPedidos } from './HistorialPedidos';

export const dynamic = 'force-dynamic';

export default async function HistorialPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).rol !== 'admin') {
    redirect('/admin/kanban');
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Historial de pedidos</h1>
      <p className="text-sm text-cafe-600">
        Buscá pedidos por fecha, cliente, estado, pago o entrega.
      </p>
      <HistorialPedidos />
    </div>
  );
}
