import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatMonto, formatFechaCorta } from '@/lib/format';
import { calcularSaldoPuntos, puntosADescuento } from '@/lib/puntos';
import { GenerarCanjeButton } from './GenerarCanjeButton';
import { VerCanjeQR } from './VerCanjeQR';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;

  const [usuario, transacciones, canjes, configuracion] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: userId } }),
    prisma.transaccionPuntos.findMany({ where: { clienteId: userId }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.canjeQR.findMany({ where: { clienteId: userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.configuracionSistema.findUnique({ where: { id: 1 } }),
  ]);

  if (!usuario) return null;

  const saldo = calcularSaldoPuntos(transacciones);
  const descuentoDisponible = puntosADescuento(saldo);
  const minimo = configuracion?.minimoCanjePuntos ?? 100;
  const canjeActivo = canjes.find((c) => c.estado === 'pendiente' && new Date(c.fechaExpiracion) > new Date());

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      <div className="card">
        <h2 className="font-semibold mb-2">Datos personales</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-slate-500">Nombre</dt>
          <dd className="font-medium">{usuario.nombre}</dd>
          <dt className="text-slate-500">Email</dt>
          <dd className="font-medium">{usuario.email}</dd>
          <dt className="text-slate-500">Teléfono</dt>
          <dd className="font-medium">{usuario.telefono}</dd>
        </dl>
      </div>

      <div className="card bg-gradient-to-br from-drip-50 to-white">
        <h2 className="font-semibold mb-1">Mis puntos</h2>
        <p className="text-3xl font-bold text-drip-700">{saldo.toLocaleString('en-US')} pts</p>
        <p className="text-sm text-slate-600 mt-1">
          Equivale a {formatMonto(descuentoDisponible)} de descuento · 100 pts = $1
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Mínimo para canjear: {minimo.toLocaleString('en-US')} pts
        </p>

        <div className="mt-4 flex gap-2 flex-wrap">
          {canjeActivo ? (
            <VerCanjeQR token={canjeActivo.token} descuentoUSD={canjeActivo.descuentoUSD} />
          ) : (
            <GenerarCanjeButton saldo={saldo} minimo={minimo} />
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Historial de puntos</h2>
        {transacciones.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no tenés movimientos.</p>
        ) : (
          <ul className="text-sm divide-y divide-slate-100">
            {transacciones.map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.descripcion ?? (t.tipo === 'ganado' ? 'Cashback' : 'Canje')}</div>
                  <div className="text-xs text-slate-500">{formatFechaCorta(t.createdAt)}</div>
                </div>
                <div className={`font-bold ${t.tipo === 'ganado' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.tipo === 'ganado' ? '+' : '−'}
                  {t.montoPuntos.toLocaleString('en-US')}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
