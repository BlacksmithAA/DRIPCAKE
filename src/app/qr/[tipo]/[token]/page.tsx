// Página de fallback: si alguien escanea un QR de retiro y abre la URL en el navegador
// (en lugar de hacerlo desde el escáner interno), lo redirige al escáner.

import { notFound, redirect } from 'next/navigation';

export default function QrPage({ params }: { params: { tipo: string; token: string } }) {
  if (params.tipo !== 'retiro') notFound();
  redirect(`/admin/escaner?qr=${params.tipo}:${params.token}`);
}
