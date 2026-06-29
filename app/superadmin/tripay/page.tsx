"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';

export default function TripayConfigManagement() {
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [merchant, setMerchant] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [mode, setMode] = useState<'Sandbox' | 'Production'>('Sandbox');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/superadmin/tripay');
        if (!response.ok) {
          throw new Error('Gagal memuat konfigurasi.');
        }
        const data = await response.json();
        if (data) {
          setApiKey(data.api_key || '');
          setMerchant(data.merchant || '');
          setPrivateKey(data.private_key || '');
          setMode(data.mode || 'Sandbox');
        }
      } catch (err: any) {
        showToast(err.message || 'Koneksi gagal.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!apiKey || !merchant || !privateKey || !mode) {
      setError('Semua kolom konfigurasi wajib diisi.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/superadmin/tripay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          merchant,
          private_key: privateKey,
          mode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menyimpan konfigurasi.');
      }

      showToast('Konfigurasi Tripay berhasil disimpan dan diterapkan!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Konfigurasi Tripay</h1>
        <p className="text-slate-400 text-xs mt-1">
          Atur kredensial payment gateway Tripay Anda untuk memproses pembayaran membership premium secara otomatis.
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
          <span className="text-sm font-medium">Memuat konfigurasi Tripay...</span>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid 1: Merchant Code & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Merchant Code</label>
                <input
                  type="text"
                  placeholder="Masukkan Merchant Code (contoh: T12345)..."
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mode Gateway</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'Sandbox' | 'Production')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-bold"
                >
                  <option value="Sandbox">Sandbox (Tahap Pengujian)</option>
                  <option value="Production">Production (Live Asli)</option>
                </select>
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">API Key</label>
              <input
                type="password"
                placeholder="Masukkan API Key Tripay..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
                required
              />
            </div>

            {/* Private Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Private Key</label>
              <textarea
                rows={4}
                placeholder="Masukkan Private Key Tripay..."
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
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
                  'Simpan Konfigurasi'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
