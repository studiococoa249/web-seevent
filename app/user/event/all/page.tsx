"use client";

import React, { useState } from 'react';

export default function App() {
    const [activeTab, setActiveTab] = useState('aktif'); // 'aktif' atau 'riwayat'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    // Dummy data ajakan yang dibuat oleh user (diri sendiri)
    const baseEvents = [
        {
            id: 1,
            title: 'Main Mini Soccer Malam',
            category: 'Olahraga',
            categoryIcon: 'fa-basketball',
            date: 'Jumat, 28 Jun 2026',
            time: '19:00 WIB',
            location: 'Kickoff Arena, Semarang',
            needs: 5,
            joined: 3,
            status: 'aktif', // aktif, penuh, selesai
        },
        {
            id: 2,
            title: 'Nonton Konser Dewa 19 - VIP',
            category: 'Konser',
            categoryIcon: 'fa-music',
            date: 'Sabtu, 29 Jun 2026',
            time: '15:00 WIB',
            location: 'Stadion Diponegoro, Semarang',
            needs: 2,
            joined: 2,
            status: 'penuh',
        },
        {
            id: 3,
            title: 'Hunting Foto Kota Lama',
            category: 'Lainnya',
            categoryIcon: 'fa-star',
            date: 'Minggu, 15 Jun 2026',
            time: '16:00 WIB',
            location: 'Kota Lama, Semarang',
            needs: 3,
            joined: 3,
            status: 'selesai',
        }
    ];

    // Generate more items for pagination demonstration
    const myEvents = Array.from({ length: 24 }).map((_, i) => ({
        ...baseEvents[i % 3],
        id: i + 1,
        title: `${baseEvents[i % 3].title} ${i + 1}`,
        status: i % 4 === 0 ? 'selesai' : (i % 3 === 0 ? 'penuh' : 'aktif')
    }));

    // Filter events based on active tab
    const filteredEvents = myEvents.filter(event => {
        if (activeTab === 'aktif') return event.status === 'aktif' || event.status === 'penuh';
        return event.status === 'selesai';
    });

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const displayedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'aktif':
                return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Mencari Teman</span>;
            case 'penuh':
                return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Kuota Penuh</span>;
            case 'selesai':
                return <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Selesai</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-24 md:pb-12">
            {/* Inject Google Fonts & Font Awesome */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="w-10 h-10 flex items-center justify-center">
                        {/* Kosong untuk menjaga balance judul di tengah, bisa diisi tombol back nanti */}
                    </div>
                    <h1 className="text-lg font-bold text-slate-800 absolute left-1/2 -translate-x-1/2">
                        Ajakan Saya
                    </h1>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-emerald-600 transition-colors active:scale-95">
                        <i className="fa-solid fa-plus text-lg"></i>
                    </button>
                </div>

                {/* TABS */}
                <div className="max-w-7xl mx-auto px-4 flex">
                    <button
                        onClick={() => handleTabChange('aktif')}
                        className={`flex-1 py-3.5 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === 'aktif' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Berjalan & Aktif
                    </button>
                    <button
                        onClick={() => handleTabChange('riwayat')}
                        className={`flex-1 py-3.5 text-sm font-semibold text-center border-b-2 transition-colors ${activeTab === 'riwayat' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Riwayat
                    </button>
                </div>
            </header>

            { }
            <main className="max-w-7xl mx-auto px-4 pt-6">

                {displayedEvents.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <i className="fa-regular fa-folder-open text-4xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada ajakan</h3>
                        <p className="text-sm text-slate-500 max-w-[250px] mb-6">Kamu belum memiliki ajakan di kategori ini. Yuk buat sekarang!</p>
                        <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-6 rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-95">
                            Buat Ajakan Baru
                        </button>
                    </div>
                ) : (
                    /* EVENT LIST */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedEvents.map((event) => (
                            <div key={event.id} className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">

                                {/* Header Card: Category & Status */}
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <i className={`fa-solid ${event.categoryIcon} text-emerald-500 text-xs`}></i>
                                        <span className="text-xs font-semibold text-slate-600">{event.category}</span>
                                    </div>
                                    {getStatusBadge(event.status)}
                                </div>

                                {/* Main Content */}
                                <h3 className="text-lg font-bold text-slate-800 mb-3">{event.title}</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                            <i className="fa-regular fa-calendar-days"></i>
                                        </div>
                                        <div>
                                            <p className="font-medium">{event.date}</p>
                                            <p className="text-xs text-slate-400">{event.time}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                                            <i className="fa-solid fa-location-dot"></i>
                                        </div>
                                        <div className="truncate pr-2">
                                            <p className="font-medium truncate">{event.location}</p>
                                            <p className="text-xs text-slate-400 truncate">Ketemuan di lokasi</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Members & Progress */}
                                <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 mb-2">Slot Teman Terisi</p>
                                        <div className="flex -space-x-2">
                                            {/* Render avatars based on joined members */}
                                            {[...Array(event.joined)].map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/150?img=${i * 10 + event.id}`} alt="member" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {/* Render empty slots based on needs - joined */}
                                            {[...Array(event.needs - event.joined)].map((_, i) => (
                                                <div key={`empty-${i}`} className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 border-dashed flex items-center justify-center">
                                                    <i className="fa-solid fa-user-plus text-[10px] text-slate-300"></i>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-slate-800">{event.joined}</span>
                                        <span className="text-sm font-semibold text-slate-400">/{event.needs}</span>
                                        <p className="text-[10px] text-slate-400 mt-1">Orang</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button className="flex-1 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 font-semibold py-2.5 rounded-xl transition-all text-sm flex justify-center items-center gap-2">
                                        <i className="fa-regular fa-pen-to-square"></i> Edit
                                    </button>
                                    <button className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md text-sm flex justify-center items-center gap-2">
                                        Kelola <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold transition-colors ${currentPage === i + 1 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600'}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </main>

            { }
            {/* MOBILE STICKY BOTTOM NAVIGATION */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-50">
                <a href="#" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-house text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Beranda</span>
                </a>
                <a href="#" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-compass text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Eksplor</span>
                </a>

                {/* Floating Action Button */}
                <div className="relative -top-5">
                    <button className="bg-emerald-500 text-white w-12 h-12 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center active:scale-95 transition-transform">
                        <i className="fa-solid fa-plus text-xl"></i>
                    </button>
                </div>

                <a href="#" className="flex flex-col items-center p-2 text-emerald-500 transition-colors relative">
                    <i className="fa-solid fa-clipboard-list text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Ajakan</span>
                </a>
                <a href="#" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-user text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Profil</span>
                </a>
            </div>

        </div>
    );
}