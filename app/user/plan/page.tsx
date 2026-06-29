"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';

interface Plan {
  id: number;
  name_plan: string;
  duration: number;
  total_post_get: number;
  price: number;
}

export default function UserPlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('membership_plan')
          .select('*')
          .order('price', { ascending: true });

        if (error) {
          console.error("Gagal mengambil plan", error);
        } else {
          setPlans(data || []);
        }
      } catch (err) {
        console.error("Terjadi kesalahan", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-6 md:pt-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Pilih Paket Membership</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Dapatkan batas kuota pembuatan event yang lebih besar dan jadilah penyelenggara event terbaik.
          </p>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex justify-center py-12 text-emerald-500">
            <i className="fa-solid fa-circle-notch animate-spin text-4xl"></i>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Belum ada paket membership yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-800">{plan.name_plan}</h3>
                  <div className="mt-4 flex items-baseline text-3xl font-extrabold text-emerald-600">
                    {formatRupiah(plan.price)}
                    <span className="text-sm font-medium text-slate-400 ml-1">/ {plan.duration} Hari</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    <span>Buat hingga <strong className="text-slate-800">{plan.total_post_get} event</strong> unik</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    <span>Masa aktif <strong className="text-slate-800">{plan.duration} Hari</strong></span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    <span>Kelola peserta event dengan mudah</span>
                  </li>
                </ul>

                <button 
                  onClick={() => router.push(`/user/plan/checkout?id=${plan.id}`)}
                  className="w-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold py-3 rounded-2xl transition-colors"
                >
                  Pilih Paket
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
