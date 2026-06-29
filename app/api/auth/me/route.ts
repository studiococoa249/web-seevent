import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    // Query rich user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(
        'id, nama_lengkap, email, level, membership, id_membership_plan, start_membership, end_membership, status'
      )
      .eq('id', session.userId)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json(
        { authenticated: false, error: 'User data not found in database.' },
        { status: 404 }
      );
    }

    // Query user profile details
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('*')
      .eq('id_users', session.userId)
      .maybeSingle();

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        profile: profile || null,
      },
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
