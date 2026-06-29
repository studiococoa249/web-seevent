import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch details of a single event
      const { data, error } = await supabase
        .from('event')
        .select('*, category_event(name), users(nama_lengkap, email)')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: 'Event tidak ditemukan.' }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      // Fetch list of all events
      const { data, error } = await supabase
        .from('event')
        .select('*, category_event(name), users(nama_lengkap)')
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      slug,
      title_seo,
      desc_seo,
      location,
      desc_full,
      event_date,
      max_participants,
      status,
      image_url_imagekit,
      id_category_event,
      id_users,
      pesan_ajakan,
      patungan,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Event wajib diisi.' }, { status: 400 });
    }

    const updatePayload: any = {};
    if (title !== undefined) updatePayload.title = title;
    if (slug !== undefined) updatePayload.slug = slug;
    if (title_seo !== undefined) updatePayload.title_seo = title_seo;
    if (desc_seo !== undefined) updatePayload.desc_seo = desc_seo;
    if (location !== undefined) updatePayload.location = location;
    if (desc_full !== undefined) updatePayload.desc_full = desc_full;
    if (event_date !== undefined) updatePayload.event_date = event_date;
    if (max_participants !== undefined) updatePayload.max_participants = parseInt(max_participants || '0');
    if (status !== undefined) updatePayload.status = status;
    if (image_url_imagekit !== undefined) updatePayload.image_url_imagekit = image_url_imagekit;
    if (id_category_event !== undefined) updatePayload.id_category_event = id_category_event ? parseInt(id_category_event) : null;
    if (id_users !== undefined) updatePayload.id_users = id_users;
    if (pesan_ajakan !== undefined) updatePayload.pesan_ajakan = pesan_ajakan;
    if (patungan !== undefined) updatePayload.patungan = patungan ? parseFloat(patungan) : null;

    const { data, error } = await supabase
      .from('event')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Event berhasil diperbarui.' });
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
      return NextResponse.json({ error: 'ID Event wajib diisi.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('event')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Event berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
