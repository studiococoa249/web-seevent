import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const tables = [
    'membership_plan',
    'users',
    'profile',
    'trx_membership',
    'tripay_config',
    'category_event',
  ];

  const results: Record<
    string,
    { exists: boolean; count?: number; error?: string }
  > = {};

  for (const table of tables) {
    // We use head: true to check existence and count without actually fetching the rows
    const { error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      results[table] = {
        exists: false,
        error: `${error.code}: ${error.message}`,
      };
    } else {
      results[table] = {
        exists: true,
        count: count ?? 0,
      };
    }
  }

  const allSucceeded = Object.values(results).every((r) => r.exists);
  const status = allSucceeded ? 200 : 200; // Return 200 so they can read the JSON payload even if some tables are missing

  return NextResponse.json(
    {
      success: allSucceeded,
      message: allSucceeded
        ? 'Successfully connected to Supabase and verified all 6 tables!'
        : 'Connected to Supabase, but some tables were not found or failed to query. Make sure you ran schema.sql in the Supabase SQL Editor.',
      timestamp: new Date().toISOString(),
      tables: results,
    },
    { status }
  );
}
export const dynamic = 'force-dynamic';
