import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatMonto } from '@/lib/format';
import { FormProducto } from './FormProducto';
import { EliminarProductoButton } from './EliminarProductoButton';
import { EditarProductoButton } from './EditarProductoButton';
import { ImagenAmpliable } from '@/components/ImagenAmpliable';
import { calcularDisponibilidad } from '@/lib/agenda-stock';
import { semanaVentaActual } from '@/lib/agenda-stock';

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

  const viernesActual = await semanaVentaActual();

  const productosConStock = await Promise.all(
    productos.map(async (p) => {
      const disp = p.stockSemanal !== null && p.stockSemanal !== undefined
        ? await calcularDisponibilidad(p.id, viernesActual)
        : null;
      return { ...p, disponibilidad: disp };
    })
  );

  const activos = productosConStock.filter((p) => !p.archivado);
  const archivados = productosConStock.filter((p) => p.archivado);

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
        <div className="card overflow-x-auto border-cafe-300 bg-crema-100">
          <h2 className="font-semibold mb-3 text-cafe-700">Archivados</h2>
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
    stockSemanal: number | null;
    imagenUrl: string | null;
    videoUrl: string | null;
    activo: boolean;
    archivado: boolean;
    _count: { itemsPedido: number };
    disponibilidad: { stockTotal: number | null; reservado: number; disponible: number } | null;
  }>;
  mostrarArchivado?: boolean;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b border-cafe-200">
          <th className="py-2">Nombre</th>
          <th>Unidad</th>
          <th>Precio</th>
          <th>Mín / Máx</th>
          <th>Stock semanal</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {productos.length === 0 && (
          <tr>
            <td colSpan={7} className="text-center text-cafe-500 py-4">
              Sin productos.
            </td>
          </tr>
        )}
        {productos.map((p) => (
          <tr key={p.id} className="border-b border-cafe-100">
            <td className="py-2">
              <div className="flex items-center gap-3">
                {p.imagenUrl ? (
                  <ImagenAmpliable src={p.imagenUrl} alt={p.nombre} className="w-12 h-12 rounded-lg border border-cafe-200" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-crema-200 flex items-center justify-center text-xs text-cafe-400">Sin foto</div>
                )}
                <div>
                  <div className="font-medium">{p.nombre}</div>
                  <div className="text-xs text-cafe-500">{p.descripcion}</div>
                </div>
              </div>
            </td>
            <td className="text-cafe-600">{p.unidadVenta}</td>
            <td className="font-medium">{formatMonto(p.precio)}</td>
            <td className="text-cafe-600">
              {p.cantidadMin} / {p.cantidadMax}
            </td>
            <td className="text-cafe-600">
              {p.stockSemanal === null || p.stockSemanal === undefined ? (
                <span className="text-xs text-cafe-400">Sin límite</span>
              ) : (
                <span className="text-xs">
                  <span className="font-medium text-cafe-800">{p.disponibilidad?.reservado ?? 0} / {p.stockSemanal}</span>{' '}
                  reservados
                </span>
              )}
            </td>
            <td>
              <div className="flex flex-wrap gap-1">
                <span
                  className={`badge ${
                    p.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-crema-300 text-cafe-600'
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
                {!p.archivado && <EditarProductoButton producto={p} />}
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
      <button className="text-xs text-cafe-800 hover:underline">
        {activo ? 'Desactivar' : 'Activar'}
      </button>
    </form>
  );
}
