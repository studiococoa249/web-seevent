import { Metadata } from 'next';
import ResetClient from './ResetClient';

export const metadata: Metadata = {
  title: 'Reset Kata Sandi | Seevent',
  description: 'Lupa kata sandi akun Seevent Anda? Masukkan alamat email Anda untuk menerima tautan pemulihan sandi.',
  alternates: {
    canonical: 'https://seevent.id/auth/reset',
  },
  openGraph: {
    title: 'Reset Kata Sandi | Seevent',
    description: 'Lupa kata sandi akun Seevent Anda? Masukkan alamat email Anda untuk menerima tautan pemulihan sandi.',
    url: 'https://seevent.id/auth/reset',
  }
};

export default function ResetPage() {
  return <ResetClient />;
}
