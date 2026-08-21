'use client';

import { useEffect, useState } from 'react';
import { formatFechaCorta, formatHora, formatMonto } from '@/lib/format';
import { etiquetaEstado, colorEstado, ESTADOS_TICKET } from '@/lib/constants';

type PedidoHistorial = {
  id: string;
  cliente: { nombre: string; telefono: string; email: string };
  fechaHoraRetiro: string;
  estadoTicket: string;
  pagado: boolean;
  entregado: boolean;
  noShow: boolean;
  costoTotal: number;
  items: { cantidad: number; precioUnitario: number; subtotal: number; nombreProducto: string }[];
};

type Respuesta = {
  pedidos: PedidoHistorial[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function HistorialPedidos() {
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    clienteQuery: '',
    estadoTicket: '',
    pagado: '',
    entregado: '',
    noShow: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Respuesta | null>(null);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState<PedidoHistorial | null>(null);

  useEffect(() => {
    async function cargar() {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', '20');
      if (filtros.desde) params.set('desde', filtros.desde);
      if (filtros.hasta) params.set('hasta', filtros.hasta);
      if (filtros.clienteQuery) params.set('clienteQuery', filtros.clienteQuery);
      if (filtros.estadoTicket) params.set('estadoTicket', filtros.estadoTicket);
      if (filtros.pagado) params.set('pagado', filtros.pagado);
      if (filtros.entregado) params.set('entregado', filtros.entregado);
      if (filtros.noShow) params.set('noShow', filtros.noShow);

      const res = await fetch(`/api/pedidos/historial?${params.toString()}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    cargar();
  }, [filtros, page]);

  function updateFiltro(key: keyof typeof filtros, value: string) {
    setFiltros({ ...filtros, [key]: value });
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="card grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="label">Desde</label>
          <input type="date" value={filtros.desde} onChange={(e) => updateFiltro('desde', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Hasta</label>
          <input type="date" value={filtros.hasta} onChange={(e) => updateFiltro('hasta', e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Cliente</label>
          <input
            type="text"
            value={filtros.clienteQuery}
            onChange={(e) => updateFiltro('clienteQuery', e.target.value)}
            placeholder="Nombre, teléfono o email"
            className="input"
          />
        </div>
        <div>
          <label className="label">Estado</label>
          <select value={filtros.estadoTicket} onChange={(e) => updateFiltro('estadoTicket', e.target.value)} className="input">
            <option value="">Todos</option>
            {ESTADOS_TICKET.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Pagado</label>
          <select value={filtros.pagado} onChange={(e) => updateFiltro('pagado', e.target.value)} className="input">
            <option value="">Todos</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label className="label">Entregado</label>
          <select value={filtros.entregado} onChange={(e) => updateFiltro('entregado', e.target.value)} className="input">
            <option value="">Todos</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label className="label">No-show</label>
          <select value={filtros.noShow} onChange={(e) => updateFiltro('noShow', e.target.value)} className="input">
            <option value="">Todos</option>
            <option value="true">Sí</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-x-auto">
        {loading || !data ? (
          <p className="text-cafe-500 text-sm">Cargando…</p>
        ) : data.pedidos.length === 0 ? (
          <p className="text-cafe-500 text-sm">No se encontraron pedidos.</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-cafe-200">
                  <th className="py-2">Retiro</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Pagado</th>
                  <th>Entregado</th>
                  <th>No-show</th>
                </tr>
              </thead>
              <tbody>
                {data.pedidos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-cafe-100 hover:bg-crema-100 cursor-pointer"
                    onClick={() => setDetalle(p)}
                  >
                    <td className="py-2">
                      <div className="font-medium">{formatFechaCorta(p.fechaHoraRetiro)}</div>
                      <div className="text-xs text-cafe-500">{formatHora(p.fechaHoraRetiro)}</div>
                    </td>
                    <td>
                      <div className="font-medium">{p.cliente.nombre}</div>
                      <div className="text-xs text-cafe-500">{p.cliente.telefono}</div>
                    </td>
                    <td className="text-cafe-700">
                      {p.items.map((it) => `${it.cantidad}× ${it.nombreProducto}`).join(', ')}
                    </td>
                    <td className="font-medium">{formatMonto(p.costoTotal)}</td>
                    <td>
                      <span className={`badge ${colorEstado(p.estadoTicket)}`}>{etiquetaEstado(p.estadoTicket)}</span>
                    </td>
                    <td>{p.pagado ? 'Sí' : 'No'}</td>
                    <td>{p.entregado ? 'Sí' : 'No'}</td>
                    <td>{p.noShow ? 'Sí' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-cafe-600">
                Mostrando {data.pedidos.length} de {data.total} pedidos
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className="btn-secondary text-xs"
                >
                  Anterior
                </button>
                <span className="px-3 py-2 text-cafe-700">
                  Página {data.page} de {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.totalPages}
                  className="btn-secondary text-xs"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setDetalle(null)}>
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">Detalle del pedido</h2>
              <button onClick={() => setDetalle(null)} className="text-cafe-500 hover:text-cafe-800">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-cafe-500">Cliente:</span>{' '}
                <span className="font-medium">{detalle.cliente.nombre}</span>
                <div className="text-cafe-500">{detalle.cliente.telefono} · {detalle.cliente.email}</div>
              </div>
              <div>
                <span className="text-cafe-500">Retiro:</span>{' '}
                {formatFechaCorta(detalle.fechaHoraRetiro)} a las {formatHora(detalle.fechaHoraRetiro)}
              </div>
              <div>
                <span className="text-cafe-500">Estado:</span>{' '}
                <span className={`badge ${colorEstado(detalle.estadoTicket)}`}>{etiquetaEstado(detalle.estadoTicket)}</span>
              </div>
              <div className="flex gap-4">
                <span>Pagado: <strong>{detalle.pagado ? 'Sí' : 'No'}</strong></span>
                <span>Entregado: <strong>{detalle.entregado ? 'Sí' : 'No'}</strong></span>
                <span>No-show: <strong>{detalle.noShow ? 'Sí' : 'No'}</strong></span>
              </div>

              <div className="border-t border-cafe-100 pt-3">
                <h3 className="font-semibold mb-2">Ítems</h3>
                <ul className="space-y-1">
                  {detalle.items.map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{it.cantidad}× {it.nombreProducto} · {formatMonto(it.precioUnitario)} c/u</span>
                      <span className="font-medium">{formatMonto(it.subtotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-cafe-100 mt-3">
                  <span>Total</span>
                  <span>{formatMonto(detalle.costoTotal)}</span>
                </div>
              </div>
            </div>

            <button onClick={() => setDetalle(null)} className="btn-secondary w-full mt-6">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
