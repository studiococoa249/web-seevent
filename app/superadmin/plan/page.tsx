"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

interface Plan {
  id: number;
  name_plan: string;
  duration: number;
  total_post_get: number;
  price: number;
  create_at: string;
}

export default function PlanManagement() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/superadmin/plan');
      if (!response.ok) {
        throw new Error('Gagal mengambil data membership plan.');
      }
      const data = await response.json();
      setPlans(data);
    } catch (err: any) {
      setError(err.message || 'Koneksi gagal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus plan ini?')) {
      try {
        const response = await fetch(`/api/superadmin/plan?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menghapus plan.');
        }

        setPlans(plans.filter((plan) => plan.id !== id));
        showToast('Plan berhasil dihapus.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus plan.', 'error');
      }
    }
  };

  const filteredPlans = plans.filter((plan) =>
    plan.name_plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Membership Plan</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola daftar paket membership (durasi, fitur, dan harga).</p>
        </div>
        <Link 
          href="/superadmin/plan/create" 
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          Tambah Plan
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <input 
              type="text" 
              placeholder="Cari nama plan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow"
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <i className="fa-solid fa-circle-notch animate-spin text-emerald-500 text-3xl mb-4"></i>
              <p>Memuat data plan...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              <i className="fa-solid fa-triangle-exclamation text-3xl mb-4"></i>
              <p>{error}</p>
              <button 
                onClick={fetchPlans}
                className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-800 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">ID</th>
                  <th className="px-6 py-4">Nama Plan</th>
                  <th className="px-6 py-4 whitespace-nowrap">Durasi (Hari)</th>
                  <th className="px-6 py-4 whitespace-nowrap">Post Kuota</th>
                  <th className="px-6 py-4 whitespace-nowrap">Harga</th>
                  <th className="px-6 py-4 whitespace-nowrap">Dibuat Pada</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlans.length > 0 ? (
                  filteredPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">#{plan.id}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{plan.name_plan}</td>
                      <td className="px-6 py-4">{plan.duration}</td>
                      <td className="px-6 py-4">{plan.total_post_get} Post</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{formatRupiah(plan.price)}</td>
                      <td className="px-6 py-4 text-xs">
                        {new Date(plan.create_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            href={`/superadmin/plan/edit/${plan.id}`}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </Link>
                          <button 
                            onClick={() => handleDelete(plan.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                            title="Hapus"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <i className="fa-regular fa-folder-open text-4xl mb-3 text-slate-300"></i>
                        <p>Tidak ada plan yang ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
