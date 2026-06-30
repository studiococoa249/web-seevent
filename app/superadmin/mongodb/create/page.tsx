"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

export default function CreateMongodbConnection() {
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'Active' | 'Not-Active'>('Active');
  const [connectionString, setConnectionString] = useState('');
  const [databaseName, setDatabaseName] = useState('');

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!name || !status || !connectionString || !databaseName) {
      showToast('Semua kolom formulir wajib diisi.', 'error');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/superadmin/mongodb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          status,
          mongodb_config: {
            connection_string: connectionString.trim(),
            database: databaseName.trim()
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menyimpan koneksi.');
      }

      showToast('Koneksi MongoDB berhasil ditambahkan.', 'success');
      router.push('/superadmin/mongodb');
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/superadmin/mongodb"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-700"
        >
          <i className="fa-solid fa-arrow-left text-sm"></i>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Tambah Koneksi MongoDB</h1>
          <p className="text-slate-400 text-xs mt-0.5">Daftarkan koneksi database MongoDB yang baru.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Connection name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Koneksi</label>
            <input
              type="text"
              placeholder="Masukkan nama koneksi (contoh: MongoDB Primary)..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
              required
            />
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Active' | 'Not-Active')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
            >
              <option value="Active">Active</option>
              <option value="Not-Active">Not-Active</option>
            </select>
          </div>

          {/* Connection String Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Connection String (URI)</label>
            <input
              type="text"
              placeholder="mongodb+srv://user:pass@cluster.mongodb.net/ atau mongodb://..."
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Alamat URI lengkap beserta username, password, dan host klaster database Anda.
            </p>
          </div>

          {/* Database Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Database</label>
            <input
              type="text"
              placeholder="seevent"
              value={databaseName}
              onChange={(e) => setDatabaseName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Nama database target yang akan digunakan oleh platform Anda.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Link
              href="/superadmin/mongodb"
              className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold rounded-2xl text-xs transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl text-xs transition-all disabled:bg-slate-400 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin"></i>
                  Menyimpan...
                </>
              ) : (
                'Simpan Koneksi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
