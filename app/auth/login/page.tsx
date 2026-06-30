import { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Masuk Akun | Seevent',
  description: 'Masuk ke akun Seevent Anda untuk mulai menjelajah event dan mencari teman baru sefrekuensi.',
  alternates: {
    canonical: 'https://seevent.id/auth/login',
  },
  openGraph: {
    title: 'Masuk Akun | Seevent',
    description: 'Masuk ke akun Seevent Anda untuk mulai menjelajah event dan mencari teman baru sefrekuensi.',
    url: 'https://seevent.id/auth/login',
  }
};

export default function LoginPage() {
  return <LoginClient />;
}