import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import EventDetailClient from './EventDetailClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  let title = 'Detail Ajakan Event | Seevent';
  let description = 'Temukan partner sefrekuensi untuk menghadiri event favoritmu.';
  let imageUrl = '';

  try {
    const { data: event } = await supabase
      .from('event')
      .select('title, pesan_ajakan, desc_full, image_url_imagekit')
      .eq('id', id)
      .maybeSingle();

    if (event) {
      title = `${event.title} | Seevent`;
      description = event.pesan_ajakan || event.desc_full || description;
      if (event.image_url_imagekit) {
        imageUrl = event.image_url_imagekit;
      }
    }
  } catch (e) {
    console.error('Failed to load SEO metadata for event detail:', e);
  }

  const canonical = `https://seevent.id/event/detail/${id}`;

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
      images: imageUrl ? [{ url: imageUrl, alt: title }] : [],
    }
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailClient id={id} />;
}
