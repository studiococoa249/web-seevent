"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast-context';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { getAvatarPlaceholder } from '@/lib/avatar';

interface Profile {
  profile_url_imagekit: string | null;
  bio: string | null;
  instagram_url: string | null;
}

interface User {
  id: string;
  nama_lengkap: string;
  email: string;
  profile: Profile | null;
}

interface Participant {
  id: string;
  status: 'Pending' | 'Confirmed' | 'Declined';
  joint_date: string;
  users: User | null;
}

interface EventData {
  id: string;
  title: string;
  location: string;
  event_date: string;
  max_participants: number;
  id_users: string;
}

export default function EventAcceptClient({
  id,
}: {
  id: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchEventAndParticipants = async (userId: string) => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('event')
        .select('id, title, location, event_date, max_participants, id_users')
        .eq('id', id)
        .maybeSingle();

      if (eventError) throw eventError;

      if (!eventData) {
        showToast('Event tidak ditemukan.', 'error');
        router.push('/user/event/all');
        return;
      }

      if (eventData.id_users !== userId) {
        showToast('Anda tidak memiliki hak akses untuk mengelola event ini.', 'error');
        router.push('/user/event/all');
        return;
      }

      setEvent(eventData);

      const { data: partData, error: partError } = await supabase
        .from('event_participants')
        .select(`
          id,
          status,
          joint_date,
          users (
            id,
            nama_lengkap,
            email,
            profile (
              profile_url_imagekit,
              bio,
              instagram_url
            )
          )
        `)
        .eq('id_event', id)
        .order('joint_date', { ascending: false });

      if (partError) throw partError;
      
      const filteredParts = (partData || []).filter((p: any) => p.users?.id !== userId) as unknown as Participant[];
      setParticipants(filteredParts);

    } catch (err: any) {
      console.error('Error loading accept page data:', err);
      showToast(err.message || 'Gagal memuat data pendaftaran.', 'error');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/auth/login');
          return;
        }
        const authData = await authRes.json();
        if (!authData.authenticated || !authData.user?.id) {
          router.push('/auth/login');
          return;
        }

        const userId = authData.user.id;
        setCheckingAuth(false);
        await fetchEventAndParticipants(userId);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth/login');
      }
    };

    initPage();
  }, [id, router]);

  const handleStatusChange = async (participantId: string, newStatus: 'Confirmed' | 'Declined') => {
    setProcessingId(participantId);
    try {
      const response = await fetch('/api/event/join', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: participantId,
          status: newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui status pendaftaran.');
      }

      showToast(data.message || 'Status pendaftaran berhasil diperbarui!', 'success');
      
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData.user?.id) {
          await fetchEventAndParticipants(sessionData.user.id);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah status pendaftaran.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (checkingAuth || loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-poppins text-slate-600 gap-3">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}</style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-500"></i>
        <span className="text-sm font-semibold">Memuat data pendaftaran...</span>
      </div>
    );
  }

  if (!event) return null;

  const pendingList = participants.filter(p => p.status === 'Pending');
  const confirmedList = participants.filter(p => p.status === 'Confirmed');
  const declinedList = participants.filter(p => p.status === 'Declined');

  const dateStr = new Date(event.event_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-24 md:pb-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/user/event/all')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">Kelola Pendaftaran</h1>
            <p className="text-xs text-slate-500">Event: {event.title}</p>
          </div>
        </div>

        <section className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="border-l-4 border-emerald-500 pl-4">
            <h3 className="font-bold text-base text-slate-800">{event.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ringkasan rincian pelaksanaan event</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 pt-2">
            <div className="flex items-center gap-2.5">
              <i className="fa-regular fa-calendar text-emerald-500 text-sm w-4 shrink-0"></i>
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-location-dot text-emerald-500 text-sm w-4 shrink-0"></i>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-users text-emerald-500 text-sm w-4 shrink-0"></i>
              <span>Kuota Terisi: <span className="font-bold text-slate-800">{confirmedList.length + 1}</span> {event.max_participants > 0 ? `/ ${event.max_participants} Orang` : '(Bebas Kuota)'}</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Menunggu Persetujuan ({pendingList.length})
          </h3>

          {pendingList.length === 0 ? (
            <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center text-slate-400 text-xs font-semibold">
              Tidak ada permintaan bergabung yang tertunda.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingList.map((part) => {
                const avatar = part.users?.profile?.profile_url_imagekit || getAvatarPlaceholder(part.users?.id, part.users?.nama_lengkap);
                const isProcessing = processingId === part.id;
                
                return (
                  <div key={part.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
                    <div className="flex gap-4 items-start">
                      <img src={avatar} alt={part.users?.nama_lengkap} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">{part.users?.nama_lengkap}</h4>
                        {part.users?.profile?.bio && (
                          <p className="text-xs text-slate-500 italic max-w-md">"{part.users.profile.bio}"</p>
                        )}
                        <p className="text-[10px] text-slate-400">Diajukan pada: {new Date(part.joint_date).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {part.users?.id && (
                        <button
                          onClick={() => router.push(`/user/profile/${part.users?.id}`)}
                          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm shadow-sm transition-colors"
                          title="Lihat Profil"
                        >
                          <i className="fa-regular fa-user"></i>
                        </button>
                      )}
                      {part.users?.profile?.instagram_url && (
                        <a
                          href={part.users.profile.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm shadow-sm transition-colors"
                          title="Cek Instagram"
                        >
                          <i className="fa-brands fa-instagram"></i>
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleStatusChange(part.id, 'Declined')}
                        disabled={isProcessing}
                        className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleStatusChange(part.id, 'Confirmed')}
                        disabled={isProcessing}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-md shadow-emerald-100 hover:shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isProcessing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-check"></i>}
                        Setujui
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Telah Disetujui ({confirmedList.length})
          </h3>

          {confirmedList.length === 0 ? (
            <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center text-slate-400 text-xs font-semibold">
              Belum ada peserta yang disetujui.
            </div>
          ) : (
            <div className="space-y-4">
              {confirmedList.map((part) => {
                const avatar = part.users?.profile?.profile_url_imagekit || getAvatarPlaceholder(part.users?.id, part.users?.nama_lengkap);
                const isProcessing = processingId === part.id;

                return (
                  <div key={part.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-4 items-start">
                      <img src={avatar} alt={part.users?.nama_lengkap} className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">{part.users?.nama_lengkap}</h4>
                        {part.users?.profile?.bio && (
                          <p className="text-xs text-slate-500 italic">"{part.users.profile.bio}"</p>
                        )}
                        <span className="inline-block text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Joined</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {part.users?.id && (
                        <button
                          onClick={() => router.push(`/user/profile/${part.users?.id}`)}
                          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm shadow-sm transition-colors"
                          title="Lihat Profil"
                        >
                          <i className="fa-regular fa-user"></i>
                        </button>
                      )}
                      {part.users?.profile?.instagram_url && (
                        <a
                          href={part.users.profile.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-sm shadow-sm transition-colors"
                        >
                          <i className="fa-brands fa-instagram"></i>
                        </a>
                      )}
                      <button
                        onClick={() => handleStatusChange(part.id, 'Declined')}
                        disabled={isProcessing}
                        className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        Batalkan Gabung
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {declinedList.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Ditolak ({declinedList.length})
            </h3>
            <div className="space-y-4">
              {declinedList.map((part) => {
                const avatar = part.users?.profile?.profile_url_imagekit || getAvatarPlaceholder(part.users?.id, part.users?.nama_lengkap);
                const isProcessing = processingId === part.id;

                return (
                  <div key={part.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75">
                    <div className="flex gap-4 items-start">
                      <img src={avatar} alt={part.users?.nama_lengkap} className="w-12 h-12 rounded-full object-cover border border-slate-200 grayscale" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">{part.users?.nama_lengkap}</h4>
                        <span className="inline-block text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">Ditolak</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {part.users?.id && (
                        <button
                          onClick={() => router.push(`/user/profile/${part.users?.id}`)}
                          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm shadow-sm transition-colors"
                          title="Lihat Profil"
                        >
                          <i className="fa-regular fa-user"></i>
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(part.id, 'Confirmed')}
                        disabled={isProcessing}
                        className="px-4 py-2 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        Setujui Kembali
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
