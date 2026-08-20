'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError('Email o contraseña incorrectos');
      return;
    }

    const callback = searchParams.get('callbackUrl');
    router.push(callback ?? '/');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-drip-700 mb-1">Iniciar sesión</h1>
        <p className="text-sm text-slate-600 mb-6">Ingresá a tu cuenta de Dripcake</p>

        <form onSubmit={handleSubmit} className="space-y-3">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          ¿No tenés cuenta?{' '}
          <Link href="/registro" className="text-drip-700 font-medium hover:underline">
            Registrarme
          </Link>
        </div>
      </div>
    </main>
  );
}
