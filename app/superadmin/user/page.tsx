"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';

interface User {
  id: string;
  nama_lengkap: string;
  email: string;
  level: 'Admin' | 'Member';
  status: 'Active' | 'Not-Active' | 'Suspend';
  membership: 'Yes' | 'No';
  create_at: string;
}

export default function UserManagement() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/superadmin/users');
      if (!response.ok) {
        throw new Error('Gagal mengambil data user.');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Koneksi gagal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update user status or level in database
  const handleUpdate = async (id: string, field: 'status' | 'level', value: string) => {
    try {
      const response = await fetch('/api/superadmin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: value }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal memperbarui status user.');
      }

      // Update state local
      setUsers(
        users.map((user) => (user.id === id ? { ...user, [field]: value } : user))
      );
    } catch (err: any) {
      showToast(err.message || 'Gagal merubah data.', 'error');
    }
  };

  // Delete user from database
  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini secara permanen dari database?')) {
      try {
        const response = await fetch(`/api/superadmin/users?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menghapus user.');
        }

        // Remove from local state
        setUsers(users.filter((user) => user.id !== id));
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus user.', 'error');
      }
    }
  };

  // Filtered users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    const matchesLevel = levelFilter ? user.level === levelFilter : true;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-slate-400 text-xs mt-1">Daftar pengguna terdaftar di platform se-event.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="text-xs font-semibold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 px-3.5 py-2 border border-emerald-100 rounded-xl transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-rotate-right"></i>
          Segarkan Data
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-40 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Not-Active">Not-Active</option>
            <option value="Suspend">Suspend</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full sm:w-40 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="">Semua Level</option>
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
            <span className="text-sm font-medium">Memuat data pengguna...</span>
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
                  <th className="py-4 px-6">Nama Pengguna</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Level</th>
                  <th className="py-4 px-6">Status Akun</th>
                  <th className="py-4 px-6">Premium Member</th>
                  <th className="py-4 px-6">Tanggal Daftar</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {user.nama_lengkap.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-700">{user.nama_lengkap}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-slate-500 font-mono text-xs">{user.email}</td>

                      {/* Level */}
                      <td className="py-4 px-6">
                        <select
                          value={user.level}
                          onChange={(e) => handleUpdate(user.id, 'level', e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-medium"
                        >
                          <option value="Member">Member</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <select
                          value={user.status}
                          onChange={(e) => handleUpdate(user.id, 'status', e.target.value)}
                          className={`border rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none ${
                            user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : user.status === 'Suspend'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          <option value="Active">Active</option>
                          <option value="Not-Active">Not-Active</option>
                          <option value="Suspend">Suspend</option>
                        </select>
                      </td>

                      {/* Membership */}
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          user.membership === 'Yes'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {user.membership === 'Yes' ? 'PREMIUM' : 'REGULAR'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(user.create_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/superadmin/user/edit/${user.id}`}
                          className="text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 transition-colors inline-block"
                        >
                          Edit Details
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-xl border border-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      Tidak ada pengguna yang cocok dengan kriteria pencarian.
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
