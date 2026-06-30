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
    const { id_event } = body;

    if (!id_event) {
      return NextResponse.json(
        { error: 'ID Event wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Fetch event detail
    const { data: event, error: eventError } = await supabase
      .from('event')
      .select('id, title, max_participants, status, id_users')
      .eq('id', id_event)
      .maybeSingle();

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: 'Event tidak ditemukan.' }, { status: 404 });
    }

    if (event.status !== 'Publish') {
      return NextResponse.json(
        { error: 'Event ini tidak dapat diikuti karena statusnya bukan Publish.' },
        { status: 400 }
      );
    }

    // 2. Check if the user is the creator (creator is already confirmed during creation)
    if (event.id_users === session.userId) {
      return NextResponse.json(
        { error: 'Anda adalah penyelenggara event ini.' },
        { status: 400 }
      );
    }

    // 3. Check for existing registration
    const { data: existing, error: checkError } = await supabase
      .from('event_participants')
      .select('status')
      .eq('id_event', id_event)
      .eq('id_users', session.userId)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      if (existing.status === 'Confirmed') {
        return NextResponse.json(
          { error: 'Anda sudah bergabung dalam event ini.' },
          { status: 400 }
        );
      }
      if (existing.status === 'Pending') {
        return NextResponse.json(
          { error: 'Anda sudah mengirim permintaan bergabung. Silakan tunggu persetujuan host.' },
          { status: 400 }
        );
      }
      if (existing.status === 'Declined') {
        // If previously declined, let's allow them to submit a new pending request
        const { error: deleteError } = await supabase
          .from('event_participants')
          .delete()
          .eq('id_event', id_event)
          .eq('id_users', session.userId);
        
        if (deleteError) {
          return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }
      }
    }

    // 4. Validate quota capacity
    if (event.max_participants > 0) {
      const { count, error: countError } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('id_event', id_event)
        .eq('status', 'Confirmed');

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      if (count !== null && count >= event.max_participants) {
        return NextResponse.json(
          { error: 'Kuota untuk event ini sudah penuh.' },
          { status: 400 }
        );
      }
    }

    // 5. Insert new participant
    const { error: insertError } = await supabase
      .from('event_participants')
      .insert({
        id_event,
        id_users: session.userId,
        status: 'Pending', // default pending, awaiting host approval
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Permintaan bergabung berhasil dikirim! Silakan tunggu konfirmasi dari host.',
    });
  } catch (error: any) {
    console.error('Join event API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan sistem saat mencoba bergabung.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Sesi berakhir atau Anda belum login. Silakan masuk terlebih dahulu.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body; // id = event_participants.id, status = 'Confirmed' | 'Declined'

    if (!id || !status || (status !== 'Confirmed' && status !== 'Declined')) {
      return NextResponse.json(
        { error: 'ID pendaftaran dan status baru (Confirmed/Declined) wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Fetch participant request and host ID
    const { data: participant, error: fetchError } = await supabase
      .from('event_participants')
      .select('id, id_event, status, event(id_users, max_participants, title)')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!participant) {
      return NextResponse.json({ error: 'Data pendaftaran tidak ditemukan.' }, { status: 404 });
    }

    const eventInfo: any = participant.event;
    if (!eventInfo) {
      return NextResponse.json({ error: 'Detail event tidak ditemukan.' }, { status: 404 });
    }

    // 2. Verify logged in user is the host
    if (eventInfo.id_users !== session.userId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki hak akses untuk menyetujui pendaftaran ini.' },
        { status: 403 }
      );
    }

    // 3. If confirming, check quota limits
    if (status === 'Confirmed') {
      const maxParticipants = eventInfo.max_participants || 0;
      if (maxParticipants > 0) {
        const { count, error: countError } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('id_event', participant.id_event)
          .eq('status', 'Confirmed');

        if (countError) {
          return NextResponse.json({ error: countError.message }, { status: 500 });
        }

        if (count !== null && count >= maxParticipants) {
          return NextResponse.json(
            { error: `Kuota untuk event "${eventInfo.title}" sudah penuh.` },
            { status: 400 }
          );
        }
      }
    }

    // 4. Update status
    const { error: updateError } = await supabase
      .from('event_participants')
      .update({ status, update_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const actionText = status === 'Confirmed' ? 'disetujui' : 'ditolak';
    return NextResponse.json({
      success: true,
      message: `Permintaan bergabung berhasil ${actionText}!`,
    });
  } catch (error: any) {
    console.error('Accept/Decline participant API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan sistem saat memproses pendaftaran.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
