'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatHora } from '@/lib/format';

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  unidadVenta: string;
  cantidadMin: number;
  cantidadMax: number;
};

type Props = {
  productos: Producto[];
  configuracion: any;
};

export function FormularioNuevoPedido({ productos, configuracion }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Record<string, number>>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<string>('');
  const [bloques, setBloques] = useState<string[]>([]);
  const [cargandoBloques, setCargandoBloques] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar bloques cuando cambia la fecha
  useEffect(() => {
    if (!fechaSeleccionada) {
      setBloques([]);
      return;
    }
    setCargandoBloques(true);
    setBloqueSeleccionado('');
    fetch(`/api/agenda/bloques?fecha=${fechaSeleccionada}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setBloques([]);
        } else {
          setBloques(data.bloques);
          setError(null);
        }
      })
      .finally(() => setCargandoBloques(false));
  }, [fechaSeleccionada]);

  // Calcular costo total
  const costoTotal = useMemo(() => {
    return Object.entries(items).reduce((acc, [id, cant]) => {
      const p = productos.find((p) => p.id === id);
      return acc + (p ? p.precio * cant : 0);
    }, 0);
  }, [items, productos]);

  const cantidadItems = Object.values(items).reduce((a, b) => a + b, 0);

  function setCantidad(id: string, cant: number, min: number, max: number) {
    if (cant < 0) return;
    if (cant === 0) {
      const copy = { ...items };
      delete copy[id];
      setItems(copy);
      return;
    }
    setItems({ ...items, [id]: Math.min(Math.max(cant, min), max) });
  }

  async function enviar() {
    setError(null);

    if (cantidadItems === 0) {
      setError('Agregá al menos un producto al pedido');
      return;
    }
    if (!bloqueSeleccionado) {
      setError('Seleccioná una fecha y hora de retiro');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: Object.entries(items).map(([productoId, cantidad]) => ({ productoId, cantidad })),
        fechaHoraRetiro: bloqueSeleccionado,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Error al crear el pedido');
      return;
    }

    router.push('/pedidos');
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Catálogo */}
      <div className="lg:col-span-2 space-y-3">
        <h2 className="font-semibold text-lg">1. Elegí tus productos</h2>
        {productos.length === 0 ? (
          <div className="card text-slate-500 text-sm">No hay productos disponibles.</div>
        ) : (
          productos.map((p) => {
            const cant = items[p.id] ?? 0;
            return (
              <div key={p.id} className="card flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold">{p.nombre}</div>
                  <div className="text-sm text-slate-600">{p.descripcion}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {p.unidadVenta} · mín {p.cantidadMin}, máx {p.cantidadMax}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-drip-700">${p.precio.toFixed(2)}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      type="button"
                      onClick={() => setCantidad(p.id, cant - 1, p.cantidadMin, p.cantidadMax)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-medium">{cant}</span>
                    <button
                      type="button"
                      onClick={() => setCantidad(p.id, cant + 1, p.cantidadMin, p.cantidadMax)}
                      className="w-8 h-8 rounded-lg bg-drip-100 hover:bg-drip-200 text-drip-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resumen + agenda */}
      <div className="space-y-3">
        <h2 className="font-semibold text-lg">2. Agenda tu retiro</h2>

        <div className="card space-y-3">
          <div>
            <label className="label">Fecha de retiro</label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input"
            />
          </div>

          <div>
            <label className="label">Bloque horario</label>
            {!fechaSeleccionada ? (
              <p className="text-xs text-slate-500">Elegí primero una fecha</p>
            ) : cargandoBloques ? (
              <p className="text-xs text-slate-500">Cargando bloques…</p>
            ) : bloques.length === 0 ? (
              <p className="text-xs text-red-600">No hay bloques disponibles para esa fecha.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {bloques.map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setBloqueSeleccionado(b)}
                    className={`text-sm rounded-lg py-2 border transition ${
                      bloqueSeleccionado === b
                        ? 'bg-drip-600 text-white border-drip-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-drip-400'
                    }`}
                  >
                    {formatHora(new Date(b))}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Resumen</h3>
          {cantidadItems === 0 ? (
            <p className="text-sm text-slate-500">Sin productos seleccionados</p>
          ) : (
            <ul className="text-sm space-y-1 mb-3">
              {Object.entries(items).map(([id, cant]) => {
                const p = productos.find((p) => p.id === id);
                if (!p) return null;
                return (
                  <li key={id} className="flex justify-between">
                    <span>
                      {cant}× {p.nombre}
                    </span>
                    <span className="font-medium">${(p.precio * cant).toFixed(2)}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-200">
            <span>Total</span>
            <span>${costoTotal.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button onClick={enviar} disabled={loading || cantidadItems === 0} className="btn-primary w-full">
          {loading ? 'Creando pedido…' : 'Confirmar pedido'}
        </button>
      </div>
    </div>
  );
}
