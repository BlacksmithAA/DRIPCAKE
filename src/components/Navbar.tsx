'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

type NavItem = { href: string; label: string };

export function Navbar({ items, brand = 'Dripcake' }: { items: NavItem[]; brand?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-cafe-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif font-bold text-cafe-800 text-xl">{brand}</Link>
          <nav className="hidden md:flex items-center gap-1">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    active ? 'bg-dorado-100 text-cafe-900' : 'text-cafe-600 hover:bg-crema-200'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-cafe-600">
            {session?.user?.name}
          </span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost text-sm">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
