'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function GenerarCanjeButton({ saldo, minimo }: { saldo: number; minimo: number }) {
  const router = useRouter();
  const [puntos, setPuntos] = useState(Math.min(saldo, Math.max(saldo - (saldo % 100), minimo)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generar() {
    setError(null);
    if (puntos < minimo) {
      setError(`El mínimo es ${minimo} puntos`);
      return;
    }
    if (puntos > saldo) {
      setError('No tenés suficientes puntos');
      return;
    }
    if (puntos % 100 !== 0) {
      setError('Los puntos deben ser múltiplos de 100');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/canje/generar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puntos }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Error');
      return;
    }
    router.refresh();
  }

  if (saldo < minimo) {
    return (
      <p className="text-xs text-slate-500">
        Te faltan {minimo - saldo} pts para poder canjear.
      </p>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          step={100}
          min={minimo}
          max={saldo}
          value={puntos}
          onChange={(e) => setPuntos(Number(e.target.value))}
          className="input flex-1"
        />
        <button onClick={generar} disabled={loading} className="btn-primary">
          {loading ? 'Generando…' : 'Generar QR'}
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Vas a canjear {puntos.toLocaleString('en-US')} pts por ${(puntos / 100).toFixed(2)} de descuento.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
