"use client";

import React, { useState } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
                        Satu Aplikasi, <br /> Ribuan Teman Baru.
                    </h1>
                    <p className="text-emerald-100 text-lg mb-12 leading-relaxed">
                        Temukan partner yang pas untuk nonton konser, mabar olahraga, atau sekedar nongkrong santai di akhir pekan.
                    </p>

                    {/* Floating UI Card Decoration */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl shadow-2xl flex items-center gap-4 transform -rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default">
                        <div className="flex -space-x-3">
                            <img src="https://i.pravatar.cc/150?img=11" className="w-12 h-12 rounded-full border-2 border-emerald-600" alt="User 1" />
                            <img src="https://i.pravatar.cc/150?img=5" className="w-12 h-12 rounded-full border-2 border-emerald-600" alt="User 2" />
                            <img src="https://i.pravatar.cc/150?img=32" className="w-12 h-12 rounded-full border-2 border-emerald-600" alt="User 3" />
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">3 teman menunggu!</p>
                            <p className="text-emerald-200 text-xs">Konser Dewa 19 - GBK</p>
                        </div>
                    </div>
                </div>
            </div>

            { }
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-24 xl:px-32 relative bg-slate-50">

                {/* Mobile Logo Header (Hidden on Desktop) */}
                <div className="lg:hidden flex items-center gap-2 mb-10 absolute top-8 left-6 sm:left-12 cursor-pointer" onClick={() => window.location.href = '/'}>
                    <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
                        <i className="fa-solid fa-users text-sm"></i>
                    </div>
                    <span className="text-xl font-bold text-emerald-800 tracking-tight">se <span className="text-emerald-500">event</span></span>
                </div>

                <div className="w-full max-w-md mx-auto pt-16 lg:pt-0">
                    {/* Form Header */}
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang 👋</h2>
                        <p className="text-slate-500 text-sm">Masukkan email dan password untuk masuk ke akunmu.</p>
                    </div>

                    { }
                    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fa-regular fa-envelope text-slate-400"></i>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 placeholder-slate-400"
                                    placeholder="contoh@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kata Sandi</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fa-solid fa-lock text-slate-400"></i>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-700 placeholder-slate-400"
                                    placeholder="Masukkan kata sandi..."
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors focus:outline-none"
                                >
                                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between mt-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors"></div>
                                    <i className="fa-solid fa-check text-white text-[10px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                                </div>
                                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Ingat saya</span>
                            </label>
                            <a href="/auth/reset" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">Lupa sandi?</a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-slate-800 hover:bg-emerald-500 text-white font-semibold py-4 px-4 rounded-2xl shadow-lg shadow-slate-200 hover:shadow-emerald-200 transition-all active:scale-[0.98] mt-4"
                        >
                            Masuk Sekarang
                        </button>
                    </form>

                    { }
                    <div className="mt-8">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute border-t border-slate-200 w-full"></div>
                            <span className="bg-slate-50 px-4 text-xs text-slate-400 relative z-10 font-medium">Atau masuk dengan</span>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-2xl flex items-center justify-center gap-3 transition-colors">
                                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="w-5 h-5" />
                                Google
                            </button>
                            <button className="flex-1 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-2xl flex items-center justify-center gap-3 transition-colors">
                                <i className="fa-brands fa-apple text-xl mb-0.5"></i>
                                Apple
                            </button>
                        </div>
                    </div>

                    <p className="text-center mt-10 text-sm text-slate-600">
                        Belum punya akun? <a href="/auth/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Daftar di sini</a>
                    </p>

                </div>
            </div>

        </div>
    );
}