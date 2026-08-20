'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ToggleEmpleadoButton({ id, activo }: { id: string; activo: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const accion = activo ? 'desactivar' : 'activar';
    if (!confirm(`¿${activo ? 'Desactivar' : 'Activar'} este empleado?`)) return;

    setLoading(true);
    const res = await fetch(`/api/empleados/${id}/toggle`, { method: 'PATCH' });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? 'Error');
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs hover:underline ${activo ? 'text-amber-600' : 'text-emerald-600'}`}
    >
      {loading ? 'Procesando…' : activo ? 'Desactivar' : 'Activar'}
    </button>
  );
}
