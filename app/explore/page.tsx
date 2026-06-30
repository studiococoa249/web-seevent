import { Metadata } from 'next';
import ExploreClient from './ExploreClient';

export const metadata: Metadata = {
  title: 'Eksplor Event & Teman Baru | Seevent',
  description: 'Temukan berbagai ajakan event menarik di sekitarmu. Mulai dari konser musik, nonton bioskop, olahraga bareng, hingga trip liburan seru.',
  alternates: {
    canonical: 'https://seevent.id/explore',
  },
  openGraph: {
    title: 'Eksplor Event & Teman Baru | Seevent',
    description: 'Temukan berbagai ajakan event menarik di sekitarmu. Mulai dari konser musik, nonton bioskop, olahraga bareng, hingga trip liburan seru.',
    url: 'https://seevent.id/explore',
  }
};

export default function ExplorePage() {
  return <ExploreClient />;
}