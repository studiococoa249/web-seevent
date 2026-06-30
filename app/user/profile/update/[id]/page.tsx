"use client";

import React, { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast-context';
import { getAvatarPlaceholder } from '@/lib/avatar';

interface ProfileForm {
  namaLengkap: string;
  bio: string;
  profileUrlImagekit: string;
  bannerUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
}

export default function UpdateProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const { id: urlUserId } = use(params);
    const router = useRouter();
    const { showToast } = useToast();

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const hasFetchedInitialData = useRef(false);

    const [form, setForm] = useState<ProfileForm>({
        namaLengkap: '',
        bio: '',
        profileUrlImagekit: '',
        bannerUrl: '',
        instagramUrl: '',
        tiktokUrl: '',
        youtubeUrl: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            // Only run if we haven't fetched initial data yet
            if (hasFetchedInitialData.current) return;
            // #region debug-point D:useeffect-run
            fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"D",location:"app/user/profile/update/[id]/page.tsx:44",msg:"[DEBUG] useEffect fetchInitialData running!",data:{urlUserId,hasFetchedInitialData:hasFetchedInitialData.current},ts:Date.now()})}).catch(()=>{});
            // #endregion
            try {
                // 1. Verify user authentication
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

                const currentUserId = authData.user.id;
                // Security Check: Only allow editing own profile
                if (currentUserId !== urlUserId) {
                    showToast('Anda tidak memiliki akses untuk mengubah profil ini.', 'error');
                    router.push(`/user/profile/update/${currentUserId}`);
                    return;
                }

                setCheckingAuth(false);

                // 2. Load current profile state
                const { data: profileData, error: profileError } = await supabase
                    .from('profile')
                    .select('*')
                    .eq('id_users', currentUserId)
                    .maybeSingle();

                if (profileError) throw profileError;

                // #region debug-point D:setform-initial
                fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"D",location:"app/user/profile/update/[id]/page.tsx:78",msg:"[DEBUG] About to setForm initial data",data:{profileData,formBefore:form},ts:Date.now()})}).catch(()=>{});
                // #endregion
                setForm({
                    namaLengkap: authData.user.nama_lengkap || '',
                    bio: profileData?.bio || '',
                    profileUrlImagekit: profileData?.profile_url_imagekit || '',
                    bannerUrl: profileData?.banner_url || '',
                    instagramUrl: profileData?.instagram_url || '',
                    tiktokUrl: profileData?.tiktok_url || '',
                    youtubeUrl: profileData?.youtube_url || ''
                });
                // Mark that we've fetched initial data
                hasFetchedInitialData.current = true;
            } catch (err: unknown) {
                console.error('Error fetching initial profile details:', err);
                showToast('Gagal memuat detail profil.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [urlUserId, router, showToast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    // #region debug-point A:upload-start
    fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"A",location:"app/user/profile/update/[id]/page.tsx:104",msg:"[DEBUG] handleFileUpload called",data:{type,fileName:e.target.files?.[0]?.name,fileSize:e.target.files?.[0]?.size},ts:Date.now()})}).catch(()=>{});
    // #endregion
    const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('Ukuran file maksimal adalah 5MB.', 'error');
            return;
        }

        if (type === 'avatar') setUploadingAvatar(true);
        else setUploadingBanner(true);

        const uploadPayload = new FormData();
        uploadPayload.append('file', file);
        uploadPayload.append('folder', type === 'avatar' ? 'profiles' : 'banners');

        try {
            const res = await fetch('/api/superadmin/upload', {
                method: 'POST',
                body: uploadPayload,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Gagal mengunggah berkas.');
            }

            const result = await res.json();
            // #region debug-point A:upload-setform
            fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"A",location:"app/user/profile/update/[id]/page.tsx:134",msg:"[DEBUG] About to setForm",data:{type,result,formBefore:form},ts:Date.now()})}).catch(()=>{});
            // #endregion
            if (type === 'avatar') {
                setForm(prev => {
                    const newForm = { ...prev, profileUrlImagekit: result.url };
                    // #region debug-point A:upload-setform-done
                    fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"A",location:"app/user/profile/update/[id]/page.tsx:136",msg:"[DEBUG] setForm done (avatar)",data:{newForm},ts:Date.now()})}).catch(()=>{});
                    // #endregion
                    return newForm;
                });
                showToast('Foto profil berhasil diunggah!', 'success');
            } else {
                setForm(prev => {
                    const newForm = { ...prev, bannerUrl: result.url };
                    // #region debug-point A:upload-setform-done
                    fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"A",location:"app/user/profile/update/[id]/page.tsx:139",msg:"[DEBUG] setForm done (banner)",data:{newForm},ts:Date.now()})}).catch(()=>{});
                    // #endregion
                    return newForm;
                });
                showToast('Foto sampul berhasil diunggah!', 'success');
            }
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Gagal mengunggah gambar.';
            showToast(errMsg, 'error');
        } finally {
            if (type === 'avatar') setUploadingAvatar(false);
            else setUploadingBanner(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        // #region debug-point B:submit-start
        fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"B",location:"app/user/profile/update/[id]/page.tsx:151",msg:"[DEBUG] handleSubmit called",data:{form},ts:Date.now()})}).catch(()=>{});
        // #endregion

        try {
            // 1. Update users table (nama_lengkap)
            // #region debug-point B:update-users
            fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"B",location:"app/user/profile/update/[id]/page.tsx:157",msg:"[DEBUG] Updating users table",data:{namaLengkap:form.namaLengkap,urlUserId},ts:Date.now()})}).catch(()=>{});
            // #endregion
            
            const { error: userError } = await supabase
                .from('users')
                .update({ nama_lengkap: form.namaLengkap })
                .eq('id', urlUserId);

            if (userError) {
                // #region debug-point B:user-error
                fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"B",location:"app/user/profile/update/[id]/page.tsx:162",msg:"[DEBUG] User update error",data:{userError},ts:Date.now()})}).catch(()=>{});
                // #endregion
                throw userError;
            }

            // 2. Update profile table
            // #region debug-point B:upsert-profile
            fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"B",location:"app/user/profile/update/[id]/page.tsx:165",msg:"[DEBUG] Upserting profile",data:{upsertData:{id_users:urlUserId,bio:form.bio,profile_url_imagekit:form.profileUrlImagekit,banner_url:form.bannerUrl,instagram_url:form.instagramUrl,tiktok_url:form.tiktokUrl,youtube_url:form.youtubeUrl}},ts:Date.now()})}).catch(()=>{});
            // 2. Update profile table
            // Convert empty strings to null
            const upsertData = {
                id_users: urlUserId,
                bio: form.bio.trim() === "" ? null : form.bio,
                profile_url_imagekit: form.profileUrlImagekit.trim() === "" ? null : form.profileUrlImagekit,
                banner_url: form.bannerUrl.trim() === "" ? null : form.bannerUrl,
                instagram_url: form.instagramUrl.trim() === "" ? null : form.instagramUrl,
                tiktok_url: form.tiktokUrl.trim() === "" ? null : form.tiktokUrl,
                youtube_url: form.youtubeUrl.trim() === "" ? null : form.youtubeUrl,
                update_at: new Date().toISOString()
            };
            // #region debug-point B:upsert-data
            fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"B",location:"app/user/profile/update/[id]/page.tsx:165",msg:"[DEBUG] Prepared upsertData",data:{upsertData,form},ts:Date.now()})}).catch(()=>{});
            // #endregion
            const { data: upsertResult, error: profileError } = await supabase
                .from('profile')
                .upsert(upsertData, { onConflict: 'id_users' })
                .select();

            if (profileError) {
                // #region debug-point B:profile-error
                fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"B",location:"app/user/profile/update/[id]/page.tsx:179",msg:"[DEBUG] Profile upsert error",data:{profileError},ts:Date.now()})}).catch(()=>{});
                // #endregion
                throw profileError;
            }
            
            // #region debug-point B:upsert-success
            fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"B",location:"app/user/profile/update/[id]/page.tsx:180",msg:"[DEBUG] Profile upsert succeeded",data:{upsertResult},ts:Date.now()})}).catch(()=>{});
            // #endregion
            
            console.log('[UpdateProfile] upsert result:', upsertResult);

            showToast('Profil berhasil diperbarui!', 'success');
            // Hard navigate to force fresh data fetch (avoids Next.js client cache)
            window.location.href = '/user/profile';
        } catch (err: unknown) {
            console.error('Error updating profile:', err);
            // #region debug-point B:exception
            fetch("http://127.0.0.1:7777/event",{method:"POST",body:JSON.stringify({sessionId:"profile-update-not-saving",runId:"pre",hypothesisId:"B",location:"app/user/profile/update/[id]/page.tsx:186",msg:"[DEBUG] Exception caught",data:{err},ts:Date.now()})}).catch(()=>{});
            // #endregion
            
            const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan.';
            showToast('Gagal memperbarui profil: ' + errMsg, 'error');
        } finally {
            setSubmitting(false);
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
                <span className="text-sm font-semibold">Memuat formulir profil...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 pb-12">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght=300;400;500;600;700&display=swap');
                .font-poppins { font-family: 'Poppins', sans-serif; }
            `}</style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            {/* --- HEADER --- */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link 
                        href="/user/profile" 
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                        <i className="fa-solid fa-chevron-left text-lg"></i>
                    </Link>
                    <h1 className="text-base font-bold text-slate-800 absolute left-1/2 -translate-x-1/2">
                        Edit Profil
                    </h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Banners and Avatar Card */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6">
                        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                            Tampilan Profil
                        </h2>

                        {/* Banner Image selector */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 block">Foto Sampul / Banner</label>
                                {form.bannerUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, bannerUrl: '' }))}
                                        className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
                                    >
                                        <i className="fa-solid fa-trash-can text-[10px]"></i> Hapus Banner
                                    </button>
                                )}
                            </div>
                            <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-100 border border-slate-200 flex items-center justify-center group">
                                {form.bannerUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={form.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 opacity-80"></div>
                                )}
                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer gap-1.5 text-xs font-semibold">
                                    {uploadingBanner ? (
                                        <><i className="fa-solid fa-circle-notch animate-spin text-xl"></i><span>Mengunggah...</span></>
                                    ) : (
                                        <><i className="fa-solid fa-camera text-lg"></i><span>Ganti Foto Sampul</span></>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        disabled={uploadingBanner}
                                        onChange={(e) => handleFileUpload(e, 'banner')}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Avatar Image selector */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50">
                                    {form.profileUrlImagekit ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={form.profileUrlImagekit} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={getAvatarPlaceholder(urlUserId, form.namaLengkap)} alt="Avatar Placeholder" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 text-white border-2 border-white flex items-center justify-center cursor-pointer shadow-md hover:bg-emerald-600 transition-colors">
                                    {uploadingAvatar
                                        ? <i className="fa-solid fa-circle-notch animate-spin text-xs"></i>
                                        : <i className="fa-solid fa-camera text-xs"></i>
                                    }
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        disabled={uploadingAvatar}
                                        onChange={(e) => handleFileUpload(e, 'avatar')}
                                    />
                                </label>
                            </div>
                            <div className="text-center sm:text-left space-y-1.5">
                                <h3 className="text-xs font-bold text-slate-700">Foto Profil</h3>
                                <p className="text-[11px] text-slate-400 max-w-[280px]">
                                    Format JPG, PNG, atau WEBP. Maksimal 5MB. Direkomendasikan rasio 1:1.
                                </p>
                                {uploadingAvatar && <p className="text-emerald-500 text-xs font-bold animate-pulse">Mengunggah foto profil...</p>}
                                {form.profileUrlImagekit && !uploadingAvatar && (
                                    <button
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, profileUrlImagekit: '' }))}
                                        className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
                                    >
                                        <i className="fa-solid fa-trash-can text-[10px]"></i> Hapus Foto Profil
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* General Bio and Social Forms */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
                        <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                            Informasi Profil
                        </h2>

                        {/* Name */}
                        <div className="space-y-1.5">
                            <label htmlFor="namaLengkap" className="text-xs font-bold text-slate-500">Nama Lengkap</label>
                            <input 
                                type="text" 
                                id="namaLengkap" 
                                name="namaLengkap"
                                required
                                value={form.namaLengkap}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 px-4 text-sm text-slate-700 outline-none transition-all"
                                placeholder="Masukkan nama lengkap Anda"
                            />
                        </div>

                        {/* Bio */}
                        <div className="space-y-1.5">
                            <label htmlFor="bio" className="text-xs font-bold text-slate-500">Bio Singkat</label>
                            <textarea 
                                id="bio" 
                                name="bio"
                                rows={3}
                                value={form.bio}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 px-4 text-sm text-slate-700 outline-none transition-all resize-none"
                                placeholder="Ceritakan singkat tentang diri Anda (misal: hobi, pekerjaan, atau minat)"
                            />
                        </div>

                        {/* Instagram URL */}
                        <div className="space-y-1.5">
                            <label htmlFor="instagramUrl" className="text-xs font-bold text-slate-500">Tautan Instagram</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <i className="fa-brands fa-instagram text-base"></i>
                                </div>
                                <input 
                                    type="url" 
                                    id="instagramUrl" 
                                    name="instagramUrl"
                                    value={form.instagramUrl}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all"
                                    placeholder="https://instagram.com/username"
                                />
                            </div>
                        </div>

                        {/* TikTok URL */}
                        <div className="space-y-1.5">
                            <label htmlFor="tiktokUrl" className="text-xs font-bold text-slate-500">Tautan TikTok</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <i className="fa-brands fa-tiktok text-base"></i>
                                </div>
                                <input 
                                    type="url" 
                                    id="tiktokUrl" 
                                    name="tiktokUrl"
                                    value={form.tiktokUrl}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all"
                                    placeholder="https://tiktok.com/@username"
                                />
                            </div>
                        </div>

                        {/* YouTube URL */}
                        <div className="space-y-1.5">
                            <label htmlFor="youtubeUrl" className="text-xs font-bold text-slate-500">Tautan YouTube</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <i className="fa-brands fa-youtube text-base"></i>
                                </div>
                                <input 
                                    type="url" 
                                    id="youtubeUrl" 
                                    name="youtubeUrl"
                                    value={form.youtubeUrl}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all"
                                    placeholder="https://youtube.com/c/channelname"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/user/profile"
                            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-all text-sm text-center shadow-sm"
                        >
                            Batal
                        </Link>
                        <button 
                            type="submit"
                            disabled={submitting || uploadingAvatar || uploadingBanner}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-md text-sm flex justify-center items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>Simpan Perubahan</span>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
