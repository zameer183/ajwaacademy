import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const preferredRegion = 'syd1';

const ACTIVE_SUPABASE_URL = 'https://vdzwhurilkucadjgcshv.supabase.co';
const ACTIVE_SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkendodXJpbGt1Y2Fkamdjc2h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTUzNDM3MSwiZXhwIjoyMDkxMTEwMzcxfQ.3kdnvWjK3RS6urt-ns3KHyrU-0GkTeTCJs3op6g3Rzs';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const isRestrictedInstance = Boolean(
  rawUrl && (rawUrl.includes('cqcitgazqwajbdyxqhtl') || rawUrl.includes('xydbeeyzsuqsdrygndhe') || rawUrl.includes('aawqtepmkpsiynxxokxn'))
);

const supabaseUrl = (!rawUrl || isRestrictedInstance) ? ACTIVE_SUPABASE_URL : rawUrl;
const supabaseServiceRoleKey = (!rawServiceKey || isRestrictedInstance) ? ACTIVE_SUPABASE_SERVICE_ROLE_KEY : rawServiceKey;

const hasServerSupabase = Boolean(supabaseUrl && supabaseServiceRoleKey);

function saveToFallback(lead) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'fallback-data', 'trial-requests.json');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let list = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      list = JSON.parse(content);
      if (!Array.isArray(list)) list = [];
    }

    list = [lead, ...list];
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving trial to fallback file:', err);
    return false;
  }
}

export async function POST(request) {
  try {
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

    const supabasePayload = {
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
      created_at: new Date().toISOString(),
    };

    let savedData = { ...supabasePayload, id: Date.now() };
    let supabaseSuccess = false;

    if (hasServerSupabase) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data, error } = await supabaseAdmin
          .from('trial_requests')
          .insert(supabasePayload)
          .select('*')
          .single();

        if (!error && data) {
          supabaseSuccess = true;
          savedData = data;
        } else if (error) {
          console.warn('Supabase trial request insert error, falling back to local storage:', error.message);
        }
      } catch (dbErr) {
        console.warn('Supabase trial request threw error, falling back to local storage:', dbErr.message);
      }
    }

    // Always mirror to local fallback storage so the lead is never lost and visible in Admin
    saveToFallback(savedData);

    return NextResponse.json({ success: true, data: savedData, fallback: !supabaseSuccess }, { status: 200 });
  } catch (error) {
    console.error('Trial request API error:', error);
    return NextResponse.json({ error: 'Failed to submit trial request.' }, { status: 500 });
  }
}
