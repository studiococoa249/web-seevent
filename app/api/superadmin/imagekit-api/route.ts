import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Get single configuration details
      const { data, error } = await supabase
        .from('imagekit_api')
        .select('*')
        .eq('id', parseInt(id))
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: 'Data API Imagekit tidak ditemukan.' }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      // Get list of configurations
      const { data, error } = await supabase
        .from('imagekit_api')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }
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
    const { name, endpoint_url, apikey, secret_key } = body;

    if (!name || !endpoint_url || !apikey || !secret_key) {
      return NextResponse.json(
        { error: 'Semua kolom formulir wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('imagekit_api')
      .insert({
        name: name.trim(),
        endpoint_url: endpoint_url.trim(),
        apikey: apikey.trim(),
        secret_key: secret_key.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Kredensial Imagekit API berhasil dibuat.' });
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
    const { id, name, endpoint_url, apikey, secret_key } = body;

    if (!id || !name || !endpoint_url || !apikey || !secret_key) {
      return NextResponse.json(
        { error: 'Semua kolom formulir wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('imagekit_api')
      .update({
        name: name.trim(),
        endpoint_url: endpoint_url.trim(),
        apikey: apikey.trim(),
        secret_key: secret_key.trim(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Kredensial Imagekit API berhasil diperbarui.' });
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
      return NextResponse.json({ error: 'ID wajib diisi.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('imagekit_api')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Kredensial Imagekit API berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
