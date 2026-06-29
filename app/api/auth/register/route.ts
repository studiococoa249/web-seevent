import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { setSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Kata sandi minimal harus 6 karakter.' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { error: `Database error: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.' },
        { status: 400 }
      );
    }

    // 3. Hash the password
    const hashedPassword = hashPassword(password);

    // 4. Insert new user into public.users
    const { data: newUser, error: insertUserError } = await supabase
      .from('users')
      .insert({
        nama_lengkap: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        membership: 'No',
        status: 'Active', // Let the user be immediately Active upon registration
        level: 'Member',  // Default registered users to 'Member'
      })
      .select('id, nama_lengkap, email, level')
      .single();

    if (insertUserError || !newUser) {
      return NextResponse.json(
        { error: `Gagal membuat akun: ${insertUserError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // 5. Insert default profile for user into public.profile
    const { error: insertProfileError } = await supabase
      .from('profile')
      .insert({
        id_users: newUser.id,
        email: newUser.email,
      });

    if (insertProfileError) {
      console.error('Failed to create profile for user:', insertProfileError);
      // We don't rollback user creation, but we log the error. We can optionally return it or proceed.
      // Since profile is important, we proceed but log it.
    }

    // 6. Automatically log the user in by setting the session cookie
    await setSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.nama_lengkap,
      level: newUser.level as 'Admin' | 'Member',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil!',
        user: {
          id: newUser.id,
          name: newUser.nama_lengkap,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan pada server saat registrasi.' },
      { status: 500 }
    );
  }
}
