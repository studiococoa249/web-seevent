"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast-context';

interface Category {
    id: number;
    name: string;
    slug: string;
}

export default function App() {
    const { showToast } = useToast();
    const router = useRouter();

    const [checkingAuth, setCheckingAuth] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);

    const [formData, setFormData] = useState({
        id_category_event: '',
        namaEvent: '',
        deskripsi: '',
        tanggal: '',
        waktu: '',
        lokasi: '',
        kuota: 1,
        estimasiBiaya: '',
        image_url_imagekit: ''
    });

    useEffect(() => {
        const initPage = async () => {
            try {
                // 1. Check if user is authenticated
                const authRes = await fetch('/api/auth/me');
                if (!authRes.ok) {
                    showToast('Silakan masuk terlebih dahulu untuk membuat ajakan.', 'warning');
                    router.push('/auth/login');
                    return;
                }
                const authData = await authRes.json();
                if (!authData.authenticated) {
                    showToast('Silakan masuk terlebih dahulu untuk membuat ajakan.', 'warning');
                    router.push('/auth/login');
                    return;
                }

                setCheckingAuth(false);

                // 2. Fetch categories from backend
                const catRes = await fetch('/api/superadmin/kategori');
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData);
                    // Select first category by default if available
                    if (catData.length > 0) {
                        setFormData(prev => ({ ...prev, id_category_event: catData[0].id.toString() }));
                    }
                }
            } catch (err) {
                console.error('Error initializing page:', err);
                showToast('Gagal memuat konfigurasi halaman.', 'error');
            } finally {
                setLoadingCategories(false);
            }
        };

        initPage();
    }, [router, showToast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const incrementKuota = () => setFormData(prev => ({ ...prev, kuota: prev.kuota + 1 }));
    const decrementKuota = () => setFormData(prev => ({ ...prev, kuota: prev.kuota > 1 ? prev.kuota - 1 : 1 }));

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('Ukuran file maksimal adalah 5MB.', 'error');
            return;
        }

        setImageUploading(true);
        const uploadPayload = new FormData();
        uploadPayload.append('file', file);
        uploadPayload.append('folder', 'events');

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
            setFormData(prev => ({ ...prev, image_url_imagekit: result.url }));
            showToast('Foto sampul berhasil diunggah!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Gagal mengunggah gambar.', 'error');
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.namaEvent || !formData.lokasi || !formData.tanggal) {
            showToast('Mohon lengkapi semua kolom wajib (*)', 'warning');
            return;
        }

        setSubmitting(true);

        try {
            const eventDate = formData.waktu
                ? `${formData.tanggal}T${formData.waktu}`
                : `${formData.tanggal}T00:00`;

            let patunganValue: number | null = null;
            if (formData.estimasiBiaya) {
                const digits = formData.estimasiBiaya.replace(/\D/g, '');
                if (digits) {
                    patunganValue = parseFloat(digits);
                }
            }

            const payload = {
                title: formData.namaEvent,
                id_category_event: formData.id_category_event ? parseInt(formData.id_category_event) : null,
                location: formData.lokasi,
                event_date: eventDate,
                max_participants: formData.kuota,
                pesan_ajakan: formData.deskripsi,
                desc_full: formData.deskripsi,
                patungan: patunganValue,
                image_url_imagekit: formData.image_url_imagekit || null,
                status: 'Publish',
            };

            const response = await fetch('/api/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengirimkan ajakan.');
            }

            showToast('Ajakan event berhasil dipublikasikan!', 'success');
            router.push('/');
            router.refresh();
        } catch (err: any) {
            showToast(err.message || 'Gagal memproses form.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-poppins text-slate-600 gap-3">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                    .font-poppins { font-family: 'Poppins', sans-serif; }
                `}</style>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-500"></i>
                <span className="text-sm font-semibold">Memeriksa autentikasi...</span>
            </div>
        );
    }

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
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button 
                        type="button" 
                        onClick={() => router.push('/')}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors active:scale-95"
                    >
                        <i className="fa-solid fa-arrow-left text-lg"></i>
                    </button>
                    <h1 className="text-lg font-bold text-slate-800 absolute left-1/2 -translate-x-1/2">
                        Buat Ajakan
                    </h1>
                    <div className="w-10 h-10"></div> {/* Spacer for centering */}
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 pt-6">
                <div className="mb-8 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-emerald-800 mb-2">Cari Teman Bareng! 🚀</h2>
                    <p className="text-slate-500 text-sm">Isi detail di bawah agar teman sefrekuensi gampang nemuin ajakanmu.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* SECTION 1: KATEGORI */}
                    <section className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">1</span>
                            Pilih Kategori Acara
                        </h3>
                        {loadingCategories ? (
                            <div className="flex gap-3 pb-2 overflow-x-auto no-scrollbar">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="flex-shrink-0 w-28 h-12 bg-slate-100 animate-pulse rounded-2xl"></div>
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-4 text-xs text-slate-400">
                                Belum ada kategori yang dikonfigurasi.
                            </div>
                        ) : (
                            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, id_category_event: cat.id.toString() }))}
                                        className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all ${
                                            formData.id_category_event === cat.id.toString()
                                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-[1.02]'
                                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                        }`}
                                    >
                                        <i className={`fa-solid ${getCategoryIcon(cat.slug)}`}></i> {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* SECTION 2: GAMBAR COVER */}
                    <section className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">
                                <i className="fa-regular fa-image"></i>
                            </span>
                            Foto Sampul Event (Opsional)
                        </h3>
                        <div className="space-y-4">
                            {formData.image_url_imagekit ? (
                                <div className="relative rounded-2xl overflow-hidden aspect-video border border-slate-100 group shadow-sm bg-slate-50 flex items-center justify-center">
                                    <img 
                                        src={formData.image_url_imagekit} 
                                        alt="Cover Preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <label className="cursor-pointer bg-white/90 hover:bg-white text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold shadow transition-all active:scale-95">
                                            Ubah Foto
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFileUpload} 
                                                className="hidden" 
                                                disabled={imageUploading}
                                            />
                                        </label>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, image_url_imagekit: '' }))}
                                            className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl text-xs font-semibold shadow transition-all active:scale-95"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileUpload} 
                                        className="hidden" 
                                        disabled={imageUploading}
                                    />
                                    {imageUploading ? (
                                        <div className="flex flex-col items-center gap-2 text-emerald-600">
                                            <i className="fa-solid fa-spinner animate-spin text-2xl"></i>
                                            <span className="text-xs font-medium animate-pulse">Mengunggah gambar...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 flex items-center justify-center transition-all duration-300">
                                                <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 block transition-colors">Pilih file gambar</span>
                                                <span className="text-[10px] text-slate-400 block mt-0.5">JPEG, PNG, WEBP (Maks. 5MB)</span>
                                            </div>
                                        </>
                                    )}
                                </label>
                            )}
                        </div>
                    </section>

                    {/* SECTION 3: DETAIL UTAMA */}
                    <section className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                        <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">2</span>
                            Informasi Dasar
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-2">Nama Acara / Aktivitas <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-ticket text-slate-400"></i>
                                </div>
                                <input
                                    type="text"
                                    name="namaEvent"
                                    value={formData.namaEvent}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all placeholder-slate-400"
                                    placeholder="Contoh: Nonton Konser Dewa 19, Main Mini Soccer..."
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-2">Pesan Ajakan <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <textarea
                                    name="deskripsi"
                                    value={formData.deskripsi}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 resize-none placeholder-slate-400"
                                    placeholder="Tulis pesan santai buat ngajak. Contoh: Halo, cari temen buat nonton bareng nih, tiket udah aman di tribun utara..."
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: WAKTU & TEMPAT */}
                    <section className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">3</span>
                            Waktu & Tempat
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            {/* Tanggal */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Tanggal Acara <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i className="fa-regular fa-calendar text-slate-400"></i>
                                    </div>
                                    <input
                                        type="date"
                                        name="tanggal"
                                        value={formData.tanggal}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all text-slate-700"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Waktu */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Waktu Kumpul (Opsional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i className="fa-regular fa-clock text-slate-400"></i>
                                    </div>
                                    <input
                                        type="time"
                                        name="waktu"
                                        value={formData.waktu}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all text-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Lokasi */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-2">Nama Lokasi / Tempat <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-location-dot text-slate-400"></i>
                                </div>
                                <input
                                    type="text"
                                    name="lokasi"
                                    value={formData.lokasi}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all placeholder-slate-400"
                                    placeholder="Contoh: Stadion GBK, Cafe Senja, dll..."
                                    required
                                />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: TARGET & BIAYA */}
                    <section className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">4</span>
                            Target & Biaya
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Counter Kuota */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Butuh Berapa Teman? (Kuota)</label>
                                <div className="flex items-center gap-4 p-2 bg-slate-50 border border-slate-200 rounded-2xl w-fit">
                                    <button
                                        type="button"
                                        onClick={decrementKuota}
                                        className="w-10 h-10 rounded-xl bg-white text-slate-600 shadow-sm border border-slate-100 hover:text-emerald-600 hover:border-emerald-200 active:scale-90 transition-all flex items-center justify-center"
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <div className="w-12 text-center font-bold text-lg text-slate-800">
                                        {formData.kuota}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={incrementKuota}
                                        className="w-10 h-10 rounded-xl bg-white text-slate-600 shadow-sm border border-slate-100 hover:text-emerald-600 hover:border-emerald-200 active:scale-90 transition-all flex items-center justify-center"
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Estimasi Biaya */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Estimasi Biaya / Patungan (Opsional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-semibold text-sm">Rp</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="estimasiBiaya"
                                        value={formData.estimasiBiaya}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all placeholder-slate-400"
                                        placeholder="Contoh: 50.000 (Kosongkan jika gratis)"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* DESKTOP SUBMIT BUTTON (Hidden on mobile, sticky bottom on mobile) */}
                    <div className="hidden md:flex justify-end gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={() => router.push('/')}
                            className="px-6 py-3 rounded-2xl text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting || imageUploading}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                                    Memposting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-regular fa-paper-plane"></i> Posting Ajakan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>

            {/* MOBILE STICKY BOTTOM ACTION */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={submitting || imageUploading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? (
                        <>
                            <i className="fa-solid fa-circle-notch animate-spin"></i>
                            Memposting...
                        </>
                    ) : (
                        <>
                            <i className="fa-regular fa-paper-plane"></i> Posting Ajakan
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}