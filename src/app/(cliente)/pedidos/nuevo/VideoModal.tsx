'use client';

export function VideoModal({ url, nombre, onClose }: { url: string; nombre: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl p-4 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-3">{nombre}</h3>
        <video src={url} controls className="w-full rounded-lg" />
        <button onClick={onClose} className="btn-secondary w-full mt-4">
          Cerrar
        </button>
      </div>
    </div>
  );
}
