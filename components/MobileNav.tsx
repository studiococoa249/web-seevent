"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { getAvatarPlaceholder } from '@/lib/avatar';

export default function MobileNav() {
  const pathname = usePathname();
  const [avatarUrl, setAvatarUrl] = useState('/profile/cowok.png');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setIsAuthenticated(true);
            setAvatarUrl(data.user.profile?.profile_url_imagekit || getAvatarPlaceholder(data.user.id, data.user.nama_lengkap));
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Failed to fetch user in MobileNav:", e);
        setIsAuthenticated(false);
      }
    };
    fetchUser();
  }, []);

  const isHome = pathname === '/';
  const isExplore = pathname === '/explore';
  const isProfile = pathname?.startsWith('/user/profile');
  const isLogin = pathname === '/auth/login';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-50">
      <Link href="/" className={`flex flex-col items-center p-2 transition-colors ${isHome ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}>
        <i className="fa-solid fa-house text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Beranda</span>
      </Link>
      
      <Link href="/explore" className={`flex flex-col items-center p-2 transition-colors ${isExplore ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}>
        <i className="fa-solid fa-compass text-xl mb-1"></i>
        <span className="text-[10px] font-medium">Eksplor</span>
      </Link>
      
      {/* Floating Action Button (FAB) Style for Create */}
      <div className="relative -top-5">
        <Link href="/create" className="bg-emerald-500 text-white w-12 h-12 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center active:scale-95 transition-transform border-[4px] border-white">
          <i className="fa-solid fa-plus text-xl"></i>
        </Link>
      </div>

      {isAuthenticated === true && (
        <NotificationBell isMobile={true} />
      )}

      {isAuthenticated === true ? (
        <Link href="/user/profile" className={`flex flex-col items-center p-2 transition-colors ${isProfile ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}>
          <div className={`w-6 h-6 rounded-full overflow-hidden border mb-1 transition-all ${isProfile ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
            <img src={avatarUrl} alt="Profil" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] font-medium">Profil</span>
        </Link>
      ) : isAuthenticated === false ? (
        <Link href="/auth/login" className={`flex flex-col items-center p-2 transition-colors ${isLogin ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'}`}>
          <i className="fa-solid fa-right-to-bracket text-xl mb-1"></i>
          <span className="text-[10px] font-medium">Masuk</span>
        </Link>
      ) : (
        // Small loading placeholder to prevent layout shifts
        <div className="w-10 h-10 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-slate-100 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}
