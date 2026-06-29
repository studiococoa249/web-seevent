import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: transactions, error } = await supabase
      .from('trx_membership')
      .select('id, id_user, status_payment, detail_payment, create_at, users(nama_lengkap, email)')
      .order('create_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status_payment, detail_payment } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID transaksi wajib diisi.' }, { status: 400 });
    }

    const updateFields: any = {};
    if (status_payment) updateFields.status_payment = status_payment;
    if (detail_payment) {
      updateFields.detail_payment =
        typeof detail_payment === 'string'
          ? JSON.parse(detail_payment)
          : detail_payment;
    }

    const { error } = await supabase
      .from('trx_membership')
      .update(updateFields)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If payment status becomes Success, we can optionally activate their membership!
    // Let's do that for the ultimate experience: if status_payment === 'Success', we find the user's transaction details to see if there is a plan duration, and set users.membership = 'Yes' and set start_membership & end_membership!
    if (status_payment === 'Success') {
      // 1. Get the transaction details
      const { data: trx } = await supabase
        .from('trx_membership')
        .select('id_user, detail_payment')
        .eq('id', id)
        .maybeSingle();
      
      if (trx) {
        let details: any = {};
        try {
          details = typeof trx.detail_payment === 'string'
            ? JSON.parse(trx.detail_payment)
            : trx.detail_payment;
        } catch (e) {}

        const planId = details?.plan_id ? parseInt(details.plan_id) : null;
        const duration = details?.duration_days ? parseInt(details.duration_days) : 30; // Default 30 days
        
        const now = new Date();
        const end = new Date();
        end.setDate(now.getDate() + duration);

        await supabase
          .from('users')
          .update({
            membership: 'Yes',
            id_membership_plan: planId,
            start_membership: now.toISOString(),
            end_membership: end.toISOString()
          })
          .eq('id', trx.id_user);
      }
    }

    return NextResponse.json({ success: true, message: 'Status pembayaran berhasil diperbarui.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID transaksi wajib diisi.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('trx_membership')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
