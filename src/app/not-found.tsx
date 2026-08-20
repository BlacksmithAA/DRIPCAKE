import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-drip-700 mb-2">404</h1>
        <p className="text-slate-600 mb-6">Esta página no existe.</p>
        <Link href="/" className="btn-primary">Volver al inicio</Link>
      </div>
    </main>
  );
}
