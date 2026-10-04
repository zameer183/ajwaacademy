import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cqcitgazqwajbdyxqhtl.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAyNjg0NywiZXhwIjoyMTA2NjAyODQ3fQ.lWH89WCLiz0iZVg7GFnshv_nyUBvK2wJB2vRLnOCk8g';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, table, id, data } = body;

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
