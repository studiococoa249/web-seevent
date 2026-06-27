"use client";

import React, { useState } from 'react';

export default function App() {
    const [formData, setFormData] = useState({
        kategori: 'Konser',
        namaEvent: '',
        deskripsi: '',
        tanggal: '',
        waktu: '',
        lokasi: '',
        kuota: 1,
        estimasiBiaya: ''
    });

    const categories = [
        { name: 'Konser', icon: 'fa-music' },
        { name: 'Olahraga', icon: 'fa-basketball' },
        { name: 'E-Sports', icon: 'fa-gamepad' },
        { name: 'Pameran', icon: 'fa-palette' },
        { name: 'Workshop', icon: 'fa-chalkboard-user' },
        { name: 'Kuliner', icon: 'fa-utensils' },
        { name: 'Lainnya', icon: 'fa-star' },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const incrementKuota = () => setFormData(prev => ({ ...prev, kuota: prev.kuota + 1 }));
    const decrementKuota = () => setFormData(prev => ({ ...prev, kuota: prev.kuota > 1 ? prev.kuota - 1 : 1 }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form Submitted:', formData);
        // Logika submit ke backend nantinya di sini
    };

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
                    <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors active:scale-95">
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
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                            {categories.map((cat, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, kategori: cat.name }))}
                                    className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all ${formData.kategori === cat.name
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-[1.02]'
                                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                        }`}
                                >
                                    <i className={`fa-solid ${cat.icon}`}></i> {cat.name}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 2: DETAIL UTAMA */}
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
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 resize-none"
                                    placeholder="Tulis pesan santai buat ngajak. Contoh: Halo, cari temen buat nonton bareng nih, tiket udah aman di tribun utara..."
                                    required
                                ></textarea>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: WAKTU & TEMPAT */}
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
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Waktu Kumpul</label>
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

                    {/* SECTION 4: TARGET & BIAYA */}
                    <section className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">4</span>
                            Target & Biaya
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Counter Kuota */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-2">Butuh Berapa Teman?</label>
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
                                        <span className="text-slate-400 font-semibold">Rp</span>
                                    </div>
                                    <input
                                        type="text"
                                        name="estimasiBiaya"
                                        value={formData.estimasiBiaya}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all placeholder-slate-400"
                                        placeholder="Contoh: 50.000 / Gratis"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* DESKTOP SUBMIT BUTTON (Hidden on mobile, sticky bottom on mobile) */}
                    <div className="hidden md:flex justify-end gap-3 pt-4">
                        <button type="button" className="px-6 py-3 rounded-2xl text-slate-600 font-semibold hover:bg-slate-200 transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2">
                            <i className="fa-regular fa-paper-plane"></i> Posting Ajakan
                        </button>
                    </div>

                </form>
            </main>

            {/* MOBILE STICKY BOTTOM ACTION */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex gap-3">
                <button
                    onClick={handleSubmit}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                >
                    <i className="fa-regular fa-paper-plane"></i> Posting Ajakan
                </button>
            </div>

        </div>
    );
}