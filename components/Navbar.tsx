import React from 'react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-emerald-200 shadow-md">
            <i className="fa-solid fa-users text-sm"></i>
          </div>
          <span className="text-xl font-bold text-emerald-800 tracking-tight">se <span className="text-emerald-500">event</span></span>
        </Link>
        
        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-emerald-600 font-medium">Beranda</Link>
          <Link href="/explore" className="text-slate-500 hover:text-emerald-600 transition-colors">Eksplor</Link>
          <Link href="/create" className="text-slate-500 hover:text-emerald-600 transition-colors">Buat Ajakan</Link>
          <Link href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">Pesan</Link>
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden md:block">
            <NotificationBell />
          </div>
          <Link href="/user/profile" className="w-9 h-9 rounded-full bg-emerald-100 overflow-hidden border-2 border-emerald-500 cursor-pointer">
            <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>
    </header>
  );
}
