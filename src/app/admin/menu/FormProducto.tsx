'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export type ProductoFormData = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  unidadVenta: string;
  cantidadMin: number;
  cantidadMax: number;
  stockSemanal: number | null;
  imagenUrl?: string | null;
  videoUrl?: string | null;
  activo?: boolean;
  archivado?: boolean;
};

export function FormProducto({
  producto,
  onCancel,
}: {
  producto?: ProductoFormData | null;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(producto?.imagenUrl ?? null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(producto?.videoUrl ?? null);
  const formRef = useRef<HTMLFormElement>(null);
  const esEdicion = !!producto;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const stockRaw = fd.get('stockSemanal');
    const body = {
      nombre: fd.get('nombre'),
      descripcion: fd.get('descripcion'),
      precio: Number(fd.get('precio')),
      unidadVenta: fd.get('unidadVenta'),
      cantidadMin: Number(fd.get('cantidadMin')),
      cantidadMax: Number(fd.get('cantidadMax')),
      stockSemanal: stockRaw === '' || stockRaw === null ? null : Number(stockRaw),
      activo: fd.get('activo') === 'on',
    };

    let productoId = producto?.id;

    if (esEdicion) {
      const res = await fetch(`/api/productos/${productoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Error');
        setLoading(false);
        return;
      }
    } else {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Error');
        setLoading(false);
        return;
      }
      const data = await res.json();
      productoId = data.id;
    }

    const imagen = fd.get('imagen') as File | null;
    const video = fd.get('video') as File | null;

    if (imagen && imagen.size > 0) {
      const upload = new FormData();
      upload.append('archivo', imagen);
      upload.append('tipo', 'imagen');
      await fetch(`/api/productos/${productoId}/media`, { method: 'POST', body: upload });
    }

    if (video && video.size > 0) {
      const upload = new FormData();
      upload.append('archivo', video);
      upload.append('tipo', 'video');
      await fetch(`/api/productos/${productoId}/media`, { method: 'POST', body: upload });
    }

    setLoading(false);
    formRef.current?.reset();
    setPreviewImagen(null);
    setPreviewVideo(null);
    onCancel?.();
    router.refresh();
  }

  function onFileChange(tipo: 'imagen' | 'video', file: File | null) {
    if (!file) {
      if (tipo === 'imagen') setPreviewImagen(producto?.imagenUrl ?? null);
      else setPreviewVideo(producto?.videoUrl ?? null);
      return;
    }
    const url = URL.createObjectURL(file);
    if (tipo === 'imagen') setPreviewImagen(url);
    else setPreviewVideo(url);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <label className="label">Nombre</label>
        <input name="nombre" required defaultValue={producto?.nombre} className="input" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Descripción</label>
        <textarea name="descripcion" required rows={2} defaultValue={producto?.descripcion} className="input" />
      </div>
      <div>
        <label className="label">Precio (USD)</label>
        <input name="precio" type="number" step="0.01" min="0" required defaultValue={producto?.precio} className="input" />
      </div>
      <div>
        <label className="label">Unidad de venta</label>
        <input name="unidadVenta" required placeholder="unidad / paquete de 12" defaultValue={producto?.unidadVenta} className="input" />
      </div>
      <div>
        <label className="label">Cantidad mín.</label>
        <input name="cantidadMin" type="number" min="1" required defaultValue={producto?.cantidadMin ?? 1} className="input" />
      </div>
      <div>
        <label className="label">Cantidad máx.</label>
        <input name="cantidadMax" type="number" min="1" required defaultValue={producto?.cantidadMax ?? 20} className="input" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Stock semanal</label>
        <input
          name="stockSemanal"
          type="number"
          min="1"
          placeholder="Vacío = sin límite"
          defaultValue={producto?.stockSemanal ?? ''}
          className="input max-w-xs"
        />
        <p className="text-xs text-cafe-500 mt-1">
          Cantidad disponible por semana (viernes + sábado). Déjalo vacío si este producto no maneja stock limitado.
        </p>
      </div>

      {esEdicion && (
        <label className="md:col-span-2 flex items-center gap-2 text-sm">
          <input name="activo" type="checkbox" defaultChecked={producto?.activo ?? true} />
          Producto activo y visible para pedidos
        </label>
      )}

      <div>
        <label className="label">Foto de muestra</label>
        <input name="imagen" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onFileChange('imagen', e.target.files?.[0] ?? null)} className="input py-1.5" />
        <p className="text-xs text-cafe-500 mt-1">JPG, PNG o WebP. Máx. 5 MB.</p>
        {previewImagen && (
          <img
            src={previewImagen}
            alt="Vista previa"
            className="mt-2 h-24 w-24 object-cover rounded-lg border border-cafe-200"
          />
        )}
      </div>

      <div>
        <label className="label">Video de muestra</label>
        <input name="video" type="file" accept="video/mp4,video/webm" onChange={(e) => onFileChange('video', e.target.files?.[0] ?? null)} className="input py-1.5" />
        <p className="text-xs text-cafe-500 mt-1">MP4 o WebM. Máx. 30 MB.</p>
        {previewVideo && (
          <video src={previewVideo} controls className="mt-2 h-32 rounded-lg border border-cafe-200" />
        )}
      </div>

      {error && <div className="md:col-span-2 text-sm text-red-600">{error}</div>}
      <div className="md:col-span-2 flex gap-2">
        {esEdicion && (
          <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (esEdicion ? 'Guardando…' : 'Creando…') : (esEdicion ? 'Guardar cambios' : 'Crear producto')}
        </button>
      </div>
    </form>
  );
}
