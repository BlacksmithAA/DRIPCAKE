'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function MarcarNoShowButton({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function marcar() {
    if (!confirm('¿Marcar como no retirado? Esto se registrará en el historial del cliente.')) return;
    setLoading(true);
    await fetch(`/api/pedidos/${pedidoId}/no-show`, { method: 'POST' });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={marcar} disabled={loading} className="btn-danger text-sm">
      {loading ? 'Marcando…' : 'No-show'}
    </button>
  );
}
