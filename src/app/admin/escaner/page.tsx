import { EscanerQR } from './EscanerQR';

export default function EscanerPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Escáner de QR</h1>
      <p className="text-sm text-cafe-600">
        Apuntá la cámara al QR de retiro del cliente para marcar el pedido como entregado.
      </p>
      <EscanerQR />
    </div>
  );
}
