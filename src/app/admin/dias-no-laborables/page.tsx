import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatFechaCorta } from '@/lib/format';
import { CalendarioDiasNoLaborables } from './CalendarioDiasNoLaborables';

export const dynamic = 'force-dynamic';

export default async function DiasNoLaborablesPage() {
  const session = await getServerSession(authOptions);
  if ((session!.user as any).rol !== 'admin') redirect('/admin/kanban');

  const dias = await prisma.diaNoLaborable.findMany({
    orderBy: { fecha: 'asc' },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Días no laborables</h1>
      <p className="text-sm text-cafe-600">
        Hacé click en un día del calendario para marcarlo como feriado, vacaciones o eventualidad.
        Los domingos están cerrados por regla del negocio.
      </p>

      <CalendarioDiasNoLaborables
        diasIniciales={dias.map((d) => ({
          id: d.id,
          fecha: d.fecha.toISOString(),
          tipo: d.tipo as 'feriado' | 'vacaciones' | 'eventualidad',
          descripcion: d.descripcion,
          recurrente: d.recurrente,
        }))}
      />

      <div className="card">
        <h2 className="font-semibold mb-3">Próximos días no laborables</h2>
        {dias.length === 0 ? (
          <p className="text-sm text-cafe-500">No hay días cargados.</p>
        ) : (
          <ul className="text-sm divide-y divide-cafe-100">
            {dias.slice(0, 20).map((d) => (
              <li key={d.id} className="py-2 flex justify-between items-center">
                <div>
                  <span className="font-medium">{formatFechaCorta(d.fecha)}</span>
                  <span className="text-cafe-500 ml-2">{d.descripcion}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="capitalize text-cafe-600">{d.tipo}</span>
                  {d.recurrente && <span className="text-dorado-500">Recurrente</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
