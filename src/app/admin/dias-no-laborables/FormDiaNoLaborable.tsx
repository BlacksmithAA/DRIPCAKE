'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function FormDiaNoLaborable() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      fecha: fd.get('fecha'),
      tipo: fd.get('tipo'),
      descripcion: fd.get('descripcion'),
      recurrente: fd.get('recurrente') === 'on',
    };
    const res = await fetch('/api/dias-no-laborables', {
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
      <div>
        <label className="label">Fecha</label>
        <input name="fecha" type="date" required className="input" />
      </div>
      <div>
        <label className="label">Tipo</label>
        <select name="tipo" required className="input">
          <option value="feriado">Feriado</option>
          <option value="vacaciones">Vacaciones</option>
          <option value="eventualidad">Eventualidad</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="label">Descripción</label>
        <input name="descripcion" required className="input" placeholder="Ej: Día de la Independencia" />
      </div>
      <label className="flex items-center gap-2 text-sm md:col-span-2">
        <input name="recurrente" type="checkbox" />
        Se repite cada año en la misma fecha
      </label>
      {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
      <div className="md:col-span-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Guardando…' : 'Agregar'}
        </button>
      </div>
    </form>
  );
}
