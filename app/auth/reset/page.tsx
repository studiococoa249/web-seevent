"use client";

import React, { useState } from 'react';

export default function Reset() {
    const [email, setEmail] = useState('');

    return (
        <div className="min-h-screen bg-slate-50 font-poppins flex">
            { }
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

            { }
            <div className="hidden lg:flex w-1/2 bg-emerald-600 relative overflow-hidden items-center justify-center p-12">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="2" fill="#ffffff" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" />
                    </svg>
                </div>
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-700 rounded-full blur-3xl opacity-50"></div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-md">
                    <div className="flex items-center gap-2 mb-12">
                        <div className="bg-white text-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg cursor-pointer" onClick={() => window.location.href = '/'}>
                            <i className="fa-solid fa-users text-lg"></i>
                        </div>
                        <span className="text-3xl font-bold text-white tracking-tight cursor-pointer" onClick={() => window.location.href = '/'}>se event</span>
                    </div>

                    <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                        Lupa Sandi? <br /> Tenang Saja.
                    </h1>
                    <p className="text-emerald-100 text-lg mb-12 leading-relaxed">
                        Kami akan mengirimkan instruksi untuk mereset kata sandi ke email Anda agar Anda bisa segera kembali beraktivitas.
                    </p>

                    {/* Floating UI Card Decoration */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-2xl flex items-center gap-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500 cursor-default">
                        <div className="bg-emerald-500 w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-white text-xl">
                            <i className="fa-solid fa-envelope"></i>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">Email pemulihan</p>
                            <p className="text-emerald-200 text-xs">Cek kotak masuk Anda sesaat lagi</p>
                        </div>
                    </div>
                </div>
            </div>

            { }
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 xl:px-32 relative bg-slate-50 py-10 lg:py-0 overflow-y-auto">

                {/* Mobile Logo Header (Hidden on Desktop) */}
                <div className="lg:hidden flex items-center gap-2 mb-8 cursor-pointer" onClick={() => window.location.href = '/'}>
                    <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
                        <i className="fa-solid fa-users text-sm"></i>
                    </div>
                    <span className="text-xl font-bold text-emerald-800 tracking-tight">se <span className="text-emerald-500">event</span></span>
                </div>

                <div className="w-full max-w-md mx-auto">
                    {/* Form Header */}
                    <div className="mb-8 text-center lg:text-left">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto lg:mx-0 text-2xl">
                            <i className="fa-solid fa-key"></i>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Reset Kata Sandi 🔒</h2>
                        <p className="text-slate-500 text-sm">Masukkan email yang terdaftar untuk menerima link pemulihan akun Anda.</p>
                    </div>

                    { }
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fa-regular fa-envelope text-slate-400"></i>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 placeholder-slate-400"
                                    placeholder="contoh@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-slate-800 hover:bg-emerald-500 text-white font-semibold py-4 px-4 rounded-2xl shadow-lg shadow-slate-200 hover:shadow-emerald-200 transition-all active:scale-[0.98]"
                        >
                            Kirim Link Reset
                        </button>
                    </form>

                    <p className="text-center mt-10 text-sm text-slate-600">
                        <a href="/auth/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center justify-center gap-2">
                            <i className="fa-solid fa-arrow-left"></i> Kembali ke Halaman Masuk
                        </a>
                    </p>

                </div>
            </div>

        </div>
    );
}
