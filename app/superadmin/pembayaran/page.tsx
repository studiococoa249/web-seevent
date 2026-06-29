"use client";

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/toast-context';

interface Transaction {
  id: string;
  id_user: string;
  status_payment: 'Pending' | 'Error' | 'Expired' | 'Success';
  detail_payment: any;
  create_at: string;
  users: {
    nama_lengkap: string;
    email: string;
  } | null;
}

export default function PaymentManagement() {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [activeTrx, setActiveTrx] = useState<Transaction | null>(null);
  const [modalStatus, setModalStatus] = useState<'Pending' | 'Error' | 'Expired' | 'Success'>('Pending');
  const [modalJsonText, setModalJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/superadmin/pembayaran');
      if (!response.ok) {
        throw new Error('Gagal mengambil data transaksi pembayaran.');
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Koneksi gagal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleOpenModal = (trx: Transaction) => {
    setActiveTrx(trx);
    setModalStatus(trx.status_payment);
    setModalJsonText(
      JSON.stringify(
        typeof trx.detail_payment === 'string'
          ? JSON.parse(trx.detail_payment)
          : trx.detail_payment,
        null,
        2
      )
    );
    setJsonError(null);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrx) return;

    setSaving(true);
    setJsonError(null);

    // Validate JSON input
    let parsedJson = {};
    try {
      parsedJson = JSON.parse(modalJsonText);
    } catch (err: any) {
      setJsonError('Format JSON tidak valid: ' + err.message);
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/superadmin/pembayaran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeTrx.id,
          status_payment: modalStatus,
          detail_payment: parsedJson,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menyimpan transaksi.');
      }

      // Close modal and refresh transactions
      setActiveTrx(null);
      await fetchTransactions();
    } catch (err: any) {
      setJsonError(err.message || 'Koneksi gagal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan transaksi ini?')) {
      try {
        const response = await fetch(`/api/superadmin/pembayaran?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Gagal menghapus transaksi.');
        }

        setTransactions(transactions.filter((t) => t.id !== id));
      } catch (err: any) {
        showToast(err.message || 'Gagal menghapus transaksi.', 'error');
      }
    }
  };

  const filteredTransactions = transactions.filter((trx) => {
    const matchesSearch =
      trx.users?.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? trx.status_payment === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Transaksi Pembayaran</h1>
          <p className="text-slate-400 text-xs mt-1">Kelola transaksi membership premium dan update status pembayaran.</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="text-xs font-semibold text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-600 px-3.5 py-2 border border-emerald-100 rounded-xl transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-rotate-right"></i>
          Segarkan Transaksi
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i className="fa-solid fa-magnifying-glass text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Cari ID transaksi, nama, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-700"
          />
        </div>

        {/* Dropdown status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
        >
          <option value="">Semua Status</option>
          <option value="Pending">Pending</option>
          <option value="Success">Success</option>
          <option value="Expired">Expired</option>
          <option value="Error">Error</option>
        </select>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-600"></i>
            <span className="text-sm font-medium">Memuat data transaksi...</span>
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
                  <th className="py-4 px-6">ID Transaksi</th>
                  <th className="py-4 px-6">Nama Pengguna</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Status Pembayaran</th>
                  <th className="py-4 px-6">Jumlah Pembayaran</th>
                  <th className="py-4 px-6">Detail Metadata</th>
                  <th className="py-4 px-6">Tanggal</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((trx) => {
                    let details: any = {};
                    try {
                      details =
                        typeof trx.detail_payment === 'string'
                          ? JSON.parse(trx.detail_payment)
                          : trx.detail_payment;
                    } catch (e) {}

                    const amount = Number(details?.price || details?.amount || 0);
                    const displayAmount = amount > 0
                      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
                      : 'Rp -';

                    return (
                      <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 max-w-[120px] truncate">{trx.id}</td>
                        <td className="py-4 px-6 font-semibold text-slate-700">{trx.users?.nama_lengkap || 'Guest'}</td>
                        <td className="py-4 px-6 text-slate-500 font-mono text-xs">{trx.users?.email || '-'}</td>
                        <td className="py-4 px-6">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            trx.status_payment === 'Success'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : trx.status_payment === 'Pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-100'
                              : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {trx.status_payment}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800">{displayAmount}</td>
                        
                        {/* JSON Metadata inline preview */}
                        <td className="py-4 px-6 max-w-[200px] truncate">
                          <span className="font-mono text-xs text-slate-400">
                            {JSON.stringify(details)}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-slate-400 text-xs">
                          {new Date(trx.create_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenModal(trx)}
                            className="text-xs font-semibold text-emerald-600 hover:text-white hover:bg-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 transition-colors"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={() => handleDelete(trx.id)}
                            className="text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-xl border border-red-100 transition-colors"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      Tidak ada data transaksi pembayaran ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Form Update Pembayaran */}
      {activeTrx && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Update Status Transaksi & Detail</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">ID: {activeTrx.id}</p>
              </div>
              <button
                onClick={() => setActiveTrx(null)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 border border-slate-200/55 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-xmark text-sm px-0.5"></i>
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-5">
              {jsonError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-xmark text-sm shrink-0"></i>
                  <span>{jsonError}</span>
                </div>
              )}

              {/* Status Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Pembayaran</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
                >
                  <option value="Pending">Pending (Menunggu Pembayaran)</option>
                  <option value="Success">Success (Sukses / Lunas)</option>
                  <option value="Expired">Expired (Kedaluwarsa)</option>
                  <option value="Error">Error (Gagal / Bermasalah)</option>
                </select>
                {modalStatus === 'Success' && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                    <i className="fa-solid fa-circle-info"></i>
                    <span>Menyetel status ke Success akan mengaktifkan premium member pengguna secara otomatis di database.</span>
                  </p>
                )}
              </div>

              {/* JSON Editor Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detail Metadata Pembayaran (JSON)</label>
                <textarea
                  rows={8}
                  value={modalJsonText}
                  onChange={(e) => setModalJsonText(e.target.value)}
                  className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder='{"price": 99000, "plan_id": 1, "plan_name": "Pro Plan", "duration_days": 30}'
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Metadata JSON menyimpan rincian log pembayaran Tripay seperti nominal (`price`/`amount`), `plan_id`, dan durasi.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTrx(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold rounded-2xl text-xs transition-all"
                >
                  Batal
                </button>
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
                    'Simpan Pembayaran'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
