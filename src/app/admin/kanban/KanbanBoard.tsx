'use client';

import { useState, useTransition } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { ESTADOS_TICKET, EstadoTicket, etiquetaEstado, colorEstado } from '@/lib/constants';
import { formatHora, formatMonto } from '@/lib/format';
import { ImagenAmpliable } from '@/components/ImagenAmpliable';
import { useRouter } from 'next/navigation';

type PedidoCard = {
  id: string;
  estadoTicket: string;
  cliente: { nombre: string; telefono: string };
  fechaHoraRetiro: string;
  costoTotal: number;
  pagado: boolean;
  entregado: boolean;
  noShow: boolean;
  qrRetiroToken: string;
  items: { cantidad: number; nombreProducto: string; producto: { unidadVenta: string; imagenUrl?: string | null } }[];
};

const COLUMNAS: EstadoTicket[] = ['recibido', 'en_preparacion', 'listo', 'no_retirado'];

export function KanbanBoard({ initialPedidos, rol }: { initialPedidos: PedidoCard[]; rol: string }) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState(initialPedidos);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const newEstado = over.id as string;
    const pedido = pedidos.find((p) => p.id === active.id);
    if (!pedido || pedido.estadoTicket === newEstado) return;

    // Actualización optimista
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedido.id ? { ...p, estadoTicket: newEstado } : p))
    );

    fetch(`/api/pedidos/${pedido.id}/estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: newEstado }),
    }).then(() => {
      startTransition(() => router.refresh());
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {COLUMNAS.map((col) => (
          <Columna key={col} estado={col}>
            {pedidos
              .filter((p) => p.estadoTicket === col)
              .map((p) => (
                <Tarjeta key={p.id} pedido={p} rol={rol} onChange={() => router.refresh()} />
              ))}
            {pedidos.filter((p) => p.estadoTicket === col).length === 0 && (
              <p className="text-xs text-cafe-400 text-center py-6">Vacío</p>
            )}
          </Columna>
        ))}
      </div>
    </DndContext>
  );
}

function Columna({ estado, children }: { estado: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-2 min-h-[200px] ${
        isOver ? 'bg-dorado-100' : 'bg-crema-200'
      }`}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className={`badge ${colorEstado(estado)}`}>{etiquetaEstado(estado)}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Tarjeta({ pedido, rol, onChange }: { pedido: PedidoCard; rol: string; onChange: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: pedido.id });
  const [busy, setBusy] = useState(false);

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.5 : 1 }
    : undefined;

  async function togglePago() {
    setBusy(true);
    await fetch(`/api/pedidos/${pedido.id}/pago`, { method: 'POST' });
    setBusy(false);
    onChange();
  }
  async function toggleEntrega() {
    setBusy(true);
    await fetch(`/api/pedidos/${pedido.id}/entrega`, { method: 'POST' });
    setBusy(false);
    onChange();
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card cursor-grab active:cursor-grabbing select-none"
    >
      <div className="flex items-start gap-2">
        <ImagenAmpliable
          src={pedido.items[0]?.producto.imagenUrl}
          alt=""
          className="w-10 h-10 rounded-lg border border-cafe-200 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-cafe-900">{pedido.cliente.nombre}</div>
          <div className="text-xs text-cafe-500">{pedido.cliente.telefono}</div>
        </div>
      </div>
      <div className="text-xs text-cafe-600 mt-2">
        Retiro: <span className="font-medium">{formatHora(new Date(pedido.fechaHoraRetiro))}</span>
      </div>

      <ul className="text-xs text-cafe-700 mt-2 space-y-0.5 border-t border-cafe-100 pt-2">
        {pedido.items.map((it, i) => (
          <li key={i}>
            {it.cantidad}× {it.nombreProducto}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-cafe-100">
        <div className="font-bold text-cafe-800">{formatMonto(pedido.costoTotal)}</div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={togglePago}
          disabled={busy}
          className={`text-xs px-2 py-1 rounded-md ${
            pedido.pagado
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-crema-200 text-cafe-700 hover:bg-crema-300'
          }`}
        >
          {pedido.pagado ? '✓ Pagado' : 'Marcar pago'}
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={toggleEntrega}
          disabled={busy}
          className={`text-xs px-2 py-1 rounded-md ${
            pedido.entregado
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-crema-200 text-cafe-700 hover:bg-crema-300'
          }`}
        >
          {pedido.entregado ? '✓ Entregado' : 'Marcar entrega'}
        </button>
      </div>

      {pedido.noShow && (
        <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2">⚠ No-show previo</div>
      )}
    </article>
  );
}
