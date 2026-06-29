"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

interface Category {
  id: number;
  name: string;
  slug: string;
  create_at: string;
}

export default function CategoryManagement() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/superadmin/kategori');
      if (!response.ok) {
        throw new Error('Gagal mengambil data kategori.');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Koneksi gagal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini? Event yang terhubung mungkin akan terpengaruh.')) {
      try {
        const response = await fetch(`/api/superadmin/kategori?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menghapus kategori.');
        }

        setCategories(categories.filter((cat) => cat.id !== id));
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus kategori.', 'error');
      }
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kategori Event</h1>
          <p className="text-slate-400 text-xs mt-1">Kelola kategori untuk klasifikasi pengelompokan event.</p>
        </div>
        <Link
          href="/superadmin/event/kategori/create"
          className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Tambah Kategori
        </Link>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex gap-4 items-center">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
            <span className="text-sm font-medium">Memuat data kategori...</span>
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
                  <th className="py-4 px-6 w-16">ID</th>
                  <th className="py-4 px-6">Nama Kategori</th>
                  <th className="py-4 px-6">Slug</th>
                  <th className="py-4 px-6">Tanggal Dibuat</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">{cat.id}</td>
                      <td className="py-4 px-6 font-semibold text-slate-700">{cat.name}</td>
                      <td className="py-4 px-6 font-mono text-xs text-emerald-600">{cat.slug}</td>
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(cat.create_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/superadmin/event/kategori/edit/${cat.id}`}
                          className="text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-600 px-3.5 py-1.5 rounded-xl border border-emerald-100 transition-colors inline-block"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 px-3.5 py-1.5 rounded-xl border border-red-100 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      Tidak ada kategori yang ditemukan.
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
