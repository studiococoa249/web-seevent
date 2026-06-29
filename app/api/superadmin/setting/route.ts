import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Fetch site settings
    const { data: setting, error: settingError } = await supabase
      .from('setting')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (settingError) {
      return NextResponse.json({ error: settingError.message }, { status: 500 });
    }

    // 2. Fetch Imagekit configuration
    const { data: imagekit, error: imagekitError } = await supabase
      .from('imagekit_api')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (imagekitError) {
      return NextResponse.json({ error: imagekitError.message }, { status: 500 });
    }

    return NextResponse.json({
      setting: setting || null,
      imagekit: imagekit || null,
    });
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
    const { setting, imagekit } = body;

    if (!setting) {
      return NextResponse.json({ error: 'Data setting wajib dikirim.' }, { status: 400 });
    }

    // 1. Save Site Settings
    const { data: existingSetting } = await supabase
      .from('setting')
      .select('id')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    const settingPayload = {
      site_name: setting.site_name || 'se-event',
      favicon_url_imagekit: setting.favicon_url_imagekit || null,
      logo_url_imagekit: setting.logo_url_imagekit || null,
      email: setting.email || null,
      instagram_url: setting.instagram_url || null,
      facebook_url: setting.facebook_url || null,
      max_post_free_membership: parseInt(setting.max_post_free_membership || '0'),
      head_code: setting.head_code || null,
      footer_code: setting.footer_code || null,
    };

    let savedSetting;
    if (existingSetting) {
      const { data, error } = await supabase
        .from('setting')
        .update(settingPayload)
        .eq('id', existingSetting.id)
        .select()
        .single();
      if (error) throw error;
      savedSetting = data;
    } else {
      const { data, error } = await supabase
        .from('setting')
        .insert(settingPayload)
        .select()
        .single();
      if (error) throw error;
      savedSetting = data;
    }

    // 2. Save Imagekit Settings (if supplied)
    let savedImagekit = null;
    if (imagekit) {
      const { data: existingImagekit } = await supabase
        .from('imagekit_api')
        .select('id')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      const imagekitPayload = {
        name: imagekit.name || 'Default Imagekit',
        endpoint_url: imagekit.endpoint_url || '',
        apikey: imagekit.apikey || '',
        secret_key: imagekit.secret_key || '',
      };

      // Only save if at least key fields are supplied, otherwise skip or update
      if (imagekitPayload.endpoint_url || imagekitPayload.apikey || imagekitPayload.secret_key) {
        if (existingImagekit) {
          const { data, error } = await supabase
            .from('imagekit_api')
            .update(imagekitPayload)
            .eq('id', existingImagekit.id)
            .select()
            .single();
          if (error) throw error;
          savedImagekit = data;
        } else {
          const { data, error } = await supabase
            .from('imagekit_api')
            .insert(imagekitPayload)
            .select()
            .single();
          if (error) throw error;
          savedImagekit = data;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pengaturan sistem berhasil disimpan.',
      setting: savedSetting,
      imagekit: savedImagekit,
    });
  } catch (error: any) {
    console.error('Settings save error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
