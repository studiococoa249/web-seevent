"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-6 md:pt-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Checkout Membership</h1>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500">Halaman checkout sedang dalam pengembangan.</p>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
