'use client';

import { useState } from 'react';

export function ImagenAmpliable({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [abierta, setAbierta] = useState(false);

  if (!src) return null;

  return (
    <>
      <button type="button" onClick={() => setAbierta(true)} className="shrink-0">
        <img
          src={src}
          alt={alt}
          className={`object-cover cursor-zoom-in ${className ?? ''}`}
        />
      </button>

      {abierta && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setAbierta(false)}
        >
          <button
            type="button"
            onClick={() => setAbierta(false)}
            className="absolute top-4 right-4 text-white text-2xl leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[90vh] rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
