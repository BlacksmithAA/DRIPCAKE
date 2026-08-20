// Página de fallback: si alguien escanea un QR y abre la URL en el navegador
// (en lugar de hacerlo desde el escáner interno), lo redirige al escáner.

import { redirect } from 'next/navigation';

export default function QrPage({ params }: { params: { tipo: string; token: string } }) {
  redirect(`/admin/escaner?qr=${params.tipo}:${params.token}`);
}
