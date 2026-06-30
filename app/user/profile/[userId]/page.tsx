"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast-context';
import { getAvatarPlaceholder } from '@/lib/avatar';

interface PublicProfile {
  id: string;
  nama_lengkap: string;
  email: string;
  level: 'Admin' | 'Member';
  membership: string;
  bio: string | null;
  profile_url_imagekit: string | null;
  banner_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [createdCount, setCreatedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hostedEvents, setHostedEvents] = useState<
    { id: string; title: string; event_date: string; image_url_imagekit: string | null }[]
  >([]);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        // Check if user is logged in
        const authRes = await fetch('/api/auth/me');
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.authenticated && authData.user) {
            setCurrentUserId(authData.user.id);
          }
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            id,
            nama_lengkap,
            email,
            level,
            membership,
            profile (
              bio,
              profile_url_imagekit,
              banner_url,
              instagram_url,
              tiktok_url,
              youtube_url
            )
          `)
          .eq('id', userId)
          .maybeSingle();

        if (userError) throw userError;
        if (!userData) {
          showToast('Profil pengguna tidak ditemukan.', 'error');
          router.push('/');
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profileData = (userData as any).profile;
        const assembled: PublicProfile = {
          id: userData.id,
          nama_lengkap: userData.nama_lengkap,
          email: userData.email,
          level: userData.level,
          membership: userData.membership,
          bio: profileData?.bio || null,
          profile_url_imagekit: profileData?.profile_url_imagekit || null,
          banner_url: profileData?.banner_url || null,
          instagram_url: profileData?.instagram_url || null,
          tiktok_url: profileData?.tiktok_url || null,
          youtube_url: profileData?.youtube_url || null,
        };
        setProfile(assembled);

        const { count: eventsCreated } = await supabase
          .from('event')
          .select('*', { count: 'exact', head: true })
          .eq('id_users', userId);
        setCreatedCount(eventsCreated || 0);

        const { count: eventsJoined } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('id_users', userId)
          .eq('status', 'Confirmed');
        setJoinedCount(eventsJoined || 0);

        const { data: events } = await supabase
          .from('event')
          .select('id, title, event_date, image_url_imagekit')
          .eq('id_users', userId)
          .order('event_date', { ascending: false })
          .limit(4);
        setHostedEvents(events || []);

        // Fetch follow details from MongoDB
        try {
          const followRes = await fetch(`/api/user/follow?targetUserId=${userId}`);
          if (followRes.ok) {
            const followData = await followRes.json();
            setFollowersCount(followData.followersCount || 0);
            setFollowingCount(followData.followingCount || 0);
            setIsFollowing(followData.isFollowing || false);
          }
        } catch (e) {
          console.error("Failed to fetch follow details:", e);
        }
      } catch (err: unknown) {
        console.error('Error fetching public profile:', err);
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        showToast('Gagal memuat profil: ' + errMsg, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId, router, showToast]);

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      showToast('Silakan login terlebih dahulu untuk mengikuti.', 'warning');
      router.push('/auth/login');
      return;
    }
    
    setFollowingLoading(true);
    try {
      const res = await fetch('/api/user/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount);
        setFollowingCount(data.followingCount);
        showToast(data.message, 'success');
      } else {
        showToast(data.error || 'Gagal memproses permintaan.', 'error');
      }
    } catch (err) {
      console.error('Follow action error:', err);
      showToast('Gagal memproses aksi.', 'error');
    } finally {
      setFollowingLoading(false);
    }
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
        <span className="text-sm font-semibold">Memuat profil...</span>
      </div>
    );
  }

  if (!profile) return null;

  const avatarUrl = profile.profile_url_imagekit || getAvatarPlaceholder(profile.id, profile.nama_lengkap);
  const premiumBg =
    profile.membership === 'Premium'
      ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 text-white shadow-amber-200'
      : 'bg-slate-200 text-slate-700';

  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .event-card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .event-card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="relative">
        {profile.banner_url ? (
          <div
            className="h-52 md:h-72 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.banner_url})` }}
          ></div>
        ) : (
          <div className="h-52 md:h-72 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600"></div>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md text-slate-700 hover:bg-white active:scale-95 transition-all"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10 space-y-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100/50 flex flex-col items-center md:items-start md:flex-row gap-6">
          <div className="relative -mt-20 md:-mt-24 shrink-0">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt={profile.nama_lengkap} className="w-full h-full object-cover" />
            </div>
            {profile.membership === 'Premium' && (
              <div className="absolute bottom-1 right-1 bg-amber-500 text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                <i className="fa-solid fa-crown text-sm"></i>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 justify-center">
              <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h1 className="text-2xl font-bold text-slate-800">{profile.nama_lengkap}</h1>
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${premiumBg}`}>
                    {profile.membership === 'Premium' ? 'Premium' : 'Free'}
                  </span>
                  {profile.level === 'Admin' && (
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              {/* Edit button — only visible to the profile owner */}
              {currentUserId === profile.id ? (
                <Link
                  href={`/user/profile/update/${profile.id}`}
                  className="inline-flex items-center gap-2 self-center md:self-auto px-4 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-600 hover:text-violet-700 text-xs font-semibold transition-all shadow-sm active:scale-95"
                >
                  <i className="fa-solid fa-user-pen"></i>
                  Edit Profil
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={followingLoading}
                  className={`inline-flex items-center gap-2 self-center md:self-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                    isFollowing 
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100'
                  }`}
                >
                  {followingLoading ? (
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                  ) : isFollowing ? (
                    <><i className="fa-solid fa-user-minus text-[10px]"></i> Batal Mengikuti</>
                  ) : (
                    <><i className="fa-solid fa-user-plus text-[10px]"></i> Ikuti</>
                  )}
                </button>
              )}
            </div>

            {/* Follow Stats */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 justify-center md:justify-start">
              <span><strong className="text-slate-800 font-bold">{followersCount}</strong> Pengikut</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span><strong className="text-slate-800 font-bold">{followingCount}</strong> Mengikuti</span>
            </div>

            {profile.bio ? (
              <p className="text-slate-600 text-sm max-w-lg leading-relaxed italic">
                &ldquo;{profile.bio}&rdquo;
              </p>
            ) : (
              <p className="text-slate-400 text-sm italic">Belum menulis deskripsi bio.</p>
            )}

            <div className="flex gap-2 justify-center md:justify-start pt-1">
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors shadow-sm"
                >
                  <i className="fa-brands fa-instagram text-lg"></i>
                </a>
              )}
              {profile.tiktok_url && (
                <a
                  href={profile.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <i className="fa-brands fa-tiktok text-lg"></i>
                </a>
              )}
              {profile.youtube_url && (
                <a
                  href={profile.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors shadow-sm"
                >
                  <i className="fa-brands fa-youtube text-lg"></i>
                </a>
              )}
              {!profile.instagram_url && !profile.tiktok_url && !profile.youtube_url && (
                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-lg">
                  No Social Media linked
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
              <i className="fa-solid fa-bullhorn"></i>
            </div>
            <span className="text-2xl font-bold text-slate-800">{createdCount}</span>
            <p className="text-xs text-slate-400 font-semibold mt-1">Ajakan Dibuat</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
              <i className="fa-solid fa-user-group"></i>
            </div>
            <span className="text-2xl font-bold text-slate-800">{joinedCount}</span>
            <p className="text-xs text-slate-400 font-semibold mt-1">Event Diikuti</p>
          </div>
        </div>

        {hostedEvents.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">
                <i className="fa-solid fa-bullhorn"></i>
              </span>
              Ajakan yang Dibuat
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hostedEvents.map((ev) => {
                const dateLabel = new Date(ev.event_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                return (
                  <Link
                    key={ev.id}
                    href={`/event/detail/${ev.id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/40 hover:border-emerald-100 event-card-hover group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                      {ev.image_url_imagekit ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ev.image_url_imagekit} alt={ev.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                          <i className="fa-solid fa-users text-white text-lg"></i>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-emerald-700 transition-colors">
                        {ev.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        <i className="fa-regular fa-calendar-days mr-1"></i>
                        {dateLabel}
                      </p>
                    </div>
                    <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-emerald-400 ml-auto text-xs transition-colors"></i>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
