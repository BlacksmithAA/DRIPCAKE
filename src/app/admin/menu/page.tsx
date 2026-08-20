import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatMonto } from '@/lib/format';
import { FormProducto } from './FormProducto';
import { EliminarProductoButton } from './EliminarProductoButton';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const session = await getServerSession(authOptions);
  if ((session!.user as any).rol !== 'admin') redirect('/admin/kanban');

  const productos = await prisma.producto.findMany({
    orderBy: { nombre: 'asc' },
    include: {
      _count: { select: { itemsPedido: true } },
    },
  });

  const activos = productos.filter((p) => !p.archivado);
  const archivados = productos.filter((p) => p.archivado);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Menú</h1>

      <details className="card">
        <summary className="font-semibold cursor-pointer">+ Nuevo producto</summary>
        <div className="mt-4">
          <FormProducto />
        </div>
      </details>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">Productos activos</h2>
        <TablaProductos productos={activos} />
      </div>

      {archivados.length > 0 && (
        <div className="card overflow-x-auto border-slate-300 bg-slate-50">
          <h2 className="font-semibold mb-3 text-slate-700">Archivados</h2>
          <TablaProductos productos={archivados} mostrarArchivado />
        </div>
      )}
    </div>
  );
}

function TablaProductos({
  productos,
  mostrarArchivado = false,
}: {
  productos: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    unidadVenta: string;
    cantidadMin: number;
    cantidadMax: number;
    activo: boolean;
    archivado: boolean;
    _count: { itemsPedido: number };
  }>;
  mostrarArchivado?: boolean;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-slate-200">
          <th className="py-2">Nombre</th>
          <th>Unidad</th>
          <th>Precio</th>
          <th>Mín / Máx</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {productos.length === 0 && (
          <tr>
            <td colSpan={6} className="text-center text-slate-500 py-4">
              Sin productos.
            </td>
          </tr>
        )}
        {productos.map((p) => (
          <tr key={p.id} className="border-b border-slate-100">
            <td className="py-2">
              <div className="font-medium">{p.nombre}</div>
              <div className="text-xs text-slate-500">{p.descripcion}</div>
            </td>
            <td className="text-slate-600">{p.unidadVenta}</td>
            <td className="font-medium">{formatMonto(p.precio)}</td>
            <td className="text-slate-600">
              {p.cantidadMin} / {p.cantidadMax}
            </td>
            <td>
              <div className="flex flex-wrap gap-1">
                <span
                  className={`badge ${
                    p.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.activo ? 'Activo' : 'Inactivo'}
                </span>
                {mostrarArchivado && (
                  <span className="badge bg-red-100 text-red-800">Archivado</span>
                )}
              </div>
            </td>
            <td>
              <div className="flex items-center gap-3">
                {!p.archivado && <ToggleActivo id={p.id} activo={p.activo} />}
                {!p.archivado && (
                  <EliminarProductoButton id={p.id} tieneItems={p._count.itemsPedido > 0} />
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ToggleActivo({ id, activo }: { id: string; activo: boolean }) {
  return (
    <form action={`/api/productos/${id}/toggle`} method="post">
      <button className="text-xs text-drip-700 hover:underline">
        {activo ? 'Desactivar' : 'Activar'}
      </button>
    </form>
  );
}
