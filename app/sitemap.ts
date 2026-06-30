import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Automatically get base URL from request headers
  const headersList = await headers();
  const host = headersList.get('host') || 'seevent.id';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  // 1. Static Routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/reset`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ];

  // 2. Dynamic Event Detail Routes (from Supabase 'event')
  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: events } = await supabase
      .from('event')
      .select('id, update_at')
      .eq('status', 'Publish')
      .order('update_at', { ascending: false });

    if (events) {
      eventRoutes = events.map((event) => ({
        url: `${baseUrl}/event/detail/${event.id}`,
        lastModified: new Date(event.update_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (e) {
    console.error('Failed to load events for sitemap:', e);
  }

  // 3. Dynamic Rekomendasi Event Routes (from Supabase 'rekomendasi_event')
  let recommendationRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: recs } = await supabase
      .from('rekomendasi_event')
      .select('slug, update_at')
      .order('update_at', { ascending: false });

    if (recs) {
      recommendationRoutes = recs.map((rec) => ({
        url: `${baseUrl}/event/rekomendasi/${rec.slug}`,
        lastModified: new Date(rec.update_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (e) {
    console.error('Failed to load recommendations for sitemap:', e);
  }

  return [...staticRoutes, ...eventRoutes, ...recommendationRoutes];
}
