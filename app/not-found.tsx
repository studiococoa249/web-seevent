import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-800 flex flex-col relative overflow-hidden">
      {/* Inject Google Fonts & Font Awesome 6 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;900&display=swap');
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* --- MAIN 404 CONTENT --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 text-center">
        
        {/* Abstract Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-300 rounded-full blur-[100px] opacity-30 -z-10"></div>

        {/* 404 Graphic */}
        <div className="relative mb-6 animate-[bounce_3s_ease-in-out_infinite]">
          <h1 className="text-[120px] md:text-[160px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-700 drop-shadow-sm select-none">
            404
          </h1>
          
          {/* Decorative Floating Icon */}
          <div className="absolute -bottom-4 -right-2 md:-right-6 bg-white px-4 py-3 rounded-2xl shadow-xl border border-slate-100 rotate-12 flex items-center justify-center">
            <i className="fa-solid fa-compass text-emerald-500 text-2xl md:text-3xl animate-[spin_4s_linear_infinite]"></i>
          </div>
          
          {/* Decorative Floating Icon 2 */}
          <div className="absolute top-4 -left-6 bg-white p-2 rounded-xl shadow-lg border border-slate-100 -rotate-12 flex items-center justify-center">
             <i className="fa-regular fa-face-frown-open text-slate-400 text-xl"></i>
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 mt-4 tracking-tight">
          Waduh, nyasar nih!
        </h2>
        <p className="text-slate-500 max-w-sm md:max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed">
          Halaman atau event yang kamu cari sepertinya udah lewat, dihapus, atau emang gak pernah ada. Yuk, balik cari tempat nongkrong yang lain!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md mx-auto">
          <a href="/" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex justify-center items-center gap-2 group">
            <i className="fa-solid fa-house group-hover:-translate-y-0.5 transition-transform"></i> 
            Ke Beranda
          </a>
          
          <a href="/explore" className="flex-1 bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700 font-semibold py-3.5 px-6 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 group">
            <i className="fa-solid fa-magnifying-glass group-hover:scale-110 transition-transform"></i> 
            Eksplor Event
          </a>
        </div>
        
      </main>

      {/* Optional: Decorational Footer for Empty Space */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none -z-10">
        <svg viewBox="0 0 1440 320" className="w-full h-auto text-slate-100 fill-current translate-y-12" preserveAspectRatio="none">
          <path d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,213.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

    </div>
  );
}
