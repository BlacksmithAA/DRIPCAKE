'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type Resultado =
  | { tipo: 'retiro'; ok: boolean; mensaje: string; descuento?: number }
  | { tipo: 'canje'; ok: boolean; mensaje: string; descuento?: number }
  | null;

export function EscanerQR() {
  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState<Resultado>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader';

  async function start() {
    if (scannerRef.current) return;
    setResultado(null);
    const html5QrCode = new Html5Qrcode(containerId);
    scannerRef.current = html5QrCode;
    try {
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      );
      setEscaneando(true);
    } catch (e: any) {
      setResultado({ tipo: 'retiro', ok: false, mensaje: 'No se pudo acceder a la cámara: ' + (e?.message ?? e) });
      scannerRef.current = null;
    }
  }

  async function stop() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setEscaneando(false);
  }

  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    // Apago el scanner mientras proceso
    await stop();

    try {
      // decodificado esperado: URL completa al endpoint de escaneo
      const url = new URL(decodedText);
      const parts = url.pathname.split('/').filter(Boolean);
      // esperado: ['qr', 'retiro', '<token>'] o ['qr', 'canje', '<token>']
      if (parts.length !== 3 || parts[0] !== 'qr') {
        setResultado({ tipo: 'retiro', ok: false, mensaje: 'QR no reconocido' });
        return;
      }
      const tipo = parts[1] as 'retiro' | 'canje';
      const token = parts[2];
      await procesar(tipo, token);
    } catch {
      setResultado({ tipo: 'retiro', ok: false, mensaje: 'QR inválido' });
    }
  }

  async function procesar(tipo: 'retiro' | 'canje', token: string) {
    const endpoint = tipo === 'retiro' ? `/api/qr/retiro/${token}` : `/api/qr/canje/${token}`;
    const res = await fetch(endpoint, { method: 'POST' });
    const data = await res.json();
    setResultado({ tipo, ok: res.ok, mensaje: data.message ?? data.error, descuento: data.descuentoUSD });
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div id={containerId} className="w-full max-w-md mx-auto rounded-lg overflow-hidden bg-slate-100" style={{ minHeight: 280 }} />
        <div className="flex gap-2 mt-3 justify-center">
          {!escaneando ? (
            <button onClick={start} className="btn-primary">Iniciar cámara</button>
          ) : (
            <button onClick={stop} className="btn-secondary">Detener</button>
          )}
        </div>
      </div>

      {resultado && (
        <div
          className={`card ${
            resultado.ok
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="font-semibold mb-1">
            {resultado.ok ? '✓ Listo' : '✗ Error'} — QR de {resultado.tipo}
          </div>
          <div className="text-sm">{resultado.mensaje}</div>
          {resultado.descuento !== undefined && (
            <div className="text-lg font-bold text-emerald-700 mt-2">
              Descuento aplicado: ${resultado.descuento.toFixed(2)}
            </div>
          )}
          <button onClick={() => setResultado(null)} className="btn-secondary mt-3 text-sm">
            Escanear otro
          </button>
        </div>
      )}
    </div>
  );
}
