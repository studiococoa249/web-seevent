"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast-context';

interface ProfileData {
  id: string;
  nama_lengkap: string;
  email: string;
  level: 'Admin' | 'Member';
  membership: string;
  id_membership_plan: number | null;
  start_membership: string | null;
  end_membership: string | null;
  status: string;
  bio: string | null;
  profile_url_imagekit: string | null;
  banner_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
}

export default function ProfilePage() {
    const router = useRouter();
    const { showToast } = useToast();
    
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
    const [createdCount, setCreatedCount] = useState(0);
    const [joinedCount, setJoinedCount] = useState(0);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            // #region debug-point C:profile-fetch-start
            fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"C",location:"app/user/profile/page.tsx:39",msg:"[DEBUG] fetchProfileData called",ts:Date.now()})}).catch(()=>{});
            // #endregion
            
            try {
                // 1. Check if user is authenticated
                const authRes = await fetch('/api/auth/me');
                if (!authRes.ok) {
                    router.push('/auth/login');
                    return;
                }
                const authData = await authRes.json();
                
                // #region debug-point C:auth-data
                fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"C",location:"app/user/profile/page.tsx:47",msg:"[DEBUG] Got auth data",data:{authData},ts:Date.now()})}).catch(()=>{});
                // #endregion
                
                if (!authData.authenticated || !authData.user) {
                    router.push('/auth/login');
                    return;
                }

                const userId = authData.user.id;
                setCheckingAuth(false);

                // 2. Fetch stats
                const { count: eventsCreated, error: createdError } = await supabase
                    .from('event')
                    .select('*', { count: 'exact', head: true })
                    .eq('id_users', userId);

                if (createdError) throw createdError;
                setCreatedCount(eventsCreated || 0);

                const { count: eventsJoined, error: joinedError } = await supabase
                    .from('event_participants')
                    .select('*', { count: 'exact', head: true })
                    .eq('id_users', userId)
                    .eq('status', 'Confirmed');

                if (joinedError) throw joinedError;
                setJoinedCount(eventsJoined || 0);

                // 3. Assemble complete profile data
                const completeProfile: ProfileData = {
                    id: userId,
                    nama_lengkap: authData.user.nama_lengkap,
                    email: authData.user.email,
                    level: authData.user.level,
                    membership: authData.user.membership,
                    id_membership_plan: authData.user.id_membership_plan,
                    start_membership: authData.user.start_membership,
                    end_membership: authData.user.end_membership,
                    status: authData.user.status,
                    bio: authData.user.profile?.bio || null,
                    profile_url_imagekit: authData.user.profile?.profile_url_imagekit || null,
                    banner_url: authData.user.profile?.banner_url || null,
                    instagram_url: authData.user.profile?.instagram_url || null,
                    tiktok_url: authData.user.profile?.tiktok_url || null,
                    youtube_url: authData.user.profile?.youtube_url || null,
                };
                
                // #region debug-point C:complete-profile
                fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"C",location:"app/user/profile/page.tsx:93",msg:"[DEBUG] Setting complete profile",data:{completeProfile},ts:Date.now()})}).catch(()=>{});
                // #endregion
                
                setUserProfile(completeProfile);

            } catch (err: unknown) {
                console.error('Error fetching user profile:', err);
                const errMsg = err instanceof Error ? err.message : 'Unknown error';
                showToast('Gagal memuat profil: ' + errMsg, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [router, showToast]);

    const handleLogout = async () => {
        if (!confirm('Apakah Anda yakin ingin keluar?')) return;
        setLoggingOut(true);
        try {
            const logoutRes = await fetch('/api/auth/logout', { method: 'POST' });
            if (logoutRes.ok) {
                showToast('Berhasil keluar.', 'success');
                router.push('/auth/login');
            } else {
                throw new Error('Failed to logout');
            }
        } catch (err: unknown) {
            console.error('Logout error:', err);
            showToast('Gagal melakukan logout.', 'error');
            setLoggingOut(false);
        }
    };

    if (checkingAuth || loading || loggingOut) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-poppins text-slate-600 gap-3">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght=300;400;500;600;700&display=swap');
                    .font-poppins { font-family: 'Poppins', sans-serif; }
                `}</style>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-500"></i>
                <span className="text-sm font-semibold">
                    {loggingOut ? 'Memproses keluar...' : 'Memuat profil Anda...'}
                </span>
            </div>
        );
    }

    if (!userProfile) return null;

    const avatarUrl = userProfile.profile_url_imagekit || `https://i.pravatar.cc/150?img=33`;
    const premiumBg = userProfile.membership === 'Premium' 
        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 text-white shadow-amber-200'
        : 'bg-slate-200 text-slate-700';

    return (
        <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-24 md:pb-12">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght=300;400;500;600;700&display=swap');
                .font-poppins { font-family: 'Poppins', sans-serif; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            {/* --- PROFILE HEADER --- */}
            <div className="relative">
                {/* Banner */}
                {userProfile.banner_url ? (
                    <div 
                        className="h-48 md:h-64 w-full bg-cover bg-center" 
                        style={{ backgroundImage: `url(${userProfile.banner_url})` }}
                    ></div>
                ) : (
                    <div className="h-48 md:h-64 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600"></div>
                )}
                
                {/* Back Button (Absolute) */}
                <Link 
                    href="/" 
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md text-slate-700 hover:bg-white active:scale-95 transition-all"
                >
                    <i className="fa-solid fa-chevron-left"></i>
                </Link>
            </div>

            {/* --- PROFILE CONTAINER --- */}
            <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100/50 flex flex-col items-center md:items-start md:flex-row gap-6">
                    {/* Avatar Image */}
                    <div className="relative -mt-20 md:-mt-24">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={avatarUrl} alt={userProfile.nama_lengkap} className="w-full h-full object-cover" />
                        </div>
                        {userProfile.membership === 'Premium' && (
                            <div className="absolute bottom-1 right-1 bg-amber-500 text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                                <i className="fa-solid fa-crown text-sm"></i>
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                            <h1 className="text-2xl font-bold text-slate-800">{userProfile.nama_lengkap}</h1>
                            <div className="flex items-center gap-1.5 justify-center md:justify-start">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${premiumBg}`}>
                                    {userProfile.membership === 'Premium' ? 'Premium' : 'Free'}
                                </span>
                                {userProfile.level === 'Admin' && (
                                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>



                        {userProfile.bio ? (
                            <p className="text-slate-600 text-sm max-w-lg leading-relaxed italic">
                                &ldquo;{userProfile.bio}&rdquo;
                            </p>
                        ) : (
                            <p className="text-slate-400 text-sm italic">
                                Belum menulis deskripsi bio.
                            </p>
                        )}

                        {/* Social Links */}
                        <div className="flex gap-2 justify-center md:justify-start pt-2">
                            {userProfile.instagram_url && (
                                <a 
                                    href={userProfile.instagram_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors shadow-sm"
                                >
                                    <i className="fa-brands fa-instagram text-lg"></i>
                                </a>
                            )}
                            {userProfile.tiktok_url && (
                                <a 
                                    href={userProfile.tiktok_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors shadow-sm"
                                >
                                    <i className="fa-brands fa-tiktok text-lg"></i>
                                </a>
                            )}
                            {userProfile.youtube_url && (
                                <a 
                                    href={userProfile.youtube_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors shadow-sm"
                                >
                                    <i className="fa-brands fa-youtube text-lg"></i>
                                </a>
                            )}
                            {!userProfile.instagram_url && !userProfile.tiktok_url && !userProfile.youtube_url && (
                                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-3 py-1 rounded-lg">
                                    No Social Media linked
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- STATS CARD --- */}
                <div className="grid grid-cols-2 gap-4 mt-6">
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

                {/* --- MENU OPTIONS --- */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm mt-6 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {/* Edit Profile */}
                        <Link 
                            href={`/user/profile/update/${userProfile.id}`}
                            className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
                                    <i className="fa-solid fa-user-pen"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 group-hover:text-slate-800">Edit Profil</h3>
                                    <p className="text-xs text-slate-400">Ubah info detail profil Anda</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-slate-500 transition-colors"></i>
                        </Link>

                        {/* Kelola Ajakan */}
                        <Link 
                            href="/user/event/all"
                            className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                    <i className="fa-solid fa-clipboard-list"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 group-hover:text-slate-800">Kelola Ajakan</h3>
                                    <p className="text-xs text-slate-400">Lihat event aktif dan riwayat Anda</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-slate-500 transition-colors"></i>
                        </Link>

                        {/* Premium Status Info (If Free) */}
                        {userProfile.membership !== 'Premium' && (
                            <Link 
                                href="/pricing" 
                                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                        <i className="fa-solid fa-gem"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-700 group-hover:text-slate-800">Langganan Premium</h3>
                                        <p className="text-xs text-slate-400">Dapatkan kuota bebas dan fitur eksklusif</p>
                                    </div>
                                </div>
                                <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-slate-500 transition-colors"></i>
                            </Link>
                        )}

                        {/* Logout */}
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-5 hover:bg-rose-50/50 transition-colors group text-left"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-rose-600 group-hover:text-rose-700">Keluar Akun</h3>
                                    <p className="text-xs text-slate-400">Keluar dari sesi perangkat ini</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-rose-500 transition-colors"></i>
                        </button>
                    </div>
                </div>
            </div>

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

                <Link href="/user/event/all" className="flex flex-col items-center p-2 text-slate-400 hover:text-emerald-500 transition-colors relative">
                    <i className="fa-solid fa-clipboard-list text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Ajakan</span>
                </Link>
                <Link href="/user/profile" className="flex flex-col items-center p-2 text-emerald-500 transition-colors">
                    <i className="fa-solid fa-user text-xl mb-1"></i>
                    <span className="text-[10px] font-medium">Profil</span>
                </Link>
            </div>
        </div>
    );
}
