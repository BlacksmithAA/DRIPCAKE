'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { TIMEZONE } from '@/lib/timezone';

export type DiaNoLaborable = {
  id: string;
  fecha: string; // ISO
  tipo: 'feriado' | 'vacaciones' | 'eventualidad';
  descripcion: string;
  recurrente: boolean;
};

const TIPOS: { value: DiaNoLaborable['tipo']; label: string; color: string }[] = [
  { value: 'feriado', label: 'Feriado', color: 'bg-dorado-400 text-cafe-900' },
  { value: 'vacaciones', label: 'Vacaciones', color: 'bg-cafe-300 text-cafe-900' },
  { value: 'eventualidad', label: 'Eventualidad', color: 'bg-cafe-200 text-cafe-900' },
];

function colorPorTipo(tipo: DiaNoLaborable['tipo']) {
  return TIPOS.find((t) => t.value === tipo)?.color ?? 'bg-cafe-200';
}

export function CalendarioDiasNoLaborables({ diasIniciales }: { diasIniciales: DiaNoLaborable[] }) {
  const [dias, setDias] = useState(diasIniciales);
  const [mesActual, setMesActual] = useState(new Date());
  const [modalDia, setModalDia] = useState<Date | null>(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState<DiaNoLaborable | null>(null);

  const inicioMes = startOfMonth(mesActual);
  const finMes = endOfMonth(mesActual);
  const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 1 }); // lunes
  const finCalendario = endOfWeek(finMes, { weekStartsOn: 1 });

  const celdas: Date[] = [];
  let cursor = inicioCalendario;
  while (cursor <= finCalendario) {
    celdas.push(cursor);
    cursor = addDays(cursor, 1);
  }

  function diaNoLaborableParaFecha(fecha: Date): DiaNoLaborable | undefined {
    return dias.find((d) => isSameDay(new Date(d.fecha), fecha));
  }

  function abrirModal(fecha: Date) {
    setModalDia(fecha);
    setDiaSeleccionado(diaNoLaborableParaFecha(fecha) ?? null);
  }

  function cerrarModal() {
    setModalDia(null);
    setDiaSeleccionado(null);
  }

  function actualizarDia(dia: DiaNoLaborable) {
    setDias((prev) => {
      const otros = prev.filter((d) => d.id !== dia.id);
      return [...otros, dia];
    });
  }

  function eliminarDia(id: string) {
    setDias((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => setMesActual(subMonths(mesActual, 1))} className="btn-secondary text-sm">
          ← Mes anterior
        </button>
        <h2 className="text-xl font-bold capitalize">
          {format(mesActual, 'MMMM yyyy', { locale: undefined })}
        </h2>
        <button onClick={() => setMesActual(addMonths(mesActual, 1))} className="btn-secondary text-sm">
          Mes siguiente →
        </button>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-2 text-xs">
        {TIPOS.map((t) => (
          <span key={t.value} className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${t.color}`}>
            <span className="w-2 h-2 rounded-full bg-current opacity-70" />
            {t.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 bg-crema-300 text-cafe-700">
          <span className="w-2 h-2 rounded-full bg-current opacity-70" />
          Domingo (cerrado)
        </span>
      </div>

      {/* Grid */}
      <div className="card p-2 md:p-4">
        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className="text-xs font-medium text-cafe-500 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {celdas.map((fecha) => {
            const esDomingo = getDay(fecha) === 0;
            const diaNL = diaNoLaborableParaFecha(fecha);
            const esMesActual = isSameMonth(fecha, mesActual);

            return (
              <button
                key={fecha.toISOString()}
                onClick={() => !esDomingo && abrirModal(fecha)}
                disabled={esDomingo}
                className={`
                  relative min-h-[60px] md:min-h-[80px] rounded-lg border p-1 text-left transition
                  ${esMesActual ? 'bg-white border-cafe-100' : 'bg-crema-50 border-transparent text-cafe-300'}
                  ${esDomingo ? 'bg-crema-200 cursor-not-allowed' : 'hover:border-dorado-400 hover:shadow-sm'}
                  ${diaNL ? colorPorTipo(diaNL.tipo) + ' bg-opacity-30' : ''}
                `}
              >
                <span className={`text-sm font-medium ${esMesActual ? 'text-cafe-900' : 'text-cafe-300'}`}>
                  {format(fecha, 'd')}
                </span>
                {diaNL && (
                  <div className="absolute bottom-1 left-1 right-1 text-[10px] leading-tight truncate text-cafe-800">
                    {diaNL.descripcion}
                  </div>
                )}
                {esDomingo && (
                  <div className="absolute bottom-1 left-1 right-1 text-[10px] leading-tight text-cafe-600">
                    Cerrado
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modalDia && (
        <ModalDia
          fecha={modalDia}
          diaExistente={diaSeleccionado}
          onClose={cerrarModal}
          onGuardar={actualizarDia}
          onEliminar={eliminarDia}
        />
      )}
    </div>
  );
}

function ModalDia({
  fecha,
  diaExistente,
  onClose,
  onGuardar,
  onEliminar,
}: {
  fecha: Date;
  diaExistente: DiaNoLaborable | null;
  onClose: () => void;
  onGuardar: (dia: DiaNoLaborable) => void;
  onEliminar: (id: string) => void;
}) {
  const [tipo, setTipo] = useState<DiaNoLaborable['tipo']>(diaExistente?.tipo ?? 'feriado');
  const [descripcion, setDescripcion] = useState(diaExistente?.descripcion ?? '');
  const [recurrente, setRecurrente] = useState(diaExistente?.recurrente ?? false);
  const [loading, setLoading] = useState(false);
  const fechaStr = formatInTimeZone(fecha, TIMEZONE, 'yyyy-MM-dd');

  async function guardar() {
    setLoading(true);
    const body = { fecha: fechaStr, tipo, descripcion, recurrente };

    if (diaExistente) {
      const res = await fetch(`/api/dias-no-laborables/${diaExistente.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      onGuardar(data);
    } else {
      const res = await fetch('/api/dias-no-laborables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      onGuardar(data);
    }
    setLoading(false);
    onClose();
  }

  async function eliminar() {
    if (!diaExistente) return;
    if (!confirm('¿Quitar este día no laborable?')) return;
    setLoading(true);
    await fetch(`/api/dias-no-laborables/${diaExistente.id}`, { method: 'DELETE' });
    setLoading(false);
    onEliminar(diaExistente.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-1">
          {diaExistente ? 'Editar día no laborable' : 'Marcar día no laborable'}
        </h3>
        <p className="text-sm text-cafe-600 mb-4">
          {format(fecha, "EEEE d 'de' MMMM", { locale: undefined })}
        </p>

        <div className="space-y-3">
          <div>
            <label className="label">Tipo</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as DiaNoLaborable['tipo'])} className="input">
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Descripción</label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Día de la Independencia"
              className="input"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={recurrente} onChange={(e) => setRecurrente(e.target.checked)} />
            Se repite cada año en la misma fecha
          </label>
        </div>

        <div className="flex gap-2 mt-6">
          {diaExistente && (
            <button onClick={eliminar} disabled={loading} className="btn-danger flex-1">
              Quitar
            </button>
          )}
          <button onClick={onClose} disabled={loading} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button onClick={guardar} disabled={loading || !descripcion.trim()} className="btn-primary flex-1">
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
