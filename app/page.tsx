import HomeClient from './HomeClient';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'se event';
  let ogImage = '';

  try {
    const { data: setting } = await supabase
      .from('setting')
      .select('site_name, logo_url_imagekit')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (setting) {
      if (setting.site_name) {
        siteName = setting.site_name;
      }
      if (setting.logo_url_imagekit) {
        ogImage = setting.logo_url_imagekit;
      }
    }
  } catch (e) {
    console.error('Failed to load SEO metadata settings:', e);
  }

  const title = `Cari Teman Event Yang Se-Frekuensi | ${siteName}`;
  const description = 'Temukan partner atau grup sefrekuensi untuk event favoritmu. Dari nonton konser, olahraga, hingga pameran seni.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: siteName,
            },
          ]
        : [],
    },
  };
}

export default function Home() {
  return <HomeClient />;
}