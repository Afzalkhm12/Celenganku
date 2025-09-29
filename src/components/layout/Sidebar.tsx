'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, PiggyBank, Repeat, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import SignOutButton from '../auth/SignOutButton';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dasbor', icon: Home },
  { href: '/budgets', label: 'Anggaran', icon: Target },
  { href: '/goals', label: 'Celengan', icon: PiggyBank },
  { href: '/recurring', label: 'Transaksi Rutin', icon: Repeat },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm',
          'md:relative md:translate-x-0 md:z-auto',
          'fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out',
          {
            'translate-x-0': isMobileMenuOpen,
            '-translate-x-full': !isMobileMenuOpen,
          }
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-6">
          <Link href="/dashboard" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <PiggyBank className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Celengan.ku</h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={clsx(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                  {
                    'bg-blue-50 text-blue-700 border-r-4 border-blue-600 shadow-sm': isActive,
                    'text-gray-700 hover:bg-gray-50 hover:text-gray-900': !isActive,
                  }
                )}
              >
                <item.icon className={clsx('h-5 w-5 mr-3', {
                  'text-blue-600': isActive,
                  'text-gray-500': !isActive,
                })} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}