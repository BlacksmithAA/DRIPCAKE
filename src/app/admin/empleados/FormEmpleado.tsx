'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function FormEmpleado() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      nombre: fd.get('nombre'),
      telefono: fd.get('telefono'),
      email: fd.get('email'),
      password: fd.get('password'),
    };

    const res = await fetch('/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Error al crear empleado');
      return;
    }

    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="label">Nombre</label>
        <input name="nombre" required className="input" />
      </div>
      <div>
        <label className="label">Teléfono</label>
        <input name="telefono" required className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label">Contraseña</label>
        <input name="password" type="password" required minLength={6} className="input" />
      </div>
      {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
      <div className="md:col-span-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creando…' : 'Crear empleado'}
        </button>
      </div>
    </form>
  );
}
