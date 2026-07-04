import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const preferredRegion = 'syd1';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const hasServerSupabase = Boolean(supabaseUrl && supabaseServiceRoleKey);

export async function POST(request) {
  try {
    if (!hasServerSupabase) {
      return NextResponse.json(
        { error: 'Server database configuration is missing. Please contact administrator.' },
        { status: 500 }
      );
    }

    const payload = await request.json();
    const name = String(payload?.name || '').trim();
    const email = String(payload?.email || '').trim();
    const whatsapp = String(payload?.whatsapp || '').trim();

    if (!name || !email || !whatsapp) {
      return NextResponse.json(
        { error: 'Name, email, and phone/mobile are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const insertPayload = {
      user_id: null,
      course_id: payload?.course_id ?? null,
      course_title: payload?.course_title || 'General Free Trial',
      name,
      email,
      whatsapp,
      timezone: payload?.timezone || 'Asia/Karachi',
      country: payload?.country || 'Not specified',
      message: payload?.message || '',
      status: 'pending',
    };

    const { data, error } = await supabaseAdmin
      .from('trial_requests')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      console.error('Trial request insert failed:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to submit trial request.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Trial request API error:', error);
    return NextResponse.json({ error: 'Failed to submit trial request.' }, { status: 500 });
  }
}
