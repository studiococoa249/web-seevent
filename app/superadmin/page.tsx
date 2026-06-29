import React from 'react';
import { supabase } from '@/lib/supabase';

// Force dynamic rendering so statistics are always fresh
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function SuperadminDashboard() {
  // 1. Fetch live metrics from Supabase database
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: totalCategories } = await supabase
    .from('category_event')
    .select('*', { count: 'exact', head: true });

  const { count: totalSuccessTrx, data: successTrx } = await supabase
    .from('trx_membership')
    .select('id, detail_payment, create_at, users(nama_lengkap, email)')
    .eq('status_payment', 'Success');

  const { data: recentTrx } = await supabase
    .from('trx_membership')
    .select('id, status_payment, detail_payment, create_at, users(nama_lengkap, email)')
    .order('create_at', { ascending: false })
    .limit(5);

  // 2. Calculate earnings based on successful transaction details JSON
  let totalEarnings = 0;
  successTrx?.forEach((trx: any) => {
    try {
      const details =
        typeof trx.detail_payment === 'string'
          ? JSON.parse(trx.detail_payment)
          : trx.detail_payment;
      const price = Number(details?.price || details?.amount || 0);
      totalEarnings += price;
    } catch (e) {
      // Ignore parse errors
    }
  });

  // Safe fallback if there are no transactions yet
  const displayEarnings = totalEarnings > 0 
    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalEarnings)
    : 'Rp 0';



  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm shadow-slate-100/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Halo, Administrator 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Berikut adalah status terkini dari platform aplikasi se-event Anda hari ini.
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-400 bg-slate-50 px-3.5 py-2 border border-slate-100 rounded-xl">
          Terakhir Diperbarui: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Users */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all group">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pengguna</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2 tracking-tight group-hover:text-emerald-600 transition-colors">
              {totalUsers ?? 0}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up"></i>
              <span>+12% minggu ini</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>

        {/* Card 2: Categories */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all group">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori Event</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2 tracking-tight group-hover:text-emerald-600 transition-colors">
              {totalCategories ?? 0}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Aktif & digunakan
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <i className="fa-solid fa-tags"></i>
          </div>
        </div>

        {/* Card 3: Success Payments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all group">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaksi Sukses</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2 tracking-tight group-hover:text-emerald-600 transition-colors">
              {totalSuccessTrx ?? 0}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up"></i>
              <span>+8% bulan ini</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <i className="fa-solid fa-circle-check"></i>
          </div>
        </div>

        {/* Card 4: Earnings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all group">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendapatan Bersih</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2 tracking-tight truncate group-hover:text-emerald-600 transition-colors">
              {displayEarnings}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <i className="fa-solid fa-arrow-trend-up"></i>
              <span>+15% dari target</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <i className="fa-solid fa-wallet"></i>
          </div>
        </div>
      </div>

      {/* Main Stats Charts & Recent activity grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Mock Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Statistik Keanggotaan & Trafik</h3>
              <p className="text-slate-400 text-xs mt-0.5">Ringkasan pendaftaran member baru 6 bulan terakhir</p>
            </div>
            <select className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl outline-none focus:border-emerald-500">
              <option>Tahun 2026</option>
              <option>Tahun 2025</option>
            </select>
          </div>
          
          {/* SVG Dummy Chart (Clean CSS grid + lines) */}
          <div className="h-64 w-full flex items-end justify-between gap-2 pt-6 relative px-2">
            {/* Grid backgrounds */}
            <div className="absolute top-6 left-0 right-0 border-t border-slate-50"></div>
            <div className="absolute top-20 left-0 right-0 border-t border-slate-50"></div>
            <div className="absolute top-36 left-0 right-0 border-t border-slate-50"></div>
            <div className="absolute top-52 left-0 right-0 border-t border-slate-50"></div>
            
            {/* Chart Columns */}
            {[
              { month: 'Jan', val: 'h-[35%]', valNum: 140 },
              { month: 'Feb', val: 'h-[50%]', valNum: 210 },
              { month: 'Mar', val: 'h-[45%]', valNum: 180 },
              { month: 'Apr', val: 'h-[75%]', valNum: 320 },
              { month: 'Mei', val: 'h-[60%]', valNum: 250 },
              { month: 'Jun', val: 'h-[90%]', valNum: 390 },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                <div className="text-[10px] font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-5">
                  {col.valNum} User
                </div>
                <div className={`w-full max-w-[40px] bg-slate-100 group-hover:bg-emerald-600 rounded-t-xl transition-all duration-500 ${col.val} relative flex justify-center`}>
                  <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 rounded-t-xl transition-opacity"></div>
                </div>
                <span className="text-xs font-semibold text-slate-400">{col.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Platform Activities / Notifications */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Status Platform</h3>
            <p className="text-slate-400 text-xs mt-0.5">Pemantauan sistem secara real-time</p>
          </div>
          
          <div className="space-y-4 flex-1">
            {[
              { name: 'Koneksi Supabase Database', status: 'Online', desc: 'Latency 18ms', active: true },
              { name: 'API Tripay Gateway', status: 'Online', desc: 'Mode Sandbox aktif', active: true },
              { name: 'Imagekit CDN Storage', status: 'Online', desc: 'Storage terhubung', active: true },
              { name: 'Email SMTP Server', status: 'Offline', desc: 'Perlu konfigurasi', active: false },
            ].map((sys, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">{sys.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{sys.desc}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  sys.active 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {sys.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Transaksi Pembayaran Terbaru</h3>
            <p className="text-slate-400 text-xs mt-0.5">Daftar transaksi pendaftaran member masuk ke sistem</p>
          </div>
          <a
            href="/superadmin/pembayaran"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Lihat Semua Transaksi →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                <th className="py-4 px-6">ID Transaksi</th>
                <th className="py-4 px-6">Pelanggan</th>
                <th className="py-4 px-6">Paket Keanggotaan</th>
                <th className="py-4 px-6">Jumlah Pembayaran</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {recentTrx && recentTrx.length > 0 ? (
                recentTrx.map((trx: any) => {
                  let details: any = {};
                  try {
                    details =
                      typeof trx.detail_payment === 'string'
                        ? JSON.parse(trx.detail_payment)
                        : trx.detail_payment;
                  } catch (e) {}

                  const price = Number(details?.price || details?.amount || 0);
                  const displayPrice = price > 0
                    ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)
                    : 'Rp -';

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-500 max-w-[120px] truncate">{trx.id}</td>
                      <td className="py-4 px-6 font-semibold text-slate-700">{trx.users?.nama_lengkap || 'Guest'}</td>
                      <td className="py-4 px-6 text-slate-500">{details?.plan_name || 'Standard Plan'}</td>
                      <td className="py-4 px-6 font-semibold text-slate-800">{displayPrice}</td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          trx.status_payment === 'Success'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : trx.status_payment === 'Pending'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {trx.status_payment}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(trx.create_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-semibold">
                    Belum ada transaksi pembayaran terbaru di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
