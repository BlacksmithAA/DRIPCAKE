'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Initial = {
  limiteUnidadesPorProducto: boolean;
  limiteUnidadesMax: number;
  limiteTotalPedidosPorDia: boolean;
  limiteTotalPedidosMax: number;
  corteHorarioPorDia: boolean;
  corteHorarioHora: string;
  minimoCanjePuntos: number;
};

export function ConfigForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm({ ...form, [key]: value });
  }

  async function save() {
    setLoading(true);
    setSaved(false);
    await fetch('/api/configuracion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <h2 className="font-semibold">Reglas de aceptación de pedidos</h2>
        <p className="text-xs text-slate-500">
          Por defecto el sistema no aplica límites. Activá las reglas que necesites.
        </p>

        <ReglaRow
          label="Límite de unidades por producto por día"
          checked={form.limiteUnidadesPorProducto}
          onChange={(v) => update('limiteUnidadesPorProducto', v)}
          numeroLabel="Máx. unidades por producto por día"
          numero={form.limiteUnidadesMax}
          onNumeroChange={(v) => update('limiteUnidadesMax', v)}
        />

        <ReglaRow
          label="Límite total de pedidos por día"
          checked={form.limiteTotalPedidosPorDia}
          onChange={(v) => update('limiteTotalPedidosPorDia', v)}
          numeroLabel="Máx. pedidos por día"
          numero={form.limiteTotalPedidosMax}
          onNumeroChange={(v) => update('limiteTotalPedidosMax', v)}
        />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.corteHorarioPorDia}
              onChange={(e) => update('corteHorarioPorDia', e.target.checked)}
            />
            Corte de horario para pedidos de un día específico
          </label>
          {form.corteHorarioPorDia && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Hora de corte:</span>
              <input
                type="time"
                value={form.corteHorarioHora}
                onChange={(e) => update('corteHorarioHora', e.target.value)}
                className="input w-32"
              />
            </div>
          )}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Cashback</h2>
        <label className="label">Mínimo de puntos para canjear</label>
        <input
          type="number"
          min={0}
          step={100}
          value={form.minimoCanjePuntos}
          onChange={(e) => update('minimoCanjePuntos', Number(e.target.value))}
          className="input max-w-xs"
        />
        <p className="text-xs text-slate-500">
          El cliente no podrá generar un QR de canje hasta acumular al menos esta cantidad de puntos.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={loading} className="btn-primary">
          {loading ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {saved && <span className="text-sm text-emerald-600">✓ Guardado</span>}
      </div>
    </div>
  );
}

function ReglaRow({
  label,
  checked,
  onChange,
  numeroLabel,
  numero,
  onNumeroChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  numeroLabel: string;
  numero: number;
  onNumeroChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap py-2 border-t border-slate-100">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
      {checked && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">{numeroLabel}:</span>
          <input
            type="number"
            min={0}
            value={numero}
            onChange={(e) => onNumeroChange(Number(e.target.value))}
            className="input w-24"
          />
        </div>
      )}
    </div>
  );
}
