import { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru | Seevent',
  description: 'Buat akun Seevent baru sekarang dan mulailah membuat ajakan event serta berinteraksi dengan komunitas sefrekuensi.',
  alternates: {
    canonical: 'https://seevent.id/auth/register',
  },
  openGraph: {
    title: 'Daftar Akun Baru | Seevent',
    description: 'Buat akun Seevent baru sekarang dan mulailah membuat ajakan event serta berinteraksi dengan komunitas sefrekuensi.',
    url: 'https://seevent.id/auth/register',
  }
};

export default function RegisterPage() {
  return <RegisterClient />;
}
