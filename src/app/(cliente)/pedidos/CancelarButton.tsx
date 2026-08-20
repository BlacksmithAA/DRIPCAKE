'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CancelarButton({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancelar() {
    if (!confirm('¿Seguro que querés cancelar este pedido?')) return;
    setLoading(true);
    const res = await fetch(`/api/pedidos/${pedidoId}/cancelar`, { method: 'POST' });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? 'No se pudo cancelar');
    }
  }

  return (
    <button onClick={cancelar} disabled={loading} className="btn-ghost text-xs text-red-600">
      {loading ? 'Cancelando…' : 'Cancelar'}
    </button>
  );
}
