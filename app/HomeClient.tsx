"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { getAvatarPlaceholder } from '@/lib/avatar';
import MobileNav from '@/components/MobileNav';

export default function HomeClient() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rekomendasi, setRekomendasi] = useState<any[]>([]);
  const [loadingRekomendasi, setLoadingRekomendasi] = useState(true);

  // Data Dummy untuk kategori
  const categories = [
    { name: 'Semua', icon: 'fa-layer-group' },
    { name: 'Konser', icon: 'fa-music' },
    { name: 'Olahraga', icon: 'fa-basketball' },
    { name: 'E-Sports', icon: 'fa-gamepad' },
    { name: 'Pameran', icon: 'fa-palette' },
    { name: 'Workshop', icon: 'fa-chalkboard-user' },
  ];

  useEffect(() => {
    const fetchRecentEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('event')
          .select(`
            id,
            title,
            location,
            desc_full,
            event_date,
            max_participants,
            image_url_imagekit,
            pesan_ajakan,
            patungan,
            category_event (
              name
            ),
            users (
              nama_lengkap,
              profile (
                profile_url_imagekit
              )
            ),
            event_participants (
              id,
              status,
              users (
                nama_lengkap,
                profile (
                  profile_url_imagekit
                )
              )
            )
          `)
          .eq('status', 'Publish')
          .order('create_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setEvents(data || []);
      } catch (err) {
        console.error('Error fetching recent events:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRekomendasi = async () => {
      setLoadingRekomendasi(true);
      try {
        const { data, error } = await supabase
          .from('rekomendasi_event')
          .select('*')
          .order('create_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRekomendasi(data || []);
      } catch (err) {
        console.error('Error fetching rekomendasi event:', err);
      } finally {
        setLoadingRekomendasi(false);
      }
    };

    fetchRecentEvents();
    fetchRekomendasi();
  }, []);

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
      <Navbar />

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

        {/* --- RECOMMENDED EVENTS FEED --- */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                <i className="fa-solid fa-star text-amber-500 text-lg"></i>
                Rekomendasi Pilihan
              </h2>
              <p className="text-sm text-slate-500 mt-1">Temukan event seru rekomendasi editor Seevent!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingRekomendasi ? (
              <div className="col-span-full text-center py-16 text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
                <i className="fa-solid fa-circle-notch animate-spin text-2xl text-emerald-500"></i>
                <span>Memuat rekomendasi event...</span>
              </div>
            ) : rekomendasi.length > 0 ? (
              rekomendasi.map((item, index) => {
                const detail = item.detail_event || {};
                const displayPrice = detail.patungan !== undefined
                  ? detail.patungan > 0
                    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(detail.patungan)
                    : 'Gratis'
                  : 'Gratis';

                return (
                  <div 
                    key={item.id} 
                    onClick={() => router.push(`/event/rekomendasi/${item.slug}`)}
                    className="cursor-pointer bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 duration-300 flex flex-col h-full group overflow-hidden"
                  >
                    {/* Banner Image */}
                    <div className="h-44 w-full bg-slate-100 relative overflow-hidden shrink-0">
                      {item.banner_imagekit_url ? (
                        <img src={item.banner_imagekit_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
                          <i className="fa-solid fa-image text-white/50 text-3xl"></i>
                        </div>
                      )}
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md">
                        {displayPrice}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Host / Category */}
                        {detail.organizer && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-2.5 uppercase tracking-wider">
                            By {detail.organizer}
                          </span>
                        )}
                        <h4 className="font-bold text-base text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{item.desc || 'Rekomendasi event pilihan terbaik untuk kamu.'}</p>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-100 pt-3">
                        {detail.event_date && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <i className="fa-regular fa-calendar-days text-slate-400 w-4"></i>
                            <span>{detail.event_date}</span>
                          </div>
                        )}
                        {detail.location && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <i className="fa-solid fa-location-dot text-slate-400 w-4"></i>
                            <span className="truncate">{detail.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 bg-white border border-slate-100 rounded-3xl text-slate-400 text-xs font-semibold">
                Belum ada rekomendasi event saat ini.
              </div>
            )}
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
            {loading ? (
              <div className="col-span-full text-center py-16 text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
                <i className="fa-solid fa-circle-notch animate-spin text-2xl text-emerald-500"></i>
                <span>Memuat ajakan event terbaru...</span>
              </div>
            ) : events.length > 0 ? (
              events.map((invite, index) => {
                const hostName = invite.users?.nama_lengkap || 'Penyelenggara';
                const hostAvatar = invite.users?.profile?.profile_url_imagekit || getAvatarPlaceholder(invite.users?.id, hostName);
                const categoryName = invite.category_event?.name || 'Lainnya';
                
                const confirmedCount = invite.event_participants?.filter((p: any) => p.status === 'Confirmed').length || 0;
                const needsCount = invite.max_participants > 0 ? Math.max(0, invite.max_participants - confirmedCount) : 0;
                
                const dateStr = new Date(invite.event_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div 
                    key={invite.id} 
                    onClick={() => router.push(`/event/detail/${invite.id}`)}
                    className="cursor-pointer bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 duration-300 flex flex-col h-full group"
                  >
                      
                    {/* Host Info */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={hostAvatar} alt={hostName} className="w-11 h-11 rounded-full object-cover border-2 border-emerald-50" />
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">{hostName}, <span className="font-normal text-slate-500">{20 + (index % 10)}</span></h3>
                          <p className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            {invite.max_participants > 0 ? `Mencari ${needsCount} teman` : 'Kuota Bebas'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 text-slate-500 rounded-md border border-slate-100">
                        <i className={`fa-solid ${categories.find(c => c.name === categoryName)?.icon || 'fa-tag'} mr-1`}></i>
                        {categoryName}
                      </span>
                    </div>

                    {/* Event Details */}
                    <h4 className="font-bold text-lg text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">{invite.title}</h4>
                    
                    <div className="space-y-2 mb-5">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <i className="fa-regular fa-calendar-days text-xs"></i>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Waktu</p>
                          <p className="text-xs text-slate-700 font-medium">{dateStr}</p>
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

                      {invite.patungan > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="fa-solid fa-wallet text-xs"></i>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Patungan</p>
                            <p className="text-xs text-slate-700 font-medium">
                              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(invite.patungan)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-6 flex-grow relative bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <i className="fa-solid fa-quote-left text-slate-200 absolute top-2 left-2 text-lg"></i>
                      <p className="text-xs text-slate-600 leading-relaxed relative z-10 pl-5 pr-2 py-1 line-clamp-3">
                        {invite.pesan_ajakan || invite.desc_full || 'Tidak ada deskripsi tambahan untuk ajakan ini.'}
                      </p>
                    </div>

                    {/* Action & Status */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-medium mb-1">Slot Terisi</span>
                        <div className="flex -space-x-2">
                          {/* Render confirmed participants */}
                          {invite.event_participants?.filter((p: any) => p.status === 'Confirmed').map((p: any, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center z-10 shadow-sm" title={p.users?.nama_lengkap || "Member (Terisi)"}>
                              <img src={p.users?.profile?.profile_url_imagekit || getAvatarPlaceholder(p.users?.id, p.users?.nama_lengkap)} className="w-full h-full rounded-full opacity-80 object-cover" />
                            </div>
                          ))}
                          {/* Empty slots if max_participants > 0 */}
                          {invite.max_participants > 0 && [...Array(needsCount)].slice(0, 5).map((_, i) => (
                            <div key={`empty-${i}`} className="w-8 h-8 rounded-full bg-slate-50 border-2 border-slate-200 border-dashed flex items-center justify-center z-0" title="Slot Kosong">
                              <i className="fa-solid fa-plus text-[10px] text-slate-300"></i>
                            </div>
                          ))}
                          {invite.max_participants === 0 && (
                            <div className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center z-0" title="Slot Unlimited">
                              <i className="fa-solid fa-infinity text-[10px] text-emerald-500"></i>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/event/join/${invite.id}`);
                        }}
                        className="bg-slate-800 hover:bg-emerald-500 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors active:scale-95 shadow-md shadow-slate-200 hover:shadow-emerald-200"
                      >
                        Join Bareng
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-400 text-sm font-semibold">
                Belum ada ajakan event terbaru di database.
              </div>
            )}
          </div>
          
          {/* Mobile "Lihat Semua" Button */}
          <div className="mt-6 text-center sm:hidden">
            <a href="/explore" className="inline-block w-full bg-emerald-50 text-emerald-600 font-semibold py-3.5 rounded-2xl border border-emerald-100">
              Lihat Semua Ajakan
            </a>
          </div>
        </section>

      </main>

      <MobileNav />

    </div>
  );
}
