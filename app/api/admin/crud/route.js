import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ACTIVE_SUPABASE_URL = 'https://cqcitgazqwajbdyxqhtl.supabase.co';
const ACTIVE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAyNjg0NywiZXhwIjoyMTA2NjAyODQ3fQ.lWH89WCLiz0iZVg7GFnshv_nyUBvK2wJB2vRLnOCk8g';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const supabaseUrl = (rawUrl && rawUrl === ACTIVE_SUPABASE_URL) ? rawUrl : ACTIVE_SUPABASE_URL;
const supabaseKey = (rawKey && rawUrl === ACTIVE_SUPABASE_URL) ? rawKey : ACTIVE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

export async function GET() {
  try {
    const [coursesRes, blogsRes, trialsRes, libraryRes] = await Promise.all([
      supabaseAdmin.from('courses').select('*').order('id', { ascending: false }),
      supabaseAdmin.from('blog_posts').select('id, title, slug, category, author, read_time, excerpt, image, status, created_at').order('id', { ascending: false }),
      supabaseAdmin.from('trial_requests').select('*').order('id', { ascending: false }),
      supabaseAdmin.from('library_items').select('*').order('id', { ascending: false }),
    ]);

    return NextResponse.json({
      success: true,
      courses: coursesRes.data || [],
      blogs: blogsRes.data || [],
      trialRequests: trialsRes.data || [],
      libraryItems: libraryRes.data || [],
    });
  } catch (err) {
    console.error('Admin GET data error:', err);
    return NextResponse.json({ error: err.message || 'Failed to load admin data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, table, id, data } = body;

    if (action === 'fetch_all') {
      const [coursesRes, blogsRes, trialsRes, libraryRes] = await Promise.all([
        supabaseAdmin.from('courses').select('*').order('id', { ascending: false }),
        supabaseAdmin.from('blog_posts').select('id, title, slug, category, author, read_time, excerpt, image, status, created_at').order('id', { ascending: false }),
        supabaseAdmin.from('trial_requests').select('*').order('id', { ascending: false }),
        supabaseAdmin.from('library_items').select('*').order('id', { ascending: false }),
      ]);

      return NextResponse.json({
        success: true,
        courses: coursesRes.data || [],
        blogs: blogsRes.data || [],
        trialRequests: trialsRes.data || [],
        libraryItems: libraryRes.data || [],
      });
    }

    if (!table) {
      return NextResponse.json({ error: 'Missing table name' }, { status: 400 });
    }

    const allowedTables = ['courses', 'blog_posts', 'trial_requests', 'library_items', 'profiles', 'admins'];
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    if (action === 'create') {
      const { data: created, error } = await supabaseAdmin
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, record: created });
    }

    if (action === 'update') {
      if (!id) return NextResponse.json({ error: 'Missing ID for update' }, { status: 400 });
      const { data: updated, error } = await supabaseAdmin
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, record: updated });
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing ID for delete' }, { status: 400 });
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin CRUD API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
