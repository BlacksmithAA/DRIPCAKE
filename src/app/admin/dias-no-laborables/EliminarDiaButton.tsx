'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function EliminarDiaButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function eliminar() {
    if (!confirm('¿Eliminar este día no laborable?')) return;
    setLoading(true);
    await fetch(`/api/dias-no-laborables/${id}`, { method: 'DELETE' });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={eliminar} disabled={loading} className="text-xs text-red-600 hover:underline">
      {loading ? 'Eliminando…' : 'Eliminar'}
    </button>
  );
}
