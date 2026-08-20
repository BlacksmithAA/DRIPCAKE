import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatearEnPanama } from '@/lib/reglas-fecha';
import { FormDiaNoLaborable } from './FormDiaNoLaborable';
import { EliminarDiaButton } from './EliminarDiaButton';

export const dynamic = 'force-dynamic';

export default async function DiasNoLaborablesPage() {
  const session = await getServerSession(authOptions);
  if ((session!.user as any).rol !== 'admin') redirect('/admin/kanban');

  const dias = await prisma.diaNoLaborable.findMany({ orderBy: { fecha: 'asc' } });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Días no laborables</h1>
      <p className="text-sm text-slate-600">
        Estos días se suman a los domingos como días cerrados. La regla de 48h hábiles y la
        disponibilidad de bloques de retiro los respetan.
      </p>

      <details className="card">
        <summary className="font-semibold cursor-pointer">+ Agregar día no laborable</summary>
        <div className="mt-4">
          <FormDiaNoLaborable />
        </div>
      </details>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-200">
              <th className="py-2">Fecha</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Recurrente</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dias.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-slate-500 py-4">Sin días no laborables cargados.</td>
              </tr>
            )}
            {dias.map((d) => (
              <tr key={d.id} className="border-b border-slate-100">
                <td className="py-2 font-medium">{formatearEnPanama(d.fecha, 'yyyy-MM-dd')}</td>
                <td className="capitalize">{d.tipo}</td>
                <td className="text-slate-600">{d.descripcion}</td>
                <td>{d.recurrente ? 'Sí' : 'No'}</td>
                <td><EliminarDiaButton id={d.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
