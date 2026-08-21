'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Initial = {
  whatsappContacto: string | null;
};

export function ConfigForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    whatsappContacto: initial.whatsappContacto ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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
        <h2 className="font-semibold">Contacto del negocio</h2>
        <p className="text-xs text-cafe-500">
          Número de WhatsApp al que se dirigirán los clientes cuando un producto no tenga stock disponible.
        </p>

        <div>
          <label className="label">WhatsApp de contacto</label>
          <input
            type="tel"
            value={form.whatsappContacto}
            onChange={(e) => setForm({ ...form, whatsappContacto: e.target.value })}
            placeholder="+50760000000"
            className="input max-w-xs"
          />
          <p className="text-xs text-cafe-500 mt-1">
            Formato internacional, sin espacios ni guiones (ej. +50760000000).
          </p>
        </div>
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
