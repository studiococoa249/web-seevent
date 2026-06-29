import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Sesi berakhir atau Anda belum login. Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      id_category_event,
      location,
      event_date,
      max_participants,
      status,
      image_url_imagekit,
      pesan_ajakan,
      patungan,
      desc_full,
      title_seo,
      desc_seo,
    } = body;

    // 1. Validation
    if (!title || !location || !event_date) {
      return NextResponse.json(
        { error: 'Nama acara, lokasi, dan tanggal kumpul/acara wajib diisi.' },
        { status: 400 }
      );
    }

    // 2. Generate Base Slug
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) {
      return NextResponse.json(
        { error: 'Nama acara tidak valid untuk menghasilkan tautan ramah (slug).' },
        { status: 400 }
      );
    }

    // 3. Ensure slug is unique
    let slug = baseSlug;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const { data, error: slugCheckError } = await supabase
        .from('event')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (slugCheckError) {
        return NextResponse.json({ error: slugCheckError.message }, { status: 500 });
      }

      if (!data) {
        isUnique = true;
      } else {
        attempts++;
        const randomHex = Math.random().toString(36).substring(2, 6);
        slug = `${baseSlug}-${randomHex}`;
      }
    }

    // 4. Create Event Payload
    const insertPayload: any = {
      id_users: session.userId,
      id_category_event: id_category_event ? parseInt(id_category_event) : null,
      title: title.trim(),
      slug,
      title_seo: (title_seo || title).trim().slice(0, 255),
      desc_seo: desc_seo || (desc_full ? desc_full.slice(0, 150) : pesan_ajakan ? pesan_ajakan.slice(0, 150) : ''),
      location: location.trim(),
      desc_full: desc_full || pesan_ajakan || '',
      event_date: new Date(event_date).toISOString(),
      max_participants: Math.max(0, parseInt(max_participants || '0')),
      status: status || 'Publish', // Members publish directly by default
      image_url_imagekit: image_url_imagekit || null,
      pesan_ajakan: pesan_ajakan || '',
      patungan: patungan ? parseFloat(patungan) : null,
    };

    // 5. Insert to Supabase
    const { data: newEvent, error: insertError } = await supabase
      .from('event')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 6. Automatically register creator as confirmed participant
    const { error: participantError } = await supabase
      .from('event_participants')
      .insert({
        id_event: newEvent.id,
        id_users: session.userId,
        status: 'Confirmed',
      });

    if (participantError) {
      console.error('Failed to auto-join creator to event:', participantError);
      // We don't fail the creation if this fails, but it shouldn't fail
    }

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: 'Ajakan event berhasil dipublikasikan!',
    });
  } catch (error: any) {
    console.error('Event creation API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan sistem saat membuat event.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
