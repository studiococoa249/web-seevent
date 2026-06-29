import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  // #region debug-point A:upload-api-start
  const _log = async (msg: string, data: any = {}) => {
    try {
      await fetch("http://127.0.0.1:7777/event", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "profile-update-not-saving",
          runId: "pre",
          hypothesisId: "A",
          location: "app/api/superadmin/upload/route.ts:5",
          msg: "[DEBUG] " + msg,
          data: data,
          ts: Date.now()
        })
      });
    } catch {}
  };
  // #endregion
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'settings';
    await _log("Upload API called", { folder, fileName: file?.name, fileSize: file?.size });

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 400 });
    }

    // 1. Fetch Imagekit configuration from database
    await _log("Fetching ImageKit config");
    const { data: config, error: configError } = await supabase
      .from('imagekit_api')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (configError) {
      await _log("Config fetch error", { configError });
      return NextResponse.json({ error: 'Gagal membaca konfigurasi Imagekit: ' + configError.message }, { status: 500 });
    }

    if (!config || !config.secret_key || !config.endpoint_url) {
      await _log("Config missing or invalid", { config });
      return NextResponse.json(
        { error: 'Kredensial Imagekit API belum dikonfigurasi di dashboard.' },
        { status: 400 }
      );
    }
    await _log("Got ImageKit config", { hasSecretKey: !!config.secret_key, hasEndpointUrl: !!config.endpoint_url });

    // 2. Prepare file payload for Imagekit
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ikFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    ikFormData.append('file', blob, file.name);
    ikFormData.append('fileName', file.name);
    ikFormData.append('folder', folder);

    // 3. Perform server-to-server request to Imagekit API
    // Authorization header uses Basic auth: base64(private_key + ":")
    const authHeader = 'Basic ' + Buffer.from(config.secret_key + ':').toString('base64');
    await _log("Uploading to ImageKit");
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: ikFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = errText;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.message || errText;
      } catch (e) {}
      await _log("ImageKit upload failed", { status: response.status, errText });
      throw new Error(errMsg || 'Gagal mengunggah file ke Imagekit.');
    }

    const result = await response.json();
    await _log("ImageKit upload succeeded", { result });

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    });
  } catch (error: any) {
    await _log("Upload API exception caught", { error });
    console.error('Imagekit upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Terjadi kesalahan saat memproses unggahan.' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
