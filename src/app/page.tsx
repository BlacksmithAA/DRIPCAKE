import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const rol = (session.user as any).rol;
    if (rol === 'admin' || rol === 'empleado') {
      redirect('/admin/kanban');
    }
    redirect('/pedidos');
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-6">
          <h1 className="text-5xl md:text-6xl font-bold text-drip-700 mb-3">Dripcake</h1>
          <p className="text-lg text-slate-600">Pan de masa madre, baguette, focaccia y más.</p>
        </div>

        <div className="card text-left max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2">Bienvenido</h2>
          <p className="text-slate-600 mb-4 text-sm">
            Iniciá sesión para hacer un pedido, ver tu historial o gestionar la panadería.
          </p>
          <div className="flex gap-2">
            <Link href="/login" className="btn-primary flex-1">Iniciar sesión</Link>
            <Link href="/registro" className="btn-secondary flex-1">Registrarme</Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          <p>Usuarios de prueba:</p>
          <p>admin@dripcake.com / admin123 — cliente@dripcake.com / cliente123</p>
        </div>
      </div>
    </main>
  );
}
