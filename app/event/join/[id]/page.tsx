"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';
import { supabase } from '@/lib/supabase';

interface Category {
  name: string;
}

interface EventData {
  id: string;
  title: string;
  location: string;
  event_date: string;
  patungan: number | null;
  max_participants: number;
  id_users: string;
  category_event: Category | null;
  users: {
    nama_lengkap: string;
  } | null;
}

export default function JoinEvent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const initPage = async () => {
      try {
        // 1. Verify user authentication session
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/auth/login');
          return;
        }
        const authData = await authRes.json();
        if (!authData.authenticated) {
          router.push('/auth/login');
          return;
        }

        setCheckingAuth(false);

        // 2. Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('event')
          .select(`
            id,
            title,
            location,
            event_date,
            patungan,
            max_participants,
            id_users,
            category_event (
              name
            ),
            users (
              nama_lengkap
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

        // Prevent organizers from joining their own event
        if (eventData.id_users === authData.user.id) {
          showToast('Anda adalah penyelenggara event ini.', 'warning');
          router.push(`/event/detail/${id}`);
          return;
        }

        setEvent(eventData as any);
      } catch (err) {
        console.error('Error loading join confirmation page:', err);
        showToast('Gagal memuat detail konfirmasi.', 'error');
      } finally {
        setLoadingEvent(false);
      }
    };

    initPage();
  }, [id, router, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      showToast('Harap setujui syarat komitmen kehadiran terlebih dahulu.', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/event/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_event: id,
          pesan_tambahan: message.trim(), // Can be stored if we extend table, otherwise just passed
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim permintaan bergabung.');
      }

      showToast(data.message || 'Permintaan bergabung berhasil dikirim!', 'success');
      router.push(`/event/detail/${id}`);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth || loadingEvent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-poppins text-slate-600 gap-3">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}</style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-500"></i>
        <span className="text-sm font-semibold">Memeriksa detail pendaftaran...</span>
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

  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-24 md:pb-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            type="button" 
            onClick={() => router.push(`/event/detail/${id}`)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors active:scale-95"
          >
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-lg font-bold text-slate-800 absolute left-1/2 -translate-x-1/2">
            Konfirmasi Bergabung
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8">
        
        <div className="mb-6 text-center">
          <span className="text-emerald-500 text-3xl mb-2 block"><i className="fa-solid fa-handshake-angle animate-bounce"></i></span>
          <h2 className="text-xl font-extrabold text-slate-800 mb-1">Kirim Permintaan Bergabung</h2>
          <p className="text-xs text-slate-400">Pastikan Anda berkomitmen untuk hadir dan mengikuti tata tertib.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* EVENT SUMMARY CARD */}
          <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ringkasan Acara</h3>
            
            <div className="border-l-4 border-emerald-500 pl-4 space-y-2">
              <h4 className="font-bold text-base text-slate-800">{event.title}</h4>
              <p className="text-xs text-slate-500 font-medium">
                Penyelenggara: <span className="text-slate-700 font-semibold">{event.users?.nama_lengkap}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <i className="fa-regular fa-calendar text-emerald-500 shrink-0 w-4"></i>
                <span className="truncate">{dateStr} ({timeStr})</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <i className="fa-solid fa-location-dot text-emerald-500 shrink-0 w-4"></i>
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <i className="fa-solid fa-tag text-emerald-500 shrink-0 w-4"></i>
                <span>Kategori: {event.category_event?.name || 'Lainnya'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <i className="fa-solid fa-wallet text-emerald-500 shrink-0 w-4"></i>
                <span className="font-semibold text-emerald-600">
                  Patungan: {event.patungan && event.patungan > 0 
                    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(event.patungan)
                    : 'Gratis'}
                </span>
              </div>
            </div>
          </section>

          {/* BASIC GUIDELINES */}
          <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Komitmen Kehadiran</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">1</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Tepat Waktu:</strong> Hadir di lokasi kegiatan tepat pada waktu kumpul yang ditentukan untuk menghargai teman lainnya.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">2</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Patungan Adil:</strong> Membayar estimasi biaya patungan secara transparan ke penyelenggara sesuai dengan rincian acara.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">3</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Saling Menghargai:</strong> Menjaga kesopanan, keamanan, dan bersikap ramah agar terjalin pertemanan baru yang menyenangkan.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500/50 border-slate-300 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Saya berkomitmen untuk mematuhi aturan kehadiran di atas secara sadar dan bertanggung jawab.
                </span>
              </label>
            </div>
          </section>

          {/* MESSAGE TO HOST */}
          <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pesan Singkat Untuk Host (Opsional)</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 resize-none placeholder-slate-400"
              placeholder="Contoh: Halo bro, saya berangkat bareng temen dari daerah Semarang Selatan, ntar kita kumpul di depan pintu gerbang ya..."
            ></textarea>
            <div className="text-[10px] text-slate-400 text-right font-medium">
              {message.length} / 200 karakter
            </div>
          </section>

          {/* SUBMIT BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={() => router.push(`/event/detail/${id}`)}
              className="flex-1 bg-white hover:bg-slate-100 text-slate-600 font-semibold py-3.5 rounded-2xl text-xs border border-slate-200 transition-colors active:scale-95"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={submitting || !agreed}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  Mengirim permintaan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  Kirim Permintaan Join
                </>
              )}
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}
