import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: plans, error } = await supabase
      .from('membership_plan')
      .select('*')
      .order('create_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name_plan, duration, total_post_get, price } = body;

    if (!name_plan || duration === undefined || total_post_get === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'Semua field (Nama, Durasi, Total Post, Harga) wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('membership_plan')
      .insert({
        name_plan: name_plan.trim(),
        duration: parseInt(duration),
        total_post_get: parseInt(total_post_get),
        price: parseFloat(price)
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan: data });
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
    const { id, name_plan, duration, total_post_get, price } = body;

    if (!id || !name_plan || duration === undefined || total_post_get === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'ID dan semua field wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('membership_plan')
      .update({
        name_plan: name_plan.trim(),
        duration: parseInt(duration),
        total_post_get: parseInt(total_post_get),
        price: parseFloat(price)
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan: data });
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
      return NextResponse.json({ error: 'ID plan wajib diisi.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('membership_plan')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Plan berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
