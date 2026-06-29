"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast-context';

export default function CreatePlan() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name_plan: '',
    duration: '',
    total_post_get: '',
    price: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/superadmin/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan plan.');
      }

      showToast('Membership Plan berhasil ditambahkan.', 'success');
      router.push('/superadmin/plan');
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/superadmin/plan"
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Plan</h1>
          <p className="text-sm text-slate-500 mt-1">Buat paket membership baru untuk user.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Plan <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name_plan"
                required
                value={formData.name_plan}
                onChange={handleChange}
                placeholder="Contoh: Premium Mingguan"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Durasi (Hari) <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="duration"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Contoh: 7"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Kuota Post <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="total_post_get"
                  required
                  min="0"
                  value={formData.total_post_get}
                  onChange={handleChange}
                  placeholder="Contoh: 10"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Harga (Rp) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="Contoh: 50000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link 
              href="/superadmin/plan"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <><i className="fa-solid fa-circle-notch animate-spin"></i> Menyimpan...</>
              ) : (
                <><i className="fa-solid fa-save"></i> Simpan Plan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
