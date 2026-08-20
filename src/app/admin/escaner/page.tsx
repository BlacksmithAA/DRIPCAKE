import { EscanerQR } from './EscanerQR';

export default function EscanerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Escáner de QR</h1>
      <p className="text-sm text-slate-600">
        Apuntá la cámara al QR del cliente. Detectamos automáticamente si es QR de retiro (entrega) o
        QR de canje (descuento).
      </p>
      <EscanerQR />
    </div>
  );
}
