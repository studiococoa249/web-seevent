import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import EventAcceptClient from './EventAcceptClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  let title = 'Kelola Pendaftaran | Seevent';
  let description = 'Kelola status pendaftaran peserta dan persetujuan bergabung untuk event Anda.';

  try {
    const { data: event } = await supabase
      .from('event')
      .select('title')
      .eq('id', id)
      .maybeSingle();

    if (event) {
      title = `Kelola Peserta: ${event.title} | Seevent`;
    }
  } catch (e) {
    console.error('Failed to load SEO metadata for accept participant:', e);
  }

  const canonical = `https://seevent.id/event/accept/${id}`;

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

export default async function EventAcceptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventAcceptClient id={id} />;
}
