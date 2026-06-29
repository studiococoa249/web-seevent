"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

interface DatabaseEvent {
  id: string;
  title: string;
  slug: string;
  location: string;
  event_date: string;
  max_participants: number;
  status: 'Draft' | 'Publish' | 'Cancelled' | 'Completed';
  image_url_imagekit: string | null;
  id_category_event: number;
  id_users: string;
  category_event: {
    name: string;
  } | null;
  users: {
    nama_lengkap: string;
  } | null;
}

interface Category {
  id: number;
  name: string;
}

export default function EventDataManagement() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<DatabaseEvent[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch real events
      const resEvents = await fetch('/api/superadmin/event');
      if (!resEvents.ok) throw new Error('Gagal mengambil data event dari database.');
      const dataEvents = await resEvents.json();
      setEvents(dataEvents);

      // 2. Fetch real categories
      const resCategories = await fetch('/api/superadmin/kategori');
      if (resCategories.ok) {
        const dataCategories = await resCategories.json();
        setCategories(dataCategories);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dari database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus event dengan ID ${id} secara permanen?`)) {
      try {
        const response = await fetch(`/api/superadmin/event?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menghapus event.');
        }

        setEvents(events.filter((evt) => evt.id !== id));
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus event.', 'error');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'Draft' | 'Publish' | 'Cancelled' | 'Completed') => {
    try {
      const response = await fetch('/api/superadmin/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal merubah status event.');
      }

      setEvents(
        events.map((evt) => (evt.id === id ? { ...evt, status: newStatus } : evt))
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal merubah status event.', 'error');
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (evt.users?.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? evt.status === statusFilter : true;
    const matchesCategory = categoryFilter
      ? evt.id_category_event === parseInt(categoryFilter)
      : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="w-full space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Event</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">Kelola data ajakan event dan pertunjukan aktif langsung di platform.</p>
        </div>
        <button
          onClick={() => showToast('Untuk menambahkan event baru, silakan gunakan antarmuka frontend/form pembuatan event.', 'info')}
          className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Buat Event Baru
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Cari judul event, lokasi, atau pembuat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-medium"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
          >
            <option value="">Semua Status</option>
            <option value="Publish">Publish (Aktif)</option>
            <option value="Draft">Draft</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
            <span className="text-sm font-medium">Memuat data event database...</span>
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
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Judul Event</th>
                  <th className="py-4 px-6">Penyelenggara</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Lokasi</th>
                  <th className="py-4 px-6">Tanggal Event</th>
                  <th className="py-4 px-6">Kuota</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-[10px] text-slate-400 max-w-[100px] truncate">
                        {evt.id}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700 max-w-[200px] truncate">
                        {evt.title}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {evt.users?.nama_lengkap || 'Tidak Diketahui'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-emerald-50/60 text-emerald-700 px-2.5 py-1 rounded-xl border border-emerald-100/50 text-[10px] font-bold">
                          {evt.category_event?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 max-w-[150px] truncate font-medium">
                        {evt.location}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs font-medium">
                        {new Date(evt.event_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800 text-xs">
                        {evt.max_participants > 0 ? `${evt.max_participants} Orang` : 'Tak Terbatas'}
                      </td>
                      
                      {/* Status Select */}
                      <td className="py-4 px-6">
                        <select
                          value={evt.status}
                          onChange={(e) => handleStatusChange(evt.id, e.target.value as any)}
                          className={`border rounded-xl px-2 py-0.5 text-[10px] font-bold focus:outline-none ${
                            evt.status === 'Publish'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : evt.status === 'Draft'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : evt.status === 'Completed'
                              ? 'bg-blue-50 text-blue-600 border-blue-100'
                              : 'bg-red-50 text-red-600 border-red-100'
                          }`}
                        >
                          <option value="Publish">Publish</option>
                          <option value="Draft">Draft</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/superadmin/event/data/edit/${evt.id}`}
                          className="text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 transition-colors inline-block"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(evt.id)}
                          className="text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-xl border border-red-100 transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                      Tidak ada data event ditemukan di database.
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
