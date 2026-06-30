"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast-context';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';

interface RekomendasiEvent {
  id: string;
  name: string;
  slug: string;
  desc: string | null;
  banner_imagekit_url: string | null;
  detail_event: {
    organizer?: string;
    event_date?: string;
    location?: string;
    patungan?: number;
  } | null;
  create_at: string;
}

export default function RekomendasiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<RekomendasiEvent | null>(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('rekomendasi_event')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          showToast('Rekomendasi event tidak ditemukan.', 'error');
          router.push('/');
          return;
        }

        setEvent(data);
      } catch (err: any) {
        console.error('Error fetching recommendation detail:', err);
        showToast('Gagal memuat detail rekomendasi.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [slug, router, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-poppins text-slate-600 gap-3">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght=300;400;500;600;700&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}</style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-500"></i>
        <span className="text-sm font-semibold">Memuat rincian rekomendasi...</span>
      </div>
    );
  }

  if (!event) return null;

  const detail = event.detail_event || {};
  const displayPrice = detail.patungan !== undefined
    ? detail.patungan > 0
      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(detail.patungan)
      : 'Bebas / Gratis'
    : 'Bebas / Gratis';

  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-24 md:pb-12">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght=300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* --- NAVBAR --- */}
      <Navbar />

      {/* --- HERO BANNER --- */}
      <div className="relative h-64 md:h-96 w-full bg-slate-100 overflow-hidden shadow-sm">
        {event.banner_imagekit_url ? (
          <>
            {/* Blurry background effect */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
              style={{ backgroundImage: `url(${event.banner_imagekit_url})` }}
            ></div>
            {/* Real banner */}
            <img src={event.banner_imagekit_url} alt={event.name} className="w-full h-full object-contain relative z-10" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
            <i className="fa-solid fa-image text-white/30 text-5xl"></i>
          </div>
        )}
        
        {/* Back Button (Mobile) */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md text-slate-700 hover:bg-white active:scale-95 transition-all"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
      </div>

      {/* --- CONTAINER --- */}
      <main className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Details & Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100/50 space-y-5">
              
              {/* Badge & Title */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <i className="fa-solid fa-star text-amber-500 text-[9px]"></i>
                    Pilihan Editor
                  </span>
                  {detail.organizer && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">
                      {detail.organizer}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight leading-tight">
                  {event.name}
                </h1>
              </div>

              {/* Description */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Tentang Event Rekomendasi</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {event.desc || 'Tidak ada deskripsi tambahan untuk event rekomendasi ini.'}
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT: Quick Info Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100/50 space-y-6 sticky top-24">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                Informasi Acara
              </h3>

              {/* Info Items */}
              <div className="space-y-4">
                
                {/* Host */}
                {detail.organizer && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-user text-xs"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Penyelenggara</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{detail.organizer}</p>
                    </div>
                  </div>
                )}

                {/* Date */}
                {detail.event_date && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <i className="fa-regular fa-calendar-days text-xs"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tanggal & Waktu</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{detail.event_date}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {detail.location && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-location-dot text-xs"></i>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lokasi</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{detail.location}</p>
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-tags text-xs"></i>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Biaya / Patungan</p>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">{displayPrice}</p>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => router.back()}
                  className="w-full py-3 bg-slate-800 hover:bg-emerald-600 text-white font-semibold rounded-2xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                  Kembali
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* --- MOBILE NAV --- */}
      <MobileNav />
    </div>
  );
}
