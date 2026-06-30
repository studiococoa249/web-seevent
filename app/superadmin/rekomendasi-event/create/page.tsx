"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

export default function CreateRekomendasiEvent() {
  const { showToast } = useToast();
  const router = useRouter();

  // Basic fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // detail_event JSON fields
  const [organizer, setOrganizer] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [patungan, setPatungan] = useState<number | ''>('');

  const [saving, setSaving] = useState(false);

  // Helper to auto-generate slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    // Generate slug: lowercase, replace spaces and non-word characters with dashes
    const generatedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!name || !slug) {
      showToast('Nama dan Slug wajib diisi.', 'error');
      setSaving(false);
      return;
    }

    // Prepare detail_event
    const detailEventObj = {
      organizer: organizer.trim() || undefined,
      event_date: eventDate.trim() || undefined,
      location: location.trim() || undefined,
      patungan: patungan !== '' ? Number(patungan) : undefined,
    };

    try {
      const response = await fetch('/api/superadmin/rekomendasi-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          desc: desc.trim() || null,
          banner_imagekit_url: bannerUrl.trim() || null,
          detail_event: detailEventObj,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menyimpan rekomendasi event.');
      }

      showToast('Rekomendasi event berhasil ditambahkan.', 'success');
      router.push('/superadmin/rekomendasi-event');
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
          href="/superadmin/rekomendasi-event"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-700"
        >
          <i className="fa-solid fa-arrow-left text-sm"></i>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Tambah Rekomendasi Event</h1>
          <p className="text-slate-400 text-xs mt-0.5">Daftarkan event rekomendasi pilihan redaksi yang baru.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: Basic Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Informasi Dasar</h3>
              
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Rekomendasi</label>
                <input
                  type="text"
                  placeholder="Masukkan nama event rekomendasi..."
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Slug (Rute URL)</label>
                <input
                  type="text"
                  placeholder="contoh: konser-musik-seru"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Singkat</label>
                <textarea
                  rows={4}
                  placeholder="Deskripsikan event rekomendasi ini secara singkat dan menarik..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700"
                />
              </div>

              {/* Banner URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Banner Imagekit URL</label>
                <input
                  type="text"
                  placeholder="https://ik.imagekit.io/..."
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
                />
              </div>
            </div>

            {/* RIGHT COLUMN: Detail Event (Metadata JSON) */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">Detail Metadata Event</h3>

              {/* Organizer */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Penyelenggara / Host</label>
                <input
                  type="text"
                  placeholder="Contoh: Dewa 19 Management"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                />
              </div>

              {/* Event Date Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Pelaksanaan (Teks)</label>
                <input
                  type="text"
                  placeholder="Contoh: Sabtu, 15 Agustus 2026 - 19:00 WIB"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lokasi Acara</label>
                <input
                  type="text"
                  placeholder="Contoh: Stadion Utama Gelora Bung Karno, Jakarta"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                />
              </div>

              {/* Patungan / Fee */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jumlah Patungan / Biaya Masuk (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 150000 (kosongkan jika gratis)"
                  value={patungan}
                  onChange={(e) => setPatungan(e.target.value !== '' ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Link
              href="/superadmin/rekomendasi-event"
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
                'Simpan Rekomendasi'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
