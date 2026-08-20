'use client';

import { useState } from 'react';
import QRCode from 'qrcode';

export function LinkMisQR({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  async function ver() {
    setOpen(true);
    if (!qrUrl) {
      const url = `${window.location.origin}/qr/retiro/${token}`;
      const data = await QRCode.toDataURL(url, { width: 320, margin: 2 });
      setQrUrl(data);
    }
  }

  return (
    <>
      <button onClick={ver} className="btn-secondary text-xs">Ver QR de retiro</button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2 text-center">Tu QR de retiro</h3>
            <p className="text-xs text-slate-600 text-center mb-4">
              Mostrá este código en el mostrador para retirar tu pedido.
            </p>
            {qrUrl ? (
              <img src={qrUrl} alt="QR" className="mx-auto w-64 h-64" />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">Generando…</div>
            )}
            <button onClick={() => setOpen(false)} className="btn-secondary w-full mt-4">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
