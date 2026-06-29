import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/session';

export async function GET() {
  // #region debug-point C:auth-me-start
  const _log = async (msg: string, data: any = {}) => {
    try {
      await fetch("http://127.0.0.1:7777/event", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "profile-update-not-saving",
          runId: "pre",
          hypothesisId: "C",
          location: "app/api/auth/me/route.ts:5",
          msg: "[DEBUG] " + msg,
          data: data,
          ts: Date.now()
        })
      });
    } catch {}
  };
  await _log("Auth/me called");
  // #endregion
  
  try {
    const session = await getSession();

    if (!session) {
      await _log("No session found");
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }
    await _log("Got session", { userId: session.userId });

    // Query rich user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(
        'id, nama_lengkap, email, level, membership, id_membership_plan, start_membership, end_membership, status'
      )
      .eq('id', session.userId)
      .maybeSingle();

    if (userError || !user) {
      await _log("User not found or error", { userError });
      return NextResponse.json(
        { authenticated: false, error: 'User data not found in database.' },
        { status: 404 }
      );
    }
    await _log("Got user data", { user });

    // Query user profile details
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('*')
      .eq('id_users', session.userId)
      .maybeSingle();
    await _log("Got profile data", { profile, profileError });

    return NextResponse.json({
      authenticated: true,
      user: {
        ...user,
        profile: profile || null,
      },
    });
  } catch (error: any) {
    try {
      await fetch("http://127.0.0.1:7777/event", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "profile-update-not-saving",
          runId: "pre",
          hypothesisId: "C",
          location: "app/api/auth/me/route.ts:72",
          msg: "[DEBUG] Auth/me exception caught",
          data: { error },
          ts: Date.now()
        })
      });
    } catch {}
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
