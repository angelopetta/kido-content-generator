'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'Home' },
  { href: '/generate', label: 'Generate', icon: 'Sparkles' },
  { href: '/content', label: 'Content Library', icon: 'FileText' },
  { href: '/documents', label: 'Documents', icon: 'Upload' },
  { href: '/templates', label: 'Templates', icon: 'Layout' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden rounded-md bg-gray-800 p-2 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 transform bg-gray-900 text-white transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-700">
            <h1 className="text-lg font-bold">KIDO Content Generator</h1>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="border-t border-gray-700 p-4">
            <button
              onClick={() => signOut()}
              className="w-full rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
