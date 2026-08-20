import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const rol = (session.user as any).rol;
  if (rol === 'admin' || rol === 'empleado') redirect('/admin/kanban');

  return (
    <>
      <Navbar
        items={[
          { href: '/pedidos', label: 'Mis pedidos' },
          { href: '/pedidos/nuevo', label: 'Nuevo pedido' },
          { href: '/perfil', label: 'Mi perfil' },
        ]}
      />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
