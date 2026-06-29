"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

interface Category {
  id: number;
  name: string;
}

interface User {
  id: string;
  nama_lengkap: string;
  email: string;
}

export default function EditEvent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { showToast } = useToast();
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selector lists
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [idUsers, setIdUsers] = useState('');
  const [idCategoryEvent, setIdCategoryEvent] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('0');
  const [status, setStatus] = useState<'Draft' | 'Publish' | 'Cancelled' | 'Completed'>('Draft');
  const [imageUrl, setImageUrl] = useState('');
  
  const [titleSeo, setTitleSeo] = useState('');
  const [descSeo, setDescSeo] = useState('');
  const [descFull, setDescFull] = useState('');
  const [pesanAjakan, setPesanAjakan] = useState('');
  const [patungan, setPatungan] = useState('');

  // Auto slug generation helper
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    );
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch categories
        const resCats = await fetch('/api/superadmin/kategori');
        if (!resCats.ok) throw new Error('Gagal memuat kategori event.');
        const dataCats = await resCats.json();
        setCategories(dataCats);

        // 2. Fetch users
        const resUsers = await fetch('/api/superadmin/users');
        if (!resUsers.ok) throw new Error('Gagal memuat daftar pengguna.');
        const dataUsers = await resUsers.json();
        setUsers(dataUsers);

        // 3. Fetch single event details
        const resEvt = await fetch(`/api/superadmin/event?id=${id}`);
        if (!resEvt.ok) {
          const errData = await resEvt.json();
          throw new Error(errData.error || 'Gagal memuat detail event.');
        }
        const dataEvt = await resEvt.json();

        setTitle(dataEvt.title || '');
        setSlug(dataEvt.slug || '');
        setIdUsers(dataEvt.id_users || '');
        setIdCategoryEvent(dataEvt.id_category_event?.toString() || '');
        setLocation(dataEvt.location || '');
        
        // Format ISO timestamp to YYYY-MM-DDTHH:MM for input datetime-local
        if (dataEvt.event_date) {
          const dateObj = new Date(dataEvt.event_date);
          const offset = dateObj.getTimezoneOffset();
          const localDate = new Date(dateObj.getTime() - offset * 60 * 1000);
          setEventDate(localDate.toISOString().slice(0, 16));
        }
        
        setMaxParticipants(dataEvt.max_participants?.toString() || '0');
        setStatus(dataEvt.status || 'Draft');
        setImageUrl(dataEvt.image_url_imagekit || '');
        setTitleSeo(dataEvt.title_seo || '');
        setDescSeo(dataEvt.desc_seo || '');
        setDescFull(dataEvt.desc_full || '');
        setPesanAjakan(dataEvt.pesan_ajakan || '');
        setPatungan(dataEvt.patungan?.toString() || '');

      } catch (err: any) {
        setError(err.message || 'Koneksi gagal.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (!title || !slug || !idUsers || !location || !eventDate) {
      showToast('Semua kolom bertanda bintang (*) wajib diisi.', 'error');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/superadmin/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title,
          slug,
          id_users: idUsers,
          id_category_event: idCategoryEvent ? parseInt(idCategoryEvent) : null,
          location,
          event_date: new Date(eventDate).toISOString(),
          max_participants: parseInt(maxParticipants || '0'),
          status,
          image_url_imagekit: imageUrl || null,
          title_seo: titleSeo || null,
          desc_seo: descSeo || null,
          desc_full: descFull || null,
          pesan_ajakan: pesanAjakan || null,
          patungan: patungan ? parseFloat(patungan) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menyimpan perubahan event.');
      }

      showToast('Detail event berhasil disimpan!', 'success');
      router.push('/superadmin/event/data');
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/superadmin/event/data"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-700"
        >
          <i className="fa-solid fa-arrow-left text-sm"></i>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Edit Rincian Event</h1>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">Perbarui rincian data event di database secara real-time.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
          <span className="text-sm font-medium">Memuat rincian event...</span>
        </div>
      ) : error && !title ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-red-500 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-3xl"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Event / Judul *</label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Slug URL (SEO friendly) *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono text-emerald-600"
                  required
                />
              </div>
            </div>

            {/* Organizers (id_users) & Categories (id_category_event) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Penyelenggara (User) *</label>
                <select
                  value={idUsers}
                  onChange={(e) => setIdUsers(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
                  required
                >
                  <option value="">Pilih Penyelenggara</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama_lengkap} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kategori Event</label>
                <select
                  value={idCategoryEvent}
                  onChange={(e) => setIdCategoryEvent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Lokasi / Tempat *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Pelaksanaan *</label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-medium"
                  required
                />
              </div>
            </div>

            {/* Max Participants & Status & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kuota Peserta Max</label>
                <input
                  type="number"
                  placeholder="0 untuk Tak Terbatas"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Penayangan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
                >
                  <option value="Publish">Publish</option>
                  <option value="Draft">Draft</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Image URL (Imagekit)</label>
                <input
                  type="text"
                  placeholder="https://ik.imagekit.io/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
                />
              </div>
            </div>

            {/* Patungan & Pesan Ajakan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Biaya Patungan (Kosongkan jika gratis/bebas)</label>
                <input
                  type="number"
                  placeholder="Contoh: 35000"
                  value={patungan}
                  onChange={(e) => setPatungan(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pesan Ajakan / Tagline</label>
                <input
                  type="text"
                  placeholder="Contoh: Cari teman nonton tribun B!"
                  value={pesanAjakan}
                  onChange={(e) => setPesanAjakan(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700"
                />
              </div>
            </div>

            {/* SEO Section */}
            <div className="pt-4 border-t border-slate-100 space-y-6">
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Optimasi Search Engine (SEO)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Meta Title SEO</label>
                  <input
                    type="text"
                    placeholder="Masukkan meta title..."
                    value={titleSeo}
                    onChange={(e) => setTitleSeo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Meta Deskripsi SEO</label>
                  <input
                    type="text"
                    placeholder="Masukkan meta deskripsi..."
                    value={descSeo}
                    onChange={(e) => setDescSeo(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Full description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deskripsi Lengkap Event</label>
              <textarea
                rows={6}
                value={descFull}
                onChange={(e) => setDescFull(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700"
                placeholder="Tuliskan isi rincian detail event di sini..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <Link
                href="/superadmin/event/data"
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
