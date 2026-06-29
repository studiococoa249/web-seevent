import React from 'react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

export default function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-50">
      <Link href="/" className="flex flex-col items-center p-2 text-emerald-500">
        <i className="fa-solid fa-house text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Beranda</span>
      </Link>
      <Link href="/explore" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
        <i className="fa-solid fa-compass text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Eksplor</span>
      </Link>
      
      {/* Floating Action Button (FAB) Style for Create */}
      <div className="relative -top-5">
        <Link href="/create" className="bg-emerald-500 text-white w-12 h-12 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center active:scale-95 transition-transform">
          <i className="fa-solid fa-plus text-xl"></i>
        </Link>
      </div>

      <NotificationBell isMobile={true} />

      <Link href="#" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors relative">
        <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
        <i className="fa-solid fa-message text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Pesan</span>
      </Link>
      <Link href="/user/profile" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
        <i className="fa-solid fa-user text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Profil</span>
      </Link>
    </div>
  );
}
