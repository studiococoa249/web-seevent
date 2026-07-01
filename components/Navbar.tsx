"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from './NotificationBell';
import { getAvatarPlaceholder } from '@/lib/avatar';

export default function Navbar() {
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
        console.error("Failed to fetch user in Navbar:", e);
        setIsAuthenticated(false);
      }
    };
    fetchUser();
  }, []);

  const isHome = pathname === '/';
  const isExplore = pathname === '/explore';
  const isCreate = pathname === '/create';
  const isPesan = pathname === '/pesan';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="se event" className="h-8 object-contain" />
        </Link>
        
        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className={`font-medium transition-colors ${isHome ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-emerald-600'}`}>Beranda</Link>
          <Link href="/explore" className={`font-medium transition-colors ${isExplore ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-emerald-600'}`}>Eksplor</Link>
          <Link href="/create" className={`font-medium transition-colors ${isCreate ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-emerald-600'}`}>Buat Ajakan</Link>
          <Link href="#" className={`font-medium transition-colors ${isPesan ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-emerald-600'}`}>Pesan</Link>
        </nav>

        <div className="flex items-center gap-3 flex-shrink-0 min-h-[36px]">
          {isAuthenticated === null ? (
            // Loading placeholder skeleton to prevent layout shift
            <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse"></div>
          ) : isAuthenticated ? (
            <>
              <div className="hidden md:block">
                <NotificationBell />
              </div>
              <Link href="/user/profile" className="w-9 h-9 rounded-full bg-emerald-100 overflow-hidden border-2 border-emerald-500 cursor-pointer transition-transform hover:scale-105">
                <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/auth/login" 
                className="text-slate-600 hover:text-emerald-600 text-sm font-medium py-2 px-4 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
              >
                Masuk
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-md shadow-emerald-100 hover:shadow-emerald-200 active:scale-95 transition-all"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

