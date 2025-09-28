'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, PiggyBank, Repeat } from 'lucide-react';
import { clsx } from 'clsx';
import SignOutButton from '../auth/SignOutButton';

const navItems = [
  { href: '/dashboard', label: 'Dasbor', icon: Home },
  { href: '/budgets', label: 'Anggaran', icon: Target },
  { href: '/goals', label: 'Celengan', icon: PiggyBank },
  { href: '/recurring', label: 'Transaksi Rutin', icon: Repeat },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r flex flex-col">
      <div className="h-16 flex items-center justify-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <PiggyBank className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Celengan.ku</h1>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center px-4 py-2 text-gray-700 rounded-lg transition-colors',
                {
                  'bg-blue-100 text-blue-700 font-semibold': isActive,
                  'hover:bg-gray-100': !isActive,
                }
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <SignOutButton />
      </div>
    </aside>
  );
}