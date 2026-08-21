'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, telefono, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Error al registrarse');
      setLoading(false);
      return;
    }

    // Login automático
    await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    router.push('/pedidos');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-cafe-800 mb-1">Crear cuenta</h1>
        <p className="text-sm text-cafe-600 mb-6">Hacé tu pedido de pan artesanal en Dripcake</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Nombre completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="input"
              placeholder="+507 6000-0000"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-cafe-600">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-cafe-800 font-medium hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
