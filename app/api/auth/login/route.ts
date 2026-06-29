import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/auth';
import { setSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Query user by email
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('id, nama_lengkap, email, password, status, level')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (queryError) {
      return NextResponse.json(
        { error: `Database error: ${queryError.message}` },
        { status: 500 }
      );
    }

    // 3. Verify user existence
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah.' },
        { status: 400 }
      );
    }

    // 4. Verify password
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email atau kata sandi salah.' },
        { status: 400 }
      );
    }

    // 5. Check user status
    if (user.status === 'Suspend') {
      return NextResponse.json(
        { error: 'Akun Anda sedang ditangguhkan. Silakan hubungi dukungan pelanggan.' },
        { status: 403 }
      );
    }

    if (user.status === 'Not-Active') {
      return NextResponse.json(
        { error: 'Akun Anda belum aktif. Silakan hubungi admin.' },
        { status: 403 }
      );
    }

    // 6. Set encrypted session cookie
    await setSession({
      userId: user.id,
      email: user.email,
      name: user.nama_lengkap,
      level: user.level as 'Admin' | 'Member',
    });

    return NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: {
        id: user.id,
        name: user.nama_lengkap,
        email: user.email,
        level: user.level,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}
