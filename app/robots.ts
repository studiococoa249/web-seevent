import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://seevent.id';

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
