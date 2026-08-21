'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatHora, formatFechaCorta } from '@/lib/format';
import { VideoModal } from './VideoModal';
import { ImagenAmpliable } from '@/components/ImagenAmpliable';

type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  unidadVenta: string;
  cantidadMin: number;
  cantidadMax: number;
  imagenUrl?: string | null;
  videoUrl?: string | null;
  stockSemanal?: number | null;
};

type Props = {
  productos: Producto[];
  whatsappContacto?: string | null;
};

type SemanaSugerida = {
  esSemanaActual: boolean;
  label: string;
  viernes: string;
  sabado: string;
};

type BloquesResponse = {
  semana: SemanaSugerida | null;
  bloques: { viernes: string[]; sabado: string[] };
  mensaje?: string;
};

export function FormularioNuevoPedido({ productos, whatsappContacto }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<Record<string, number>>({});
  const [bloquesData, setBloquesData] = useState<BloquesResponse | null>(null);
  const [cargandoBloques, setCargandoBloques] = useState(false);
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoActivo, setVideoActivo] = useState<{ url: string; nombre: string } | null>(null);

  const itemsArray = useMemo(
    () =>
      Object.entries(items)
        .filter(([, cant]) => cant > 0)
        .map(([productoId, cantidad]) => ({ productoId, cantidad })),
    [items]
  );

  // Evaluar disponibilidad cuando cambian los productos/cantidades
  useEffect(() => {
    if (itemsArray.length === 0) {
      setBloquesData(null);
      setBloqueSeleccionado('');
      return;
    }

    setCargandoBloques(true);
    setBloqueSeleccionado('');
    fetch('/api/agenda/bloques', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsArray }),
    })
      .then((r) => r.json())
      .then((data: BloquesResponse) => {
        if (data.semana === null) {
          setError(data.mensaje ?? 'No hay stock disponible.');
        } else {
          setError(null);
        }
        setBloquesData(data);
      })
      .catch(() => setError('Error al consultar disponibilidad'))
      .finally(() => setCargandoBloques(false));
  }, [itemsArray]);

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

  function mensajeWhatsApp(): string {
    const base = 'Hola, quiero consultar disponibilidad de:';
    const lista = itemsArray
      .map((it) => {
        const p = productos.find((p) => p.id === it.productoId);
        return `\n- ${it.cantidad}× ${p?.nombre ?? 'producto'}`;
      })
      .join('');
    return encodeURIComponent(base + lista);
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
        items: itemsArray,
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
          <div className="card text-cafe-500 text-sm">No hay productos disponibles.</div>
        ) : (
          productos.map((p) => {
            const cant = items[p.id] ?? 0;
            return (
              <div key={p.id} className="card flex items-start gap-3">
                {p.imagenUrl ? (
                  <ImagenAmpliable
                    src={p.imagenUrl}
                    alt={p.nombre}
                    className="w-20 h-20 rounded-lg border border-cafe-200 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-crema-200 flex items-center justify-center text-xs text-cafe-400 shrink-0">
                    Sin foto
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{p.nombre}</div>
                      <div className="text-sm text-cafe-600">{p.descripcion}</div>
                    </div>
                    <div className="font-bold text-cafe-800 whitespace-nowrap">${p.precio.toFixed(2)}</div>
                  </div>
                  <div className="text-xs text-cafe-500 mt-1">
                    {p.unidadVenta} · mín {p.cantidadMin}, máx {p.cantidadMax}
                    {p.stockSemanal !== null && p.stockSemanal !== undefined && (
                      <span className="ml-2 text-cafe-800 font-medium">
                        · stock semanal: {p.stockSemanal}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCantidad(p.id, cant - 1, p.cantidadMin, p.cantidadMax)}
                        className="w-8 h-8 rounded-lg bg-crema-200 hover:bg-crema-300"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{cant}</span>
                      <button
                        type="button"
                        onClick={() => setCantidad(p.id, cant + 1, p.cantidadMin, p.cantidadMax)}
                        className="w-8 h-8 rounded-lg bg-dorado-100 hover:bg-dorado-200 text-cafe-900"
                      >
                        +
                      </button>
                    </div>
                    {p.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setVideoActivo({ url: p.videoUrl!, nombre: p.nombre })}
                        className="text-xs text-cafe-800 hover:underline"
                      >
                        Ver video
                      </button>
                    )}
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
          {cantidadItems === 0 ? (
            <p className="text-sm text-cafe-500">Agregá productos para ver los días disponibles.</p>
          ) : cargandoBloques ? (
            <p className="text-sm text-cafe-500">Consultando disponibilidad…</p>
          ) : bloquesData?.semana === null ? (
            <div className="space-y-3">
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {bloquesData.mensaje ?? 'No hay stock disponible en las próximas semanas.'}
              </p>
              {whatsappContacto && (
                <a
                  href={`https://wa.me/${whatsappContacto.replace(/\D/g, '')}?text=${mensajeWhatsApp()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full text-center"
                >
                  Contactar por WhatsApp
                </a>
              )}
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm text-cafe-700">
                  {bloquesData?.semana?.esSemanaActual
                    ? 'Retiro disponible este viernes/sábado:'
                    : `No queda stock para este viernes/sábado. Te lo agendamos para el ${bloquesData?.semana?.label}:`}
                </p>
              </div>

              {bloquesData && bloquesData.bloques.viernes.length > 0 && (
                <div>
                  <p className="label text-xs uppercase tracking-wide">Viernes {formatFechaCorta(bloquesData.semana.viernes)}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {bloquesData.bloques.viernes.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setBloqueSeleccionado(b)}
                        className={`text-sm rounded-lg py-2 border transition ${
                          bloqueSeleccionado === b
                            ? 'bg-cafe-700 text-white border-cafe-700'
                            : 'bg-white text-cafe-700 border-cafe-300 hover:border-dorado-400'
                        }`}
                      >
                        {formatHora(new Date(b))}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {bloquesData && bloquesData.bloques.sabado.length > 0 && (
                <div>
                  <p className="label text-xs uppercase tracking-wide">Sábado {formatFechaCorta(bloquesData.semana.sabado)}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {bloquesData.bloques.sabado.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setBloqueSeleccionado(b)}
                        className={`text-sm rounded-lg py-2 border transition ${
                          bloqueSeleccionado === b
                            ? 'bg-cafe-700 text-white border-cafe-700'
                            : 'bg-white text-cafe-700 border-cafe-300 hover:border-dorado-400'
                        }`}
                      >
                        {formatHora(new Date(b))}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!bloquesData?.semana?.esSemanaActual && whatsappContacto && (
                <a
                  href={`https://wa.me/${whatsappContacto.replace(/\D/g, '')}?text=${mensajeWhatsApp()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full text-center text-sm"
                >
                  Prefiero contactar por WhatsApp
                </a>
              )}
            </>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">Resumen</h3>
          {cantidadItems === 0 ? (
            <p className="text-sm text-cafe-500">Sin productos seleccionados</p>
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
          <div className="flex justify-between font-bold text-lg pt-3 border-t border-cafe-200">
            <span>Total</span>
            <span>${costoTotal.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button onClick={enviar} disabled={loading || cantidadItems === 0 || !bloqueSeleccionado} className="btn-primary w-full">
          {loading ? 'Creando pedido…' : 'Confirmar pedido'}
        </button>
      </div>

      {videoActivo && <VideoModal url={videoActivo.url} nombre={videoActivo.nombre} onClose={() => setVideoActivo(null)} />}
    </div>
  );
}
