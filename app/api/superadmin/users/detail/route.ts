import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID user wajib diisi.' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select(
        'id, nama_lengkap, email, level, status, membership, id_membership_plan, start_membership, end_membership'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(user);
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
    const {
      id,
      nama_lengkap,
      email,
      level,
      status,
      membership,
      id_membership_plan,
      start_membership,
      end_membership,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID user wajib diisi.' }, { status: 400 });
    }

    const updateFields: any = {
      nama_lengkap: nama_lengkap?.trim(),
      email: email?.toLowerCase().trim(),
      level,
      status,
      membership,
      id_membership_plan: id_membership_plan || null,
      start_membership: start_membership || null,
      end_membership: end_membership || null,
    };

    const { error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Detail user berhasil diperbarui.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
