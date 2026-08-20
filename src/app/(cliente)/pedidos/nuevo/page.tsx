import { prisma } from '@/lib/prisma';
import { FormularioNuevoPedido } from './FormularioNuevoPedido';

export const dynamic = 'force-dynamic';

export default async function NuevoPedidoPage() {
  const productos = await prisma.producto.findMany({
    where: { activo: true, archivado: false },
    orderBy: { nombre: 'asc' },
  });

  const configuracion = await prisma.configuracionSistema.findUnique({ where: { id: 1 } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Nuevo pedido</h1>
      <p className="text-slate-600 text-sm">
        Seleccioná los productos, la cantidad y agendá tu retiro. La hora de retiro debe tener
        al menos <strong>48 horas hábiles</strong> de anticipación (no se cuentan domingos ni
        días no laborables).
      </p>
      <FormularioNuevoPedido productos={productos} configuracion={configuracion} />
    </div>
  );
}
