"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';
import { supabase } from '@/lib/supabase';

interface Category {
  name: string;
  slug: string;
}

interface UserProfile {
  profile_url_imagekit: string | null;
  bio: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
}

interface User {
  id: string;
  nama_lengkap: string;
  email: string;
  profile: UserProfile | null;
}

interface Participant {
  id: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  users: {
    id: string;
    nama_lengkap: string;
    profile: {
      profile_url_imagekit: string | null;
    } | null;
  };
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  location: string;
  desc_full: string;
  pesan_ajakan: string;
  event_date: string;
  max_participants: number;
  status: string;
  image_url_imagekit: string | null;
  patungan: number | null;
  id_users: string;
  category_event: Category | null;
  users: User | null;
}

export default function EventDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Stats
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [myJoinStatus, setMyJoinStatus] = useState<'Pending' | 'Confirmed' | 'Declined' | null>(null);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch current user session
      const authRes = await fetch('/api/auth/me');
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.authenticated && authData.user) {
          setCurrentUserId(authData.user.id);
        }
      }

      // 2. Fetch event data with organizer and category details
      const { data: eventData, error: eventError } = await supabase
        .from('event')
        .select(`
          *,
          category_event (
            name,
            slug
          ),
          users (
            id,
            nama_lengkap,
            email,
            profile (
              profile_url_imagekit,
              bio,
              instagram_url,
              tiktok_url
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (eventError) throw eventError;
      if (!eventData) {
        showToast('Event tidak ditemukan.', 'error');
        router.push('/');
        return;
      }

      setEvent(eventData);

      // 3. Fetch participants
      const { data: partsData, error: partsError } = await supabase
        .from('event_participants')
        .select(`
          id,
          status,
          users (
            id,
            nama_lengkap,
            profile (
              profile_url_imagekit
            )
          )
        `)
        .eq('id_event', id);

      if (partsError) throw partsError;

      const castedParticipants = (partsData || []) as unknown as Participant[];
      setParticipants(castedParticipants);

      // Calculate stats
      const confirmed = castedParticipants.filter(p => p.status === 'Confirmed');
      setConfirmedCount(confirmed.length);

      // Find current user join status
      const userJoin = castedParticipants.find(p => p.users?.id === currentUserId);
      if (userJoin) {
        setMyJoinStatus(userJoin.status);
      }
    } catch (err: any) {
      console.error('Error fetching event details:', err);
      showToast('Gagal memuat rincian event.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, currentUserId]);

  const handleCancelJoin = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan keikutsertaan Anda dalam event ini?')) return;
    
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('id_event', id)
        .eq('id_users', currentUserId);

      if (error) throw error;

      showToast('Berhasil membatalkan keikutsertaan.', 'success');
      setMyJoinStatus(null);
      fetchEventDetails(); // Reload data
    } catch (err: any) {
      showToast(err.message || 'Gagal membatalkan keikutsertaan.', 'error');
    }
  };

  const getCategoryIcon = (slug: string) => {
    const lower = slug.toLowerCase();
    if (lower.includes('konser') || lower.includes('music')) return 'fa-music';
    if (lower.includes('olahraga') || lower.includes('soccer') || lower.includes('sport') || lower.includes('basket')) return 'fa-basketball';
    if (lower.includes('game') || lower.includes('esport') || lower.includes('e-sport')) return 'fa-gamepad';
    if (lower.includes('pameran') || lower.includes('art') || lower.includes('museum') || lower.includes('seni')) return 'fa-palette';
    if (lower.includes('workshop') || lower.includes('seminar') || lower.includes('class') || lower.includes('belajar')) return 'fa-chalkboard-user';
    if (lower.includes('kuliner') || lower.includes('makan') || lower.includes('food') || lower.includes('kopi')) return 'fa-utensils';
    return 'fa-star';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-poppins text-slate-600 gap-3">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}</style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-500"></i>
        <span className="text-sm font-semibold">Memuat detail event...</span>
      </div>
    );
  }

  if (!event) return null;

  const dateStr = new Date(event.event_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const timeStr = new Date(event.event_date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }) + ' WIB';

  const isOrganizer = currentUserId === event.id_users;
  const isFull = event.max_participants > 0 && confirmedCount >= event.max_participants;
  const isPending = myJoinStatus === 'Pending';
  const isConfirmed = myJoinStatus === 'Confirmed';

  const organizerAvatar = event.users?.profile?.profile_url_imagekit || `https://i.pravatar.cc/150?img=33`;

  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-24 md:pb-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            type="button" 
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors active:scale-95"
          >
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-lg font-bold text-slate-800 absolute left-1/2 -translate-x-1/2">
            Rincian Ajakan
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* HERO BANNER SECTION */}
        <div className="relative rounded-3xl overflow-hidden aspect-[21/9] max-h-[380px] w-full bg-slate-800 shadow-md border border-slate-100 mb-8 group">
          {event.image_url_imagekit ? (
            <img src={event.image_url_imagekit} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700 flex items-center justify-center">
              <i className="fa-solid fa-users text-white text-[120px] opacity-10"></i>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6 md:p-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 mb-3 uppercase tracking-wider">
                <i className={`fa-solid ${event.category_event ? getCategoryIcon(event.category_event.slug) : 'fa-star'}`}></i>
                {event.category_event?.name || 'Lainnya'}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                {event.title}
              </h2>
            </div>
          </div>
        </div>

        {/* CONTAINER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDE: DETAILS & DESC */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Event Stats / Info Cards */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <i className="fa-regular fa-calendar-days text-base"></i>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hari & Tanggal</span>
                  <span className="text-xs font-semibold text-slate-700">{dateStr}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <i className="fa-regular fa-clock text-base"></i>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jam Kumpul</span>
                  <span className="text-xs font-semibold text-slate-700">{timeStr}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-wallet text-base"></i>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimasi Patungan</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {event.patungan && event.patungan > 0 
                      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(event.patungan)
                      : 'Gratis / Bebas'}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]"><i className="fa-solid fa-location-dot"></i></span>
                Lokasi Kegiatan
              </h3>
              <p className="text-slate-600 text-sm font-medium pl-8">
                {event.location}
              </p>
            </div>

            {/* Pesan Ajakan Highlight */}
            {event.pesan_ajakan && (
              <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/40 relative">
                <i className="fa-solid fa-quote-left text-emerald-100 text-4xl absolute top-3 left-3 z-0"></i>
                <div className="relative z-10 pl-6">
                  <p className="text-slate-600 text-sm font-medium italic leading-relaxed">
                    "{event.pesan_ajakan}"
                  </p>
                </div>
              </div>
            )}

            {/* Full Description */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]"><i className="fa-solid fa-circle-info"></i></span>
                Detail Ajakan
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                {event.desc_full || 'Tidak ada deskripsi rinci.'}
              </p>
            </div>

            {/* Confirmed Participants list */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]"><i className="fa-solid fa-users-viewfinder"></i></span>
                  Daftar Peserta ({confirmedCount} Terkonfirmasi)
                </h3>
                <span className="text-xs text-slate-400 font-semibold">
                  {event.max_participants > 0 ? `Batas kuota: ${event.max_participants} orang` : 'Kuota tidak dibatasi'}
                </span>
              </div>

              {participants.filter(p => p.status === 'Confirmed').length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  Belum ada peserta terkonfirmasi.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {participants.filter(p => p.status === 'Confirmed').map((part, idx) => {
                    const avatarUrl = part.users?.profile?.profile_url_imagekit || `https://i.pravatar.cc/150?img=${(idx % 70) + 1}`;
                    return (
                      <div key={part.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                        <img src={avatarUrl} alt={part.users?.nama_lengkap} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{part.users?.nama_lengkap}</p>
                          <p className="text-[10px] text-emerald-600 font-medium">Joined</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDE: ORGANIZER INFO & ACTION CARD */}
          <div className="space-y-6">
            
            {/* Host Profile Info */}
            <Link
              href={event.users?.id ? `/user/profile/${event.users.id}` : '#'}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center hover:border-emerald-200 hover:shadow-md transition-all duration-200 group cursor-pointer block"
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-4">Penyelenggara / Host</span>
              <img src={organizerAvatar} alt={event.users?.nama_lengkap} className="w-20 h-20 rounded-full object-cover border-4 border-emerald-50 mb-3 shadow-sm group-hover:border-emerald-200 transition-all" />
              <h4 className="text-base font-bold text-slate-800 mb-1 group-hover:text-emerald-700 transition-colors">{event.users?.nama_lengkap}</h4>
              <p className="text-xs text-slate-400 font-medium mb-3">{event.users?.email}</p>
              {event.users?.profile?.bio && (
                <p className="text-xs text-slate-500 italic px-2 leading-relaxed mb-4">
                  "{event.users.profile.bio}"
                </p>
              )}
              
              {/* Host Social Media */}
              <div className="flex gap-2.5 mb-4">
                {event.users?.profile?.instagram_url && (
                  <a
                    href={event.users.profile.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm transition-colors shadow-sm"
                  >
                    <i className="fa-brands fa-instagram"></i>
                  </a>
                )}
                {event.users?.profile?.tiktok_url && (
                  <a
                    href={event.users.profile.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center text-sm transition-colors shadow-sm"
                  >
                    <i className="fa-brands fa-tiktok"></i>
                  </a>
                )}
              </div>

              {/* View Profile CTA */}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 group-hover:text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-all">
                <i className="fa-solid fa-user text-[10px]"></i>
                Lihat Profil
              </span>
            </Link>

            {/* ACTION CARD PANEL */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Status Ketersediaan</h3>
              
              {event.max_participants > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Kuota Terisi</span>
                    <span className="text-slate-700">{confirmedCount} / {event.max_participants} Orang</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${confirmedCount >= event.max_participants ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (confirmedCount / event.max_participants) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* ACTION ACTIONS */}
              {isOrganizer ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-4 rounded-2xl text-center">
                  <i className="fa-solid fa-crown text-emerald-600 text-lg mb-1.5 block"></i>
                  <p className="text-xs font-bold mb-1">Anda adalah Penyelenggara</p>
                  <p className="text-[10px] text-emerald-600/80 leading-normal">
                    Anda mengelola event ini dan dapat memoderasi pendaftaran peserta dari dashboard profil Anda.
                  </p>
                </div>
              ) : isConfirmed ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-4 rounded-2xl text-center">
                    <i className="fa-solid fa-circle-check text-emerald-600 text-lg mb-1.5 block"></i>
                    <p className="text-xs font-bold mb-1">Anda Sudah Tergabung</p>
                    <p className="text-[10px] text-emerald-600/80 leading-normal">
                      Pendaftaran Anda telah disetujui oleh host. Selamat berteman baru!
                    </p>
                  </div>
                  <button 
                    onClick={handleCancelJoin}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold py-3 rounded-2xl text-xs transition-colors shadow-sm"
                  >
                    Batal Gabung
                  </button>
                </div>
              ) : isPending ? (
                <div className="space-y-3">
                  <div className="bg-amber-50 text-amber-800 border border-amber-100 p-4 rounded-2xl text-center">
                    <i className="fa-solid fa-clock-rotate-left text-amber-600 text-lg mb-1.5 block"></i>
                    <p className="text-xs font-bold mb-1">Menunggu Persetujuan</p>
                    <p className="text-[10px] text-amber-600/80 leading-normal">
                      Permintaan bergabung Anda telah terkirim dan sedang menunggu keputusan host.
                    </p>
                  </div>
                  <button 
                    onClick={handleCancelJoin}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-semibold py-3 rounded-2xl text-xs transition-colors shadow-sm"
                  >
                    Batal Permintaan
                  </button>
                </div>
              ) : isFull ? (
                <div className="bg-red-50 text-red-800 border border-red-100 p-4 rounded-2xl text-center">
                  <i className="fa-solid fa-circle-xmark text-red-600 text-lg mb-1.5 block"></i>
                  <p className="text-xs font-bold mb-1">Kuota Sudah Penuh</p>
                  <p className="text-[10px] text-red-600/80 leading-normal">
                    Slot untuk event ini sudah habis. Silakan cari ajakan event menarik lainnya!
                  </p>
                </div>
              ) : (
                <Link 
                  href={`/event/join/${id}`}
                  className="w-full block text-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 text-sm"
                >
                  <i className="fa-solid fa-user-plus mr-1.5"></i> Gabung Bareng
                </Link>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
