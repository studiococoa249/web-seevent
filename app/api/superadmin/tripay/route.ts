import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get the first configuration row
    const { data: config, error } = await supabase
      .from('tripay_config')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(config || null);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { api_key, merchant, private_key, mode } = body;

    if (!api_key || !merchant || !private_key || !mode) {
      return NextResponse.json(
        { error: 'Semua kolom konfigurasi wajib diisi.' },
        { status: 400 }
      );
    }

    // Check if configuration already exists
    const { data: existingConfig } = await supabase
      .from('tripay_config')
      .select('id')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    let result;
    if (existingConfig) {
      // Update
      const { data, error } = await supabase
        .from('tripay_config')
        .update({
          api_key: api_key.trim(),
          merchant: merchant.trim(),
          private_key: private_key.trim(),
          mode,
        })
        .eq('id', existingConfig.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('tripay_config')
        .insert({
          api_key: api_key.trim(),
          merchant: merchant.trim(),
          private_key: private_key.trim(),
          mode,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, config: result, message: 'Konfigurasi Tripay berhasil disimpan.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
