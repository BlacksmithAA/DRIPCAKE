import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { FormEmpleado } from './FormEmpleado';
import { ToggleEmpleadoButton } from './ToggleEmpleadoButton';

export const dynamic = 'force-dynamic';

export default async function EmpleadosPage() {
  const session = await getServerSession(authOptions);
  if ((session!.user as any).rol !== 'admin') redirect('/admin/kanban');

  const empleados = await prisma.usuario.findMany({
    where: { rol: 'empleado' },
    orderBy: { nombre: 'asc' },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Empleados</h1>
      <p className="text-sm text-cafe-600">
        Creá y gestioná las cuentas de empleado. Los empleados desactivados no podrán iniciar sesión.
      </p>

      <details className="card">
        <summary className="font-semibold cursor-pointer">+ Nuevo empleado</summary>
        <div className="mt-4">
          <FormEmpleado />
        </div>
      </details>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-cafe-200">
              <th className="py-2">Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {empleados.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-cafe-500 py-4">
                  Sin empleados registrados.
                </td>
              </tr>
            )}
            {empleados.map((e) => (
              <tr key={e.id} className="border-b border-cafe-100">
                <td className="py-2 font-medium">{e.nombre}</td>
                <td className="text-cafe-600">{e.email}</td>
                <td className="text-cafe-600">{e.telefono}</td>
                <td>
                  <span
                    className={`badge ${
                      e.activo
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-crema-300 text-cafe-600'
                    }`}
                  >
                    {e.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <ToggleEmpleadoButton id={e.id} activo={e.activo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
