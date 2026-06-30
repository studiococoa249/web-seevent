import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .from('mongodb_connection')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: 'Koneksi MongoDB tidak ditemukan.' }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from('mongodb_connection')
        .select('*')
        .order('create_at', { ascending: false });

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
    const { name, status, mongodb_config } = body;

    if (!name || !status || !mongodb_config) {
      return NextResponse.json(
        { error: 'Nama, Status, dan Konfigurasi wajib diisi.' },
        { status: 400 }
      );
    }

    if (status !== 'Active' && status !== 'Not-Active') {
      return NextResponse.json(
        { error: 'Status harus bernilai Active atau Not-Active.' },
        { status: 400 }
      );
    }

    // Try parsing config if sent as string, or validate if it's already an object
    let parsedConfig = mongodb_config;
    if (typeof mongodb_config === 'string') {
      try {
        parsedConfig = JSON.parse(mongodb_config);
      } catch (e) {
        return NextResponse.json({ error: 'Format konfigurasi JSON tidak valid.' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('mongodb_connection')
      .insert({
        name: name.trim(),
        status,
        mongodb_config: parsedConfig,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Koneksi MongoDB berhasil ditambahkan.' });
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
    const { id, name, status, mongodb_config } = body;

    if (!id || !name || !status || !mongodb_config) {
      return NextResponse.json(
        { error: 'ID, Nama, Status, dan Konfigurasi wajib diisi.' },
        { status: 400 }
      );
    }

    if (status !== 'Active' && status !== 'Not-Active') {
      return NextResponse.json(
        { error: 'Status harus bernilai Active atau Not-Active.' },
        { status: 400 }
      );
    }

    let parsedConfig = mongodb_config;
    if (typeof mongodb_config === 'string') {
      try {
        parsedConfig = JSON.parse(mongodb_config);
      } catch (e) {
        return NextResponse.json({ error: 'Format konfigurasi JSON tidak valid.' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('mongodb_connection')
      .update({
        name: name.trim(),
        status,
        mongodb_config: parsedConfig,
        update_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Koneksi MongoDB berhasil diperbarui.' });
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
      return NextResponse.json({ error: 'ID koneksi wajib diisi.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('mongodb_connection')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Koneksi MongoDB berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
