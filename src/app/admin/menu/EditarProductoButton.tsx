'use client';

import { useState } from 'react';
import { FormProducto, ProductoFormData } from './FormProducto';

export function EditarProductoButton({ producto }: { producto: ProductoFormData }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <>
      <button onClick={() => setMostrar(true)} className="text-xs text-cafe-800 hover:underline">
        Editar
      </button>
      {mostrar && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setMostrar(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Editar producto</h2>
            <FormProducto producto={producto} onCancel={() => setMostrar(false)} />
          </div>
        </div>
      )}
    </>
  );
}
