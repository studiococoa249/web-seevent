import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import EventJoinClient from './EventJoinClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  let title = 'Gabung Event | Seevent';
  let description = 'Kirim permintaan bergabung ke event ini untuk hadir bersama teman sefrekuensi.';

  try {
    const { data: event } = await supabase
      .from('event')
      .select('title')
      .eq('id', id)
      .maybeSingle();

    if (event) {
      title = `Gabung: ${event.title} | Seevent`;
    }
  } catch (e) {
    console.error('Failed to load SEO metadata for event join:', e);
  }

  const canonical = `https://seevent.id/event/join/${id}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
    }
  };
}

export default async function EventJoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventJoinClient id={id} />;
}
