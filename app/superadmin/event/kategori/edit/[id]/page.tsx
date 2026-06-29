"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast-context';

export default function EditCategory({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { showToast } = useToast();
  const { id } = use(params);
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('category_event')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error('Kategori tidak ditemukan.');
        }

        setName(data.name);
        setSlug(data.slug);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat kategori.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(generateSlug(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!name || !slug) {
      showToast('Semua kolom formulir harus diisi.', 'error');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/superadmin/kategori', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id), name, slug }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal memperbarui kategori.');
      }

      showToast('Kategori berhasil diperbarui!', 'success');
      router.push('/superadmin/event/kategori');
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
          href="/superadmin/event/kategori"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-700"
        >
          <i className="fa-solid fa-arrow-left text-sm"></i>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Edit Kategori</h1>
          <p className="text-slate-400 text-xs mt-0.5">Ubah rincian kategori event yang ada.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
          <span className="text-sm font-medium">Memuat data kategori...</span>
        </div>
      ) : error && !name ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-red-500 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-3xl"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Kategori</label>
              <input
                type="text"
                placeholder="Masukkan nama kategori..."
                value={name}
                onChange={handleNameChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-medium"
                required
              />
            </div>

            {/* Category Slug */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Slug URL</label>
              <input
                type="text"
                placeholder="Slug-kategori-otomatis"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono text-emerald-600"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1.5">
                Slug digunakan sebagai path URL ramah SEO. Terbentuk otomatis dari nama kategori.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <Link
                href="/superadmin/event/kategori"
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
