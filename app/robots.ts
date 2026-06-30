import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Automatically get base URL from request headers
  const headersList = await headers();
  const host = headersList.get('host') || 'seevent.id';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/superadmin/',
        '/superadmin/*',
        '/api/',
        '/api/*',
        '/user/profile/update/',
        '/user/plan/checkout',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
