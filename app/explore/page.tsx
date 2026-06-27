"use client";

import React, { useState } from 'react';

export default function App() {
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' atau 'list'

    // Data Dummy untuk kategori
    const categories = [
        { name: 'Semua', icon: 'fa-layer-group' },
        { name: 'Konser', icon: 'fa-music' },
        { name: 'Olahraga', icon: 'fa-basketball' },
        { name: 'E-Sports', icon: 'fa-gamepad' },
        { name: 'Pameran', icon: 'fa-palette' },
        { name: 'Workshop', icon: 'fa-chalkboard-user' },
        { name: 'Kuliner', icon: 'fa-utensils' },
        { name: 'Trip', icon: 'fa-plane' },
    ];

    // Data Dummy untuk ajakan (invites)
    const invites = [
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
            price: 'Gratis / Bayar Sendiri',
            description: 'Pengen foto-foto estetik tapi gak ada yang fotoin wkwk. Yuk mutualan dan berangkat bareng.',
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
            id: 4,
            host: 'Siska',
            hostAge: 24,
            hostAvatar: 'https://i.pravatar.cc/150?img=9',
            eventName: 'Workshop Keramik & Pottery',
            location: 'Tanah Liat Studio, Jogja',
            date: 'Sabtu, 31 Agu 2026',
            needs: 1,
            current: 1,
            category: 'Workshop',
            price: 'Rp 150.000',
            description: 'Ada promo buy 1 get 1 buat workshop keramik bulan ini. Cari temen patungan aja biar lebih hemat!',
        },
        {
            id: 5,
            host: 'Reza',
            hostAge: 22,
            hostAvatar: 'https://i.pravatar.cc/150?img=59',
            eventName: 'Mabar MLBB M-Series',
            location: 'Discord / Warkop Berkah, Depok',
            date: 'Malam ini, 20:00 WIB',
            needs: 2,
            current: 3,
            category: 'E-Sports',
            price: 'Bebas',
            description: 'Kurang Roamer sama Jungler nih buat push Mythic. Mic on, anti toxic toxic club. Yuk gas!',
        },
        {
            id: 6,
            host: 'Budi',
            hostAge: 27,
            hostAvatar: 'https://i.pravatar.cc/150?img=68',
            eventName: 'CFD Sudirman',
            location: 'Bunderan HI, Jakarta',
            date: 'Minggu, 1 Sep 2026',
            needs: 3,
            current: 2,
            category: 'Olahraga',
            price: 'Gratis',
            description: 'Lari pagi pelan-pelan aja pace 7-8. Sekalian hunting sarapan bubur ayam di sabang.',
        },
        {
            id: 7,
            host: 'Tia',
            hostAge: 20,
            hostAvatar: 'https://i.pravatar.cc/150?img=47',
            eventName: 'Hunting Jajanan Blok M',
            location: 'Blok M Square, Jakarta',
            date: 'Sabtu, 17 Agu 2026',
            needs: 2,
            current: 2,
            category: 'Kuliner',
            price: 'Bayar Sendiri',
            description: 'Lagi pengen nyobain gultik sama ngopi di little tokyo. Cari temen cewek aja ya biar seru ngobrolnya!',
        }
    ];

    // Filter logika berdasarkan pencarian teks dan kategori
    const filteredInvites = invites.filter(invite => {
        const matchCategory = activeCategory === 'Semua' || invite.category === activeCategory;
        const matchSearch = invite.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invite.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

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
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-emerald-200 shadow-md">
                            <i className="fa-solid fa-users text-sm"></i>
                        </div>
                        <span className="text-xl font-bold text-emerald-800 tracking-tight">se <span className="text-emerald-500">event</span></span>
                    </div>

                    {/* Desktop Nav Items */}
                    <nav className="hidden md:flex items-center gap-6">
                        <a href="/" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">Beranda</a>
                        {/* Active Link */}
                        <a href="/explore" className="text-emerald-600 font-medium">Eksplor</a>
                        <a href="/create" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">Buat Ajakan</a>
                        <a href="/pesan" className="text-slate-500 hover:text-emerald-600 transition-colors font-medium">Pesan</a>
                    </nav>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button className="hidden md:block text-slate-500 hover:text-emerald-600 transition-colors relative p-2">
                            <i className="fa-regular fa-bell text-xl"></i>
                            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></div>
                        </button>
                        <div className="w-9 h-9 rounded-full bg-emerald-100 overflow-hidden border-2 border-emerald-500 cursor-pointer">
                            <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">

                {/* Header Eksplor */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2">Temukan Event & Teman Baru</h1>
                    <p className="text-slate-500 text-sm md:text-base max-w-2xl">Mulai dari hangout santai, patungan olahraga, sampai nonton konser. Cari ajakan yang sesuai frekuensimu.</p>
                </div>

                {/* --- SEARCH & FILTER SECTION --- */}
                <section className="mb-8 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        {/* Search Input */}
                        <div className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <i className="fa-solid fa-magnifying-glass text-slate-400 group-focus-within:text-emerald-500 transition-colors"></i>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="Cari event, tempat, atau artis kesukaanmu..."
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button className="flex-1 md:flex-none px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-semibold hover:border-emerald-300 hover:text-emerald-600 hover:shadow-sm transition-all flex items-center justify-center gap-2">
                                <i className="fa-solid fa-location-dot"></i> Sekitarmu
                            </button>
                            <button className="flex-1 md:flex-none px-6 py-3.5 bg-slate-800 text-white rounded-2xl text-sm font-semibold hover:bg-slate-700 transition-all shadow-md shadow-slate-200 flex items-center justify-center gap-2">
                                <i className="fa-solid fa-sliders"></i> Filter
                            </button>
                        </div>
                    </div>

                    {/* Category Pills (Horizontal Scroll) */}
                    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar pt-1">
                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat.name
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50 border border-emerald-500'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                    }`}
                            >
                                <i className={`fa-solid ${cat.icon}`}></i> {cat.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* --- HASIL PENCARIAN --- */}
                <section>
                    <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                            Hasil Ajakan <span className="text-slate-400 font-normal text-sm ml-2">({filteredInvites.length} ditemukan)</span>
                        </h2>

                        {/* View Toggles (Desktop only) */}
                        <div className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}>
                                <i className="fa-solid fa-border-all"></i>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}>
                                <i className="fa-solid fa-list-ul"></i>
                            </button>
                        </div>
                    </div>

                    {/* Render List or Grid based on viewMode */}
                    {filteredInvites.length > 0 ? (
                        <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
                            {filteredInvites.map((invite) => (
                                <div key={invite.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 duration-300 flex flex-col h-full group">

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
                                            <i className={`fa-solid ${categories.find(c => c.name === invite.category)?.icon} mr-1`}></i>
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

                                        {invite.price && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <i className="fa-solid fa-wallet text-xs"></i>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Biaya</p>
                                                    <p className="text-xs text-slate-700 font-medium">{invite.price}</p>
                                                </div>
                                            </div>
                                        )}
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
                    ) : (
                        /* Empty State */
                        <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 border-dashed">
                            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner">
                                <i className="fa-solid fa-face-frown-open"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Yah, belum ada ajakan nih!</h3>
                            <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
                                Tidak ada yang mencari teman untuk kategori "<span className="font-semibold">{activeCategory}</span>" atau pencarian "<span className="font-semibold">{searchQuery}</span>".
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveCategory('Semua'); }}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-semibold py-3 px-6 rounded-full transition-all flex items-center justify-center gap-2 mx-auto">
                                <i className="fa-solid fa-rotate-left"></i> Reset Filter
                            </button>
                        </div>
                    )}
                </section>

            </main>

            {/* --- MOBILE BOTTOM NAVIGATION --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-50">
                <a href="/" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-house text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Beranda</span>
                </a>

                {/* Active Link (Eksplor) */}
                <a href="/explore" className="flex flex-col items-center p-2 text-emerald-500 transition-colors">
                    <i className="fa-solid fa-compass text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Eksplor</span>
                </a>

                {/* Floating Action Button (FAB) Style for Create */}
                <div className="relative -top-5">
                    <button className="bg-emerald-500 text-white w-14 h-14 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center active:scale-95 transition-transform border-[4px] border-white">
                        <i className="fa-solid fa-plus text-xl"></i>
                    </button>
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