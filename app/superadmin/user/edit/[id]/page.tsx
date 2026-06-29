"use client";

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/lib/toast-context';

interface UserDetail {
  id: string;
  nama_lengkap: string;
  email: string;
  level: 'Admin' | 'Member';
  status: 'Active' | 'Not-Active' | 'Suspend';
  membership: 'Yes' | 'No';
  id_membership_plan: number | null;
  start_membership: string | null;
  end_membership: string | null;
}

interface MembershipPlan {
  id: number;
  name_plan: string;
}

export default function EditUser({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { showToast } = useToast();
  const { id } = use(params);
  const router = useRouter();

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState<'Admin' | 'Member'>('Member');
  const [status, setStatus] = useState<'Active' | 'Not-Active' | 'Suspend'>('Not-Active');
  const [membership, setMembership] = useState<'Yes' | 'No'>('No');
  const [planId, setPlanId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch user detail from API
        const userRes = await fetch(`/api/superadmin/users/detail?id=${id}`);
        if (!userRes.ok) {
          throw new Error('Gagal mengambil data detail user.');
        }
        const userData: UserDetail = await userRes.json();
        setUserDetail(userData);
        
        // Populating form states
        setName(userData.nama_lengkap);
        setEmail(userData.email);
        setLevel(userData.level);
        setStatus(userData.status);
        setMembership(userData.membership);
        setPlanId(userData.id_membership_plan?.toString() || '');
        setStartDate(userData.start_membership ? userData.start_membership.substring(0, 10) : '');
        setEndDate(userData.end_membership ? userData.end_membership.substring(0, 10) : '');

        // 2. Fetch membership plans directly from Supabase
        const { data: planData, error: planError } = await supabase
          .from('membership_plan')
          .select('id, name_plan');
        
        if (!planError && planData) {
          setPlans(planData);
        }
      } catch (err: any) {
        setError(err.message || 'Koneksi gagal.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      id,
      nama_lengkap: name,
      email,
      level,
      status,
      membership,
      id_membership_plan: membership === 'Yes' && planId ? parseInt(planId) : null,
      start_membership: membership === 'Yes' && startDate ? new Date(startDate).toISOString() : null,
      end_membership: membership === 'Yes' && endDate ? new Date(endDate).toISOString() : null,
    };

    try {
      const response = await fetch('/api/superadmin/users/detail', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menyimpan perubahan.');
      }

      showToast('Detail pengguna berhasil diperbarui!', 'success');
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'Gagal memperbarui user.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/superadmin/user"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-500 hover:text-slate-700"
        >
          <i className="fa-solid fa-arrow-left text-sm"></i>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Edit Detail Pengguna</h1>
          <p className="text-slate-400 text-xs mt-0.5">Ubah status, level, dan keanggotaan pengguna.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
          <span className="text-sm font-medium">Memuat rincian user...</span>
        </div>
      ) : error && !userDetail ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center text-red-500 flex flex-col items-center justify-center gap-3">
          <i className="fa-solid fa-circle-exclamation text-3xl"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700 font-mono"
                  required
                />
              </div>
            </div>

            {/* Grid 2: Level & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Level Akses</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as 'Admin' | 'Member')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
                >
                  <option value="Member">Member (Pengguna Biasa)</option>
                  <option value="Admin">Admin (Pengelola Platform)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Akun</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Not-Active' | 'Suspend')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
                >
                  <option value="Active">Active (Aktif)</option>
                  <option value="Not-Active">Not-Active (Belum Aktif)</option>
                  <option value="Suspend">Suspend (Ditangguhkan)</option>
                </select>
              </div>
            </div>

            {/* Section: Premium Membership Settings */}
            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Membership Premium</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Konfigurasi hak akses premium pengguna</p>
                </div>
                <select
                  value={membership}
                  onChange={(e) => setMembership(e.target.value as 'Yes' | 'No')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold focus:outline-none border ${
                    membership === 'Yes'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  <option value="No">Regular (No)</option>
                  <option value="Yes">Premium (Yes)</option>
                </select>
              </div>

              {membership === 'Yes' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-slate-100">
                  {/* Select Plan */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Pilih Paket Membership</label>
                    <select
                      value={planId}
                      onChange={(e) => setPlanId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-emerald-500 font-semibold"
                      required={membership === 'Yes'}
                    >
                      <option value="">-- Pilih Paket Plan --</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id.toString()}>
                          {plan.name_plan}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mulai Keanggotaan</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
                      required={membership === 'Yes'}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Akhir Keanggotaan</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
                      required={membership === 'Yes'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <Link
                href="/superadmin/user"
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
