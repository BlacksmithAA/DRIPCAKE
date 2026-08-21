'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

type Rol = 'cliente' | 'empleado' | 'admin';

function useRol(): Rol | null {
  const { data: session } = useSession();
  return (session?.user as any)?.rol ?? null;
}

export function BottomNav() {
  const rol = useRol();
  if (!rol) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-cafe-200 pb-safe">
      {rol === 'cliente' && <NavCliente />}
      {rol === 'empleado' && <NavEmpleado />}
      {rol === 'admin' && <NavAdmin />}
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  primary = false,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-0.5 py-2 flex-1 min-w-0 ${
        primary
          ? 'text-cafe-800'
          : active
          ? 'text-cafe-800'
          : 'text-cafe-400'
      }`}
    >
      <span className={primary ? 'p-2 rounded-full bg-dorado-300 text-cafe-900' : ''}>{icon}</span>
      <span className="text-[10px] font-medium truncate w-full text-center px-1">{label}</span>
    </Link>
  );
}

function NavCliente() {
  const pathname = usePathname();
  return (
    <div className="flex items-center justify-around h-16">
      <NavItem
        href="/pedidos"
        label="Mis pedidos"
        icon={<ListIcon />}
        active={pathname === '/pedidos' || pathname.startsWith('/pedidos/')}
      />
      <NavItem
        href="/pedidos/nuevo"
        label="Nuevo"
        icon={<PlusIcon />}
        active={pathname === '/pedidos/nuevo'}
        primary
      />
      <NavItem
        href="/perfil"
        label="Perfil"
        icon={<UserIcon />}
        active={pathname === '/perfil'}
      />
    </div>
  );
}

function NavEmpleado() {
  const pathname = usePathname();
  const [masAbierto, setMasAbierto] = useState(false);

  return (
    <>
      <div className="flex items-center justify-around h-16">
        <NavItem
          href="/admin/kanban"
          label="Kanban"
          icon={<KanbanIcon />}
          active={pathname === '/admin/kanban'}
        />
        <NavItem
          href="/admin/escaner"
          label="Escáner"
          icon={<QrIcon />}
          active={pathname === '/admin/escaner'}
        />
        <button
          onClick={() => setMasAbierto(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-2 flex-1 min-w-0 text-cafe-400"
        >
          <MenuIcon />
          <span className="text-[10px] font-medium">Más</span>
        </button>
      </div>

      <DrawerMas
        abierto={masAbierto}
        onCerrar={() => setMasAbierto(false)}
        items={[
          { href: '/admin/no-show', label: 'No-show' },
          { href: '/', label: 'Cerrar sesión', onClick: () => signOut({ callbackUrl: '/' }) },
        ]}
      />
    </>
  );
}

function NavAdmin() {
  const pathname = usePathname();
  const [masAbierto, setMasAbierto] = useState(false);

  return (
    <>
      <div className="flex items-center justify-around h-16">
        <NavItem
          href="/admin/kanban"
          label="Kanban"
          icon={<KanbanIcon />}
          active={pathname === '/admin/kanban'}
        />
        <NavItem
          href="/admin/menu"
          label="Menú"
          icon={<MenuIcon />}
          active={pathname === '/admin/menu'}
        />
        <NavItem
          href="/admin/escaner"
          label="Escáner"
          icon={<QrIcon />}
          active={pathname === '/admin/escaner'}
        />
        <button
          onClick={() => setMasAbierto(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-2 flex-1 min-w-0 text-cafe-400"
        >
          <MenuIcon />
          <span className="text-[10px] font-medium">Más</span>
        </button>
      </div>

      <DrawerMas
        abierto={masAbierto}
        onCerrar={() => setMasAbierto(false)}
        items={[
          { href: '/admin/historial', label: 'Historial' },
          { href: '/admin/empleados', label: 'Empleados' },
          { href: '/admin/dias-no-laborables', label: 'Días no laborables' },
          { href: '/admin/configuracion', label: 'Configuración' },
          { href: '/admin/no-show', label: 'No-show' },
          { href: '/', label: 'Cerrar sesión', onClick: () => signOut({ callbackUrl: '/' }) },
        ]}
      />
    </>
  );
}

function DrawerMas({
  abierto,
  onCerrar,
  items,
}: {
  abierto: boolean;
  onCerrar: () => void;
  items: { href: string; label: string; onClick?: () => void }[];
}) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg border border-cafe-100 p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item) =>
          item.onClick ? (
            <button
              key={item.label}
              onClick={() => {
                onCerrar();
                item.onClick?.();
              }}
              className="w-full text-left px-4 py-3 text-sm text-cafe-800 hover:bg-crema-100 rounded-lg"
            >
              {item.label}
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCerrar}
              className="block px-4 py-3 text-sm text-cafe-800 hover:bg-crema-100 rounded-lg"
            >
              {item.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}

// Iconos simples en SVG
function ListIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function KanbanIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="12" rx="1" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
