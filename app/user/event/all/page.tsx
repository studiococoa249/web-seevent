"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast-context';

interface CategoryEvent {
  name: string;
  slug: string;
}

interface Profile {
  profile_url_imagekit: string | null;
}

interface User {
  id: string;
  nama_lengkap: string;
  profile: Profile | null;
}

interface Participant {
  id: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  users: User | null;
}

interface DbEvent {
  id: string;
  title: string;
  location: string;
  event_date: string;
  max_participants: number;
  status: 'Draft' | 'Publish' | 'Cancelled' | 'Completed';
  pesan_ajakan: string | null;
  patungan: number | null;
  id_users: string;
  category_event: CategoryEvent | null;
  event_participants: Participant[] | null;
}

interface UiEvent {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  date: string;
  time: string;
  location: string;
  needs: number;
  joined: number;
  status: 'aktif' | 'penuh' | 'selesai' | 'draft';
  participantAvatars: string[];
}

export default function App() {
    const router = useRouter();
    const { showToast } = useToast();
    
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('aktif'); // 'aktif' atau 'riwayat'
    const [currentPage, setCurrentPage] = useState(1);
    const [myEvents, setMyEvents] = useState<UiEvent[]>([]);
    
    const itemsPerPage = 8;

    const getCategoryIcon = (slug: string) => {
        const lower = (slug || '').toLowerCase();
        if (lower.includes('konser') || lower.includes('music')) return 'fa-music';
        if (lower.includes('olahraga') || lower.includes('soccer') || lower.includes('sport') || lower.includes('basket')) return 'fa-basketball';
        if (lower.includes('game') || lower.includes('esport') || lower.includes('e-sport')) return 'fa-gamepad';
        if (lower.includes('pameran') || lower.includes('art') || lower.includes('museum') || lower.includes('seni')) return 'fa-palette';
        if (lower.includes('workshop') || lower.includes('seminar') || lower.includes('class') || lower.includes('belajar')) return 'fa-chalkboard-user';
        if (lower.includes('kuliner') || lower.includes('makan') || lower.includes('food') || lower.includes('kopi')) return 'fa-utensils';
        return 'fa-star';
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    useEffect(() => {
        const initPage = async () => {
            try {
                // 1. Check if user is authenticated
                const authRes = await fetch('/api/auth/me');
                if (!authRes.ok) {
                    router.push('/auth/login');
                    return;
                }
                const authData = await authRes.json();
                if (!authData.authenticated || !authData.user) {
                    router.push('/auth/login');
                    return;
                }

                setCheckingAuth(false);

                // 2. Fetch events from database
                const { data, error } = await supabase
                    .from('event')
                    .select(`
                        id,
                        title,
                        location,
                        event_date,
                        max_participants,
                        status,
                        pesan_ajakan,
                        patungan,
                        id_users,
                        category_event (
                            name,
                            slug
                        ),
                        event_participants (
                            id,
                            status,
                            users (
                                id,
                                nama_lengkap,
                                profile (
                                    profile_url_imagekit
                                )
                            )
                        )
                    `)
                    .eq('id_users', authData.user.id)
                    .order('event_date', { ascending: false });

                if (error) throw error;

                // 3. Format database entries to match UI models
                const formatted: UiEvent[] = (data as unknown as DbEvent[] || []).map((evt: DbEvent) => {
                    const confirmedParticipants = evt.event_participants?.filter((p: Participant) => p.status === 'Confirmed') || [];
                    const joinedCount = confirmedParticipants.length;
                    
                    const dateObj = new Date(evt.event_date);
                    const dateStr = dateObj.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });
                    const timeStr = dateObj.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) + ' WIB';

                    const avatars = confirmedParticipants.map((p: Participant, idx: number) => {
                        return p.users?.profile?.profile_url_imagekit || `https://i.pravatar.cc/150?img=${(idx % 70) + 1}`;
                    });

                    // Determine status for UI
                    let uiStatus: 'aktif' | 'penuh' | 'selesai' | 'draft' = 'aktif';
                    if (evt.status === 'Draft') {
                        uiStatus = 'draft';
                    } else if (evt.status === 'Cancelled' || evt.status === 'Completed' || dateObj < new Date()) {
                        uiStatus = 'selesai';
                    } else if (evt.max_participants > 0 && joinedCount >= evt.max_participants) {
                        uiStatus = 'penuh';
                    }

                    return {
                        id: evt.id,
                        title: evt.title,
                        category: evt.category_event?.name || 'Lainnya',
                        categoryIcon: getCategoryIcon(evt.category_event?.slug || ''),
                        date: dateStr,
                        time: timeStr,
                        location: evt.location,
                        needs: evt.max_participants,
                        joined: joinedCount,
                        status: uiStatus,
                        participantAvatars: avatars
                    };
                });

                setMyEvents(formatted);

            } catch (err: unknown) {
                console.error('Error fetching user events:', err);
                const errMsg = err instanceof Error ? err.message : 'Unknown error';
                showToast('Gagal memuat ajakan saya: ' + errMsg, 'error');
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [router, showToast]);

    // Filter events based on active tab
    const filteredEvents = myEvents.filter(event => {
        if (activeTab === 'aktif') return event.status === 'aktif' || event.status === 'penuh' || event.status === 'draft';
        return event.status === 'selesai';
    });

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const displayedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'aktif':
                return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Mencari Teman</span>;
            case 'penuh':
                return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Kuota Penuh</span>;
            case 'selesai':
                return <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Selesai</span>;
            case 'draft':
                return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">Draft</span>;
            default:
                return null;
        }
    };

    if (checkingAuth || loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-poppins text-slate-600 gap-3">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght=300;400;500;600;700&display=swap');
                    .font-poppins { font-family: 'Poppins', sans-serif; }
                `}</style>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-500"></i>
                <span className="text-sm font-semibold">Memuat ajakan saya...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-24 md:pb-12">
            {/* Inject Google Fonts & Font Awesome */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght=300;400;500;600;700&display=swap');
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
                    <button 
                        onClick={() => router.push('/create')}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-emerald-600 transition-colors active:scale-95"
                    >
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

            <main className="max-w-7xl mx-auto px-4 pt-6">

                {displayedEvents.length === 0 ? (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                            <i className="fa-regular fa-folder-open text-4xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada ajakan</h3>
                        <p className="text-sm text-slate-500 max-w-[250px] mb-6">Kamu belum memiliki ajakan di kategori ini. Yuk buat sekarang!</p>
                        <button 
                            onClick={() => router.push('/create')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-6 rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-95"
                        >
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
                                <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 h-14">{event.title}</h3>

                                <div className="grid grid-cols-1 gap-2 mb-5">
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                            <i className="fa-regular fa-calendar-days"></i>
                                        </div>
                                        <div>
                                            <p className="font-medium text-xs">{event.date}</p>
                                            <p className="text-[10px] text-slate-400">{event.time}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                                            <i className="fa-solid fa-location-dot"></i>
                                        </div>
                                        <div className="truncate pr-2">
                                            <p className="font-medium text-xs truncate">{event.location}</p>
                                            <p className="text-[10px] text-slate-400 truncate">Ketemuan di lokasi</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Members & Progress */}
                                <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-500 mb-2">Slot Teman Terisi</p>
                                        <div className="flex -space-x-2">
                                            {/* Render avatars based on joined members */}
                                            {event.participantAvatars.map((avatarUrl, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={avatarUrl} alt="member" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {/* Render empty slots based on needs - joined */}
                                            {event.needs > 0 && [...Array(Math.min(5, Math.max(0, event.needs - event.joined)))].map((_, i) => (
                                                <div key={`empty-${i}`} className="w-8 h-8 rounded-full bg-white border-2 border-slate-200 border-dashed flex items-center justify-center">
                                                    <i className="fa-solid fa-user-plus text-[10px] text-slate-300"></i>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-slate-800">{event.joined}</span>
                                        {event.needs > 0 ? (
                                            <>
                                                <span className="text-sm font-semibold text-slate-400">/{event.needs}</span>
                                                <p className="text-[10px] text-slate-400 mt-1">Orang</p>
                                            </>
                                        ) : (
                                            <p className="text-[10px] text-slate-400 mt-1">Peserta (Bebas)</p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 pt-2">
                                    <button 
                                        onClick={() => showToast('Untuk mengubah detail ajakan ini, silakan hubungi admin atau kelola pendaftaran peserta pada detail event.', 'info')}
                                        className="flex-1 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 font-semibold py-2.5 rounded-xl transition-all text-sm flex justify-center items-center gap-2"
                                    >
                                        <i className="fa-regular fa-pen-to-square"></i> Edit
                                    </button>
                                    <button 
                                        onClick={() => router.push(`/event/detail/${event.id}`)}
                                        className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md text-sm flex justify-center items-center gap-2"
                                    >
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

            {/* MOBILE STICKY BOTTOM NAVIGATION */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-50">
                <Link href="/" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-house text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Beranda</span>
                </Link>
                <Link href="/explore" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-compass text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Eksplor</span>
                </Link>

                {/* Floating Action Button */}
                <div className="relative -top-5">
                    <button 
                        onClick={() => router.push('/create')}
                        className="bg-emerald-500 text-white w-12 h-12 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <i className="fa-solid fa-plus text-xl"></i>
                    </button>
                </div>

                <Link href="/user/event/all" className="flex flex-col items-center p-2 text-emerald-500 transition-colors relative">
                    <i className="fa-solid fa-clipboard-list text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Ajakan</span>
                </Link>
                <Link href="/profil" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-user text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Profil</span>
                </Link>
            </div>

        </div>
    );
}