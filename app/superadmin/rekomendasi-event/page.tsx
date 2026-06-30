"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

interface RekomendasiEvent {
  id: string;
  name: string;
  slug: string;
  desc: string | null;
  banner_imagekit_url: string | null;
  detail_event: {
    organizer?: string;
    event_date?: string;
    location?: string;
    patungan?: number;
  } | null;
  create_at: string;
  update_at: string;
}

export default function RekomendasiEventList() {
  const { showToast } = useToast();
  const [items, setItems] = useState<RekomendasiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/superadmin/rekomendasi-event');
      if (!response.ok) {
        throw new Error('Gagal mengambil data rekomendasi event.');
      }
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus rekomendasi event ini?')) {
      try {
        const response = await fetch(`/api/superadmin/rekomendasi-event?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menghapus rekomendasi.');
        }

        showToast('Rekomendasi event berhasil dihapus.', 'success');
        setItems(items.filter((item) => item.id !== id));
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus rekomendasi.', 'error');
      }
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.desc && item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Rekomendasi Event</h1>
          <p className="text-slate-400 text-xs mt-1">
            Kelola daftar event rekomendasi pilihan redaksi yang tampil di halaman beranda / eksplorasi.
          </p>
        </div>
        <Link
          href="/superadmin/rekomendasi-event/create"
          className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Tambah Rekomendasi
        </Link>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Cari nama rekomendasi atau slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
            <span className="text-sm font-medium">Memuat data rekomendasi...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-3xl"></i>
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-4 px-6">Banner</th>
                  <th className="py-4 px-6">Nama & Slug</th>
                  <th className="py-4 px-6">Deskripsi</th>
                  <th className="py-4 px-6">Detail Event (Metadata)</th>
                  <th className="py-4 px-6">Ditambahkan</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Banner Image */}
                      <td className="py-4 px-6">
                        <div className="w-20 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {item.banner_imagekit_url ? (
                            <img src={item.banner_imagekit_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <i className="fa-solid fa-image text-slate-300 text-lg"></i>
                          )}
                        </div>
                      </td>

                      {/* Name & Slug */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-700">{item.name}</div>
                        <div className="font-mono text-[10px] text-emerald-600 mt-0.5">/{item.slug}</div>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-6 text-slate-500 text-xs max-w-[200px] truncate">
                        {item.desc || <span className="text-slate-300 italic">Tidak ada deskripsi</span>}
                      </td>

                      {/* Detail Event */}
                      <td className="py-4 px-6 text-xs text-slate-600 space-y-1">
                        {item.detail_event ? (
                          <>
                            {item.detail_event.organizer && (
                              <div><strong className="text-slate-500">Host:</strong> {item.detail_event.organizer}</div>
                            )}
                            {item.detail_event.event_date && (
                              <div><strong className="text-slate-500">Tanggal:</strong> {item.detail_event.event_date}</div>
                            )}
                            {item.detail_event.location && (
                              <div><strong className="text-slate-500">Lokasi:</strong> {item.detail_event.location}</div>
                            )}
                            {item.detail_event.patungan !== undefined && (
                              <div>
                                <strong className="text-slate-500">Patungan:</strong>{' '}
                                {item.detail_event.patungan > 0
                                  ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.detail_event.patungan)
                                  : 'Gratis'}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-300 italic">Kosong</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(item.create_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/superadmin/rekomendasi-event/edit/${item.id}`}
                          className="text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 transition-colors inline-block"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-xl border border-red-100 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                      Belum ada rekomendasi event yang ditambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
