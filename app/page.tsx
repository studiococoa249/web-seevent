"use client";

import React, { useState } from 'react';

export default function Home() {


  // Data Dummy untuk kategori
  const categories = [
    { name: 'Semua', icon: 'fa-layer-group' },
    { name: 'Konser', icon: 'fa-music' },
    { name: 'Olahraga', icon: 'fa-basketball' },
    { name: 'E-Sports', icon: 'fa-gamepad' },
    { name: 'Pameran', icon: 'fa-palette' },
    { name: 'Workshop', icon: 'fa-chalkboard-user' },
  ];

  // Data Dummy untuk ajakan terbaru (Hanya menampilkan 3-4 terbaru di Home)
  const recentInvites = [
    {
      id: 1,
      host: 'Arka',
      hostAge: 23,
      hostAvatar: 'https://i.pravatar.cc/150?img=11',
      eventName: 'Konser Dewa 19 - Tour',
      location: 'Stadion Utama GBK, Jakarta',
      date: 'Sabtu, 24 Agu 2026',
      needs: 2,
      current: 1,
      category: 'Konser',
      price: 'Rp 450.000',
      description: 'Cari teman bareng nih, tiket udah aman di Tribune B. Biar gak awkward nonton sendiri!',
    },
    {
      id: 3,
      host: 'Kevin',
      hostAge: 25,
      hostAvatar: 'https://i.pravatar.cc/150?img=15',
      eventName: 'Fun Futsal Akhir Pekan',
      location: 'Champion Futsal, Bandung',
      date: 'Jumat, 23 Agu 2026',
      needs: 4,
      current: 6,
      category: 'Olahraga',
      price: 'Patungan Rp 35k',
      description: 'Kurang 4 orang lagi nih buat patungan bayar lapangan. Skill bebas yang penting keringetan!',
    },
    {
      id: 2,
      host: 'Dina',
      hostAge: 21,
      hostAvatar: 'https://i.pravatar.cc/150?img=5',
      eventName: 'Museum Macan Exhibition',
      location: 'AKR Tower, Jakarta',
      date: 'Minggu, 25 Agu 2026',
      needs: 1,
      current: 1,
      category: 'Pameran',
      price: 'Bayar Sendiri',
      description: 'Pengen foto-foto estetik tapi gak ada yang fotoin wkwk. Yuk mutualan dan berangkat bareng.',
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-20 md:pb-0">
      {/* Inject Google Fonts & Font Awesome 6 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* --- NAVBAR --- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-emerald-200 shadow-md">
              <i className="fa-solid fa-users text-sm"></i>
            </div>
            <span className="text-xl font-bold text-emerald-800 tracking-tight">se <span className="text-emerald-500">event</span></span>
          </div>
          
          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-emerald-600 font-semibold border-b-2 border-emerald-500 py-1">Beranda</a>
            <a href="/explore" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium py-1">Eksplor</a>
            <a href="/create" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium py-1">Buat Ajakan</a>
            <a href="/pesan" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium py-1">Pesan</a>
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="hidden md:block text-slate-500 hover:text-emerald-600 transition-colors relative p-2">
              <i className="fa-regular fa-bell text-xl"></i>
              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></div>
            </button>
            <div className="w-9 h-9 rounded-full bg-emerald-100 overflow-hidden border-2 border-emerald-500 cursor-pointer shadow-sm">
              <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        
        {/* --- HERO SECTION --- */}
        <section className="mb-14 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 lg:pr-10 z-10">
            <span className="inline-block py-1.5 px-4 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-bold mb-5 tracking-wider uppercase border border-emerald-200">
              #TemanBaruEventSeru
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[54px] xl:text-[64px] font-extrabold text-slate-800 leading-[1.15] mb-6 tracking-tight">
              Cari Teman <span className="text-emerald-500 relative inline-block whitespace-nowrap">
                Satu Frekuensi!
                <svg className="absolute w-full h-3 md:h-4 -bottom-1 left-0 text-emerald-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-slate-500 mb-10 text-base md:text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
              Temukan partner atau grup sefrekuensi untuk event favoritmu. Dari nonton konser, olahraga, hingga pameran seni.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="/explore" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 px-8 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                <i className="fa-solid fa-compass text-lg"></i> Eksplor Event
              </a>
              <a href="/create" className="bg-white border-2 border-emerald-100 hover:border-emerald-500 text-emerald-700 font-semibold py-3.5 px-8 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                <i className="fa-solid fa-plus text-lg"></i> Buat Ajakan
              </a>
            </div>
          </div>

          {/* Hero Illustration (Hidden on mobile) */}
          <div className="flex-1 hidden md:flex justify-center relative w-full h-[400px]">
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
            
            {/* Mockup Card 1 */}
            <div className="absolute top-10 right-20 w-64 bg-white border border-slate-100 shadow-xl rounded-3xl p-4 rotate-6 hover:rotate-0 hover:-translate-y-2 transition-all duration-300 z-20">
              <div className="flex items-center gap-3 mb-3">
                <img src="https://i.pravatar.cc/150?img=11" className="w-10 h-10 rounded-full" alt="Arka" />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Arka, 23</h3>
                  <p className="text-[10px] text-emerald-600 font-medium">Konser Dewa 19</p>
                </div>
              </div>
              <div className="flex -space-x-2 mt-2">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center"><i className="fa-solid fa-user text-emerald-500 text-xs"></i></div>
                 <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 border-dashed flex items-center justify-center"><i className="fa-solid fa-plus text-slate-300 text-xs"></i></div>
                 <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 border-dashed flex items-center justify-center"><i className="fa-solid fa-plus text-slate-300 text-xs"></i></div>
              </div>
            </div>

            {/* Mockup Card 2 */}
            <div className="absolute bottom-10 left-10 w-72 bg-slate-800 border border-slate-700 shadow-2xl rounded-3xl p-4 -rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-300 z-30">
              <div className="flex items-center gap-3 mb-3">
                <img src="https://i.pravatar.cc/150?img=5" className="w-10 h-10 rounded-full" alt="Dina" />
                <div>
                  <h3 className="text-sm font-bold text-white">Dina, 21</h3>
                  <p className="text-[10px] text-emerald-400 font-medium">Museum Macan Exhibition</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 italic">"Pengen foto-foto estetik tapi gak ada yang fotoin wkwk..."</p>
            </div>
          </div>
        </section>



        {/* --- RECENT INVITES FEED --- */}
        <section>
          <div className="flex items-end justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">Ajakan Terbaru</h2>
              <p className="text-sm text-slate-500 mt-1">Gabung sekarang sebelum slot penuh!</p>
            </div>
            <a href="/explore" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-colors hidden sm:inline-block">
              Lihat Semua <i className="fa-solid fa-arrow-right ml-1"></i>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentInvites.map((invite) => (
              <div key={invite.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 duration-300 flex flex-col h-full group">
                  
                {/* Host Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={invite.hostAvatar} alt={invite.host} className="w-11 h-11 rounded-full object-cover border-2 border-emerald-50" />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{invite.host}, <span className="font-normal text-slate-500">{invite.hostAge}</span></h3>
                      <p className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        Mencari {invite.needs} teman
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 text-slate-500 rounded-md border border-slate-100">
                    <i className={`fa-solid ${categories.find(c => c.name === invite.category)?.icon || 'fa-tag'} mr-1`}></i>
                    {invite.category}
                  </span>
                </div>

                {/* Event Details */}
                <h4 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">{invite.eventName}</h4>
                
                <div className="space-y-2 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="fa-regular fa-calendar-days text-xs"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Waktu</p>
                      <p className="text-xs text-slate-700 font-medium">{invite.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="fa-solid fa-location-dot text-xs"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Lokasi</p>
                      <p className="text-xs text-slate-700 font-medium line-clamp-1">{invite.location}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6 flex-grow relative bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <i className="fa-solid fa-quote-left text-slate-200 absolute top-2 left-2 text-lg"></i>
                  <p className="text-xs text-slate-600 leading-relaxed relative z-10 pl-5 pr-2 py-1 line-clamp-3">
                    {invite.description}
                  </p>
                </div>

                {/* Action & Status */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-medium mb-1">Slot Tersedia</span>
                    <div className="flex -space-x-2">
                      {/* Fake current members */}
                      {[...Array(invite.current)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center z-10 shadow-sm" title="Member (Terisi)">
                          <img src={`https://i.pravatar.cc/150?img=${i + 20}`} className="w-full h-full rounded-full opacity-80" />
                        </div>
                      ))}
                      {/* Empty Slots */}
                      {[...Array(invite.needs)].map((_, i) => (
                        <div key={`empty-${i}`} className="w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 border-dashed flex items-center justify-center z-0" title="Slot Kosong">
                          <i className="fa-solid fa-plus text-[10px] text-slate-300"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button className="bg-slate-800 hover:bg-emerald-500 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors active:scale-95 shadow-md shadow-slate-200 hover:shadow-emerald-200">
                    Join Bareng
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile "Lihat Semua" Button */}
          <div className="mt-6 text-center sm:hidden">
            <a href="/explore" className="inline-block w-full bg-emerald-50 text-emerald-600 font-semibold py-3.5 rounded-2xl border border-emerald-100">
              Lihat Semua Ajakan
            </a>
          </div>
        </section>

      </main>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-50">
        {/* Active Link (Beranda) */}
        <a href="/" className="flex flex-col items-center p-2 text-emerald-500 transition-colors">
          <i className="fa-solid fa-house text-xl mb-1"></i>
          <span className="text-[10px] font-medium">Beranda</span>
        </a>
        
        <a href="/explore" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
          <i className="fa-solid fa-compass text-xl mb-1"></i>
          <span className="text-[10px] font-medium">Eksplor</span>
        </a>
        
        {/* Floating Action Button (FAB) Style for Create */}
        <div className="relative -top-5">
          <a href="/create" className="bg-emerald-500 text-white w-14 h-14 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center active:scale-95 transition-transform border-[4px] border-white">
            <i className="fa-solid fa-plus text-xl"></i>
          </a>
        </div>

        <a href="/pesan" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors relative">
          <div className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          <i className="fa-solid fa-message text-xl mb-1"></i>
          <span className="text-[10px] font-medium">Pesan</span>
        </a>
        <a href="/profil" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
          <i className="fa-solid fa-user text-xl mb-1"></i>
          <span className="text-[10px] font-medium">Profil</span>
        </a>
      </div>

    </div>
  );
}