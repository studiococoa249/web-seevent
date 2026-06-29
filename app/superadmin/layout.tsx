"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastProvider } from '@/lib/toast-context';

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/superadmin',
      icon: 'fa-solid fa-chart-line',
    },
    {
      name: 'Manajemen User',
      href: '/superadmin/user',
      icon: 'fa-solid fa-users',
    },
    {
      name: 'Kategori Event',
      href: '/superadmin/event/kategori',
      icon: 'fa-solid fa-tags',
    },
    {
      name: 'Data Event',
      href: '/superadmin/event/data',
      icon: 'fa-solid fa-calendar-days',
    },
    {
      name: 'Transaksi Pembayaran',
      href: '/superadmin/pembayaran',
      icon: 'fa-solid fa-money-bill-transfer',
    },
    {
      name: 'Konfigurasi Tripay',
      href: '/superadmin/tripay',
      icon: 'fa-solid fa-gear',
    },
    {
      name: 'Imagekit API',
      href: '/superadmin/imagekit-api',
      icon: 'fa-solid fa-image',
    },
    {
      name: 'Pengaturan Web',
      href: '/superadmin/setting',
      icon: 'fa-solid fa-sliders',
    },
  ];

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar dari panel admin?')) {
      setIsLoggingOut(true);
      try {
        // We can call a logout API or delete cookie.
        // Let's call an API route (which we will create or just handle here by hitting a delete route)
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
          router.push('/auth/login');
        } else {
          // Fallback delete cookie on client or redirect
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Logout failed:', error);
        router.push('/auth/login');
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-poppins flex">
      {/* Font & Stylesheet Imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Sidebar - Desktop */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 bg-white border-r border-slate-100 flex flex-col z-20 shrink-0 sticky top-0 h-screen`}
      >
        {/* Brand/Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="bg-emerald-600 text-white w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
              <i className="fa-solid fa-shield-halved text-base"></i>
            </div>
            {isSidebarOpen && (
              <span className="text-lg font-bold text-emerald-800 tracking-tight whitespace-nowrap">
                se<span className="text-emerald-600">event</span> <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 font-medium">Admin</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-emerald-600 p-1.5 hover:bg-slate-50 rounded-lg hidden md:block"
          >
            <i className={`fa-solid ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'}`}></i>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive =
              item.href === '/superadmin'
                ? pathname === '/superadmin'
                : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                <i className={`${item.icon} text-base shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'}`}></i>
                {isSidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar / Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all ${
              isSidebarOpen ? '' : 'justify-center'
            }`}
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-base shrink-0"></i>
            {isSidebarOpen && (
              <span>{isLoggingOut ? 'Keluar...' : 'Keluar Panel'}</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header navbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sm:px-8 z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger */}
            <button className="md:hidden text-slate-500 hover:text-emerald-600">
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
            <h2 className="text-base font-semibold text-slate-700 hidden sm:block">
              {pathname === '/superadmin'
                ? 'Ringkasan Sistem'
                : menuItems.find((item) => pathname.startsWith(item.href))?.name || 'Superadmin Panel'}
            </h2>
          </div>

          {/* Right navbar profile */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              className="text-xs font-semibold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 px-3.5 py-2 border border-emerald-100 rounded-xl transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-globe"></i>
              Lihat Website
            </a>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                SA
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">Super Admin</p>
                <p className="text-xs text-slate-400">System Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      </div>
    </ToastProvider>
  );
}
