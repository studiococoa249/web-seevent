import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .from('rekomendasi_event')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: 'Rekomendasi event tidak ditemukan.' }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from('rekomendasi_event')
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
    const { name, slug, desc, banner_imagekit_url, detail_event } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nama dan Slug wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rekomendasi_event')
      .insert({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        desc: desc ? desc.trim() : null,
        banner_imagekit_url: banner_imagekit_url ? banner_imagekit_url.trim() : null,
        detail_event: detail_event || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Rekomendasi event berhasil ditambahkan.' });
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
    const { id, name, slug, desc, banner_imagekit_url, detail_event } = body;

    if (!id || !name || !slug) {
      return NextResponse.json(
        { error: 'ID, Nama, dan Slug wajib diisi.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rekomendasi_event')
      .update({
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        desc: desc ? desc.trim() : null,
        banner_imagekit_url: banner_imagekit_url ? banner_imagekit_url.trim() : null,
        detail_event: detail_event || null,
        update_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Rekomendasi event berhasil diperbarui.' });
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
      .from('rekomendasi_event')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Rekomendasi event berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
