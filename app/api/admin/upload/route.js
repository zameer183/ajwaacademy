import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ACTIVE_SUPABASE_URL = 'https://vdzwhurilkucadjgcshv.supabase.co';
const ACTIVE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkendodXJpbGt1Y2Fkamdjc2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzNDM3MSwiZXhwIjoyMDkxMTEwMzcxfQ.3kdnvWjK3RS6urt-ns3KHyrU-0GkTeTCJs3op6g3Rzs';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const isRestrictedInstance = Boolean(
  rawUrl && (rawUrl.includes('cqcitgazqwajbdyxqhtl') || rawUrl.includes('xydbeeyzsuqsdrygndhe') || rawUrl.includes('aawqtepmkpsiynxxokxn'))
);

const supabaseUrl = (!rawUrl || isRestrictedInstance) ? ACTIVE_SUPABASE_URL : rawUrl;
const supabaseKey = (!rawKey || isRestrictedInstance) ? ACTIVE_SERVICE_ROLE_KEY : rawKey;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const BUCKET_NAME = 'media';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') || 'uploads').toString().replace(/^\/+|\/+$/g, '');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || 'image.jpg';
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const filePath = `${folder}/${fileName}`;

    const contentType = file.type || 'image/jpeg';

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      path: filePath,
      publicUrl: data.publicUrl,
    });
  } catch (err) {
    console.error('API Upload error:', err);
    return NextResponse.json({ error: err.message || 'Server upload failed' }, { status: 500 });
  }
}
