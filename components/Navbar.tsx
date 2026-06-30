"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';
import { getAvatarPlaceholder } from '@/lib/avatar';

export default function Navbar() {
  const [avatarUrl, setAvatarUrl] = useState('/profile/cowok.png');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAvatarUrl(data.user.profile?.profile_url_imagekit || getAvatarPlaceholder(data.user.id, data.user.nama_lengkap));
          }
        }
      } catch (e) {
        console.error("Failed to fetch user in Navbar:", e);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.png" alt="se event" className="h-8 object-contain" />
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
            <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
          </Link>
        </div>
      </div>
    </header>
  );
}
