"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

interface ImagekitApi {
  id: number;
  name: string;
  endpoint_url: string;
  apikey: string;
  secret_key: string;
  create_at: string;
}

export default function ImagekitApiList() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ImagekitApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSecretId, setShowSecretId] = useState<number | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/superadmin/imagekit-api');
      if (!response.ok) {
        throw new Error('Gagal mengambil data Imagekit API.');
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

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus kredensial API Imagekit ini?')) {
      try {
        const response = await fetch(`/api/superadmin/imagekit-api?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menghapus kredensial.');
        }

        setItems(items.filter((item) => item.id !== id));
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus kredensial.', 'error');
      }
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.endpoint_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kredensial Imagekit API</h1>
          <p className="text-slate-400 text-xs mt-1">
            Kelola kunci akses penyimpanan gambar pihak ketiga (Imagekit.io) untuk platform Anda.
          </p>
        </div>
        <Link
          href="/superadmin/imagekit-api/create"
          className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Tambah Kredensial
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
            placeholder="Cari nama koneksi atau URL endpoint..."
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
            <span className="text-sm font-medium">Memuat data kredensial...</span>
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
                  <th className="py-4 px-6">Nama Koneksi</th>
                  <th className="py-4 px-6">Endpoint URL</th>
                  <th className="py-4 px-6">API Key (Public)</th>
                  <th className="py-4 px-6">Secret Key (Private)</th>
                  <th className="py-4 px-6">Ditambahkan</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">{item.id}</td>
                      <td className="py-4 px-6 font-semibold text-slate-700">{item.name}</td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500 max-w-[200px] truncate">
                        {item.endpoint_url}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500 max-w-[150px] truncate">
                        {item.apikey}
                      </td>
                      
                      {/* Masked Secret Key with Show/Hide toggle */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500 max-w-[120px] truncate">
                            {showSecretId === item.id ? item.secret_key : '••••••••••••••••'}
                          </span>
                          <button
                            onClick={() => setShowSecretId(showSecretId === item.id ? null : item.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <i className={`fa-solid ${showSecretId === item.id ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(item.create_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/superadmin/imagekit-api/edit/${item.id}`}
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
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      Belum ada kredensial Imagekit API yang ditambahkan.
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
