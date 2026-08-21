'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

type Resultado = { ok: boolean; mensaje: string } | null;

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
      setResultado({ ok: false, mensaje: 'No se pudo acceder a la cámara: ' + (e?.message ?? e) });
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
      // esperado: ['qr', 'retiro', '<token>']
      if (parts.length !== 3 || parts[0] !== 'qr' || parts[1] !== 'retiro') {
        setResultado({ ok: false, mensaje: 'QR no reconocido' });
        return;
      }
      const token = parts[2];
      await procesar(token);
    } catch {
      setResultado({ ok: false, mensaje: 'QR inválido' });
    }
  }

  async function procesar(token: string) {
    const res = await fetch(`/api/qr/retiro/${token}`, { method: 'POST' });
    const data = await res.json();
    setResultado({ ok: res.ok, mensaje: data.message ?? data.error });
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div id={containerId} className="w-full max-w-md mx-auto rounded-lg overflow-hidden bg-crema-200" style={{ minHeight: 280 }} />
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
            {resultado.ok ? '✓ Listo' : '✗ Error'}
          </div>
          <div className="text-sm">{resultado.mensaje}</div>
          <button onClick={() => setResultado(null)} className="btn-secondary mt-3 text-sm">
            Escanear otro
          </button>
        </div>
      )}
    </div>
  );
}
