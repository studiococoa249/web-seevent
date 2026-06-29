"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

export default function EditImagekitApi({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { showToast } = useToast();
  const { id } = use(params);
  const router = useRouter();

  const [name, setName] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [apikey, setApikey] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/superadmin/imagekit-api?id=${id}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal memuat kredensial.');
        }
        const data = await response.json();
        
        setName(data.name);
        setEndpointUrl(data.endpoint_url);
        setApikey(data.apikey);
        setSecretKey(data.secret_key);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!name || !endpointUrl || !apikey || !secretKey) {
      showToast('Semua kolom formulir harus diisi.', 'error');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/superadmin/imagekit-api', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(id),
          name,
          endpoint_url: endpointUrl,
          apikey,
          secret_key: secretKey,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal memperbarui kredensial.');
      }

      showToast('Kredensial Imagekit API berhasil diperbarui.', 'success');
      router.push('/superadmin/imagekit-api');
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
          href="/superadmin/imagekit-api"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-700"
        >
          <i className="fa-solid fa-arrow-left text-sm"></i>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Edit Kredensial Imagekit</h1>
          <p className="text-slate-400 text-xs mt-0.5">Ubah rincian koneksi API Imagekit.io yang terdaftar.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
          <span className="text-sm font-medium">Memuat data kredensial...</span>
        </div>
      ) : error && !name ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-red-500 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-3xl"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Connection name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Koneksi API</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                required
              />
            </div>

            {/* Endpoint URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Endpoint URL Imagekit</label>
              <input
                type="text"
                placeholder="https://ik.imagekit.io/nama_anda/"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                URL path dasar yang disediakan oleh dashboard developer Imagekit Anda.
              </p>
            </div>

            {/* Public Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">API Key (Public Key)</label>
              <input
                type="text"
                value={apikey}
                onChange={(e) => setApikey(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
                required
              />
            </div>

            {/* Private Secret Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Secret Key (Private Key)</label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <Link
                href="/superadmin/imagekit-api"
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
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
