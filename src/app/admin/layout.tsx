import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const rol = (session.user as any).rol;
  if (rol !== 'admin' && rol !== 'empleado') redirect('/pedidos');

  const items = [
    { href: '/admin/kanban', label: 'Kanban' },
    { href: '/admin/escaner', label: 'Escáner QR' },
    { href: '/admin/no-show', label: 'No-show' },
  ];
  if (rol === 'admin') {
    items.push(
      { href: '/admin/menu', label: 'Menú' },
      { href: '/admin/empleados', label: 'Empleados' },
      { href: '/admin/dias-no-laborables', label: 'Días no laborables' },
      { href: '/admin/configuracion', label: 'Configuración' },
    );
  }

  return (
    <>
      <Navbar items={items} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
