'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function FormProducto() {
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
      descripcion: fd.get('descripcion'),
      precio: Number(fd.get('precio')),
      unidadVenta: fd.get('unidadVenta'),
      cantidadMin: Number(fd.get('cantidadMin')),
      cantidadMax: Number(fd.get('cantidadMax')),
    };
    const res = await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Error');
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <label className="label">Nombre</label>
        <input name="nombre" required className="input" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Descripción</label>
        <textarea name="descripcion" required rows={2} className="input" />
      </div>
      <div>
        <label className="label">Precio (USD)</label>
        <input name="precio" type="number" step="0.01" min="0" required className="input" />
      </div>
      <div>
        <label className="label">Unidad de venta</label>
        <input name="unidadVenta" required placeholder="unidad / paquete de 12" className="input" />
      </div>
      <div>
        <label className="label">Cantidad mín.</label>
        <input name="cantidadMin" type="number" min="1" required defaultValue="1" className="input" />
      </div>
      <div>
        <label className="label">Cantidad máx.</label>
        <input name="cantidadMax" type="number" min="1" required defaultValue="20" className="input" />
      </div>
      {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
      <div className="md:col-span-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creando…' : 'Crear producto'}
        </button>
      </div>
    </form>
  );
}
