'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function EliminarProductoButton({ id, tieneItems }: { id: string; tieneItems: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function eliminar() {
    const mensaje = tieneItems
      ? 'Este producto tiene pedidos asociados. Se archivará en lugar de eliminarse. ¿Continuar?'
      : '¿Eliminar este producto permanentemente?';

    if (!confirm(mensaje)) return;

    setLoading(true);
    const res = await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.error ?? 'Error');
      return;
    }

    if (data.archivado) {
      alert(data.mensaje);
    }

    router.refresh();
  }

  return (
    <button
      onClick={eliminar}
      disabled={loading}
      className="text-xs text-red-600 hover:underline"
    >
      {loading ? 'Procesando…' : tieneItems ? 'Archivar' : 'Eliminar'}
    </button>
  );
}
