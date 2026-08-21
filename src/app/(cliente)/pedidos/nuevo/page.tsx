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
      <p className="text-cafe-600 text-sm">
        Seleccioná los productos y la cantidad. Te mostraremos el próximo viernes o sábado con stock disponible.
        Si no hay stock para esta semana, te ofrecemos agendar para la siguiente.
      </p>
      <FormularioNuevoPedido productos={productos} whatsappContacto={configuracion?.whatsappContacto} />
    </div>
  );
}
