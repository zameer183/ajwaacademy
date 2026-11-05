import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// Healthy Supabase Instance (Active, Unpaused, No Quota Exhaustion)
const HEALTHY_SUPABASE_URL = 'https://cqcitgazqwajbdyxqhtl.supabase.co';
const HEALTHY_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTAyNjg0NywiZXhwIjoyMTA2NjAyODQ3fQ.lWH89WCLiz0iZVg7GFnshv_nyUBvK2wJB2vRLnOCk8g';

const isRestrictedUrl = (url) => {
  return !url || url.includes('vdzwhurilkucadjgcshv') || url.includes('xydbeeyzsuqsdrygndhe') || url.includes('aawqtepmkpsiynxxokxn');
};

// Database 1: Core Database (Courses, Student Leads, Library)
const rawCoreUrl = process.env.SUPABASE_CORE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_CORE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawCoreKey = process.env.SUPABASE_CORE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const CORE_SUPABASE_URL = !isRestrictedUrl(rawCoreUrl) ? rawCoreUrl : HEALTHY_SUPABASE_URL;
const CORE_SERVICE_ROLE_KEY = !isRestrictedUrl(rawCoreUrl) && rawCoreKey ? rawCoreKey : HEALTHY_SERVICE_ROLE_KEY;

// Database 2: Blogs Database (Articles, Media, Categories)
const rawBlogsUrl = process.env.SUPABASE_BLOGS_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_BLOGS_URL?.trim();
const rawBlogsKey = process.env.SUPABASE_BLOGS_SERVICE_ROLE_KEY?.trim();

const BLOGS_SUPABASE_URL = !isRestrictedUrl(rawBlogsUrl) ? (rawBlogsUrl || HEALTHY_SUPABASE_URL) : HEALTHY_SUPABASE_URL;
const BLOGS_SERVICE_ROLE_KEY = !isRestrictedUrl(rawBlogsUrl) && rawBlogsKey ? rawBlogsKey : HEALTHY_SERVICE_ROLE_KEY;

const supabaseAdminCore = createClient(CORE_SUPABASE_URL, CORE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const supabaseAdminBlogs = createClient(BLOGS_SUPABASE_URL, BLOGS_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const supabaseAdminHealthy = createClient(HEALTHY_SUPABASE_URL, HEALTHY_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function getAdminClient(table) {
  if (table === 'blog_posts' || table === 'blog_categories') {
    return supabaseAdminBlogs;
  }
  return supabaseAdminCore;
}

function getFallbackPath(table) {
  const map = {
    courses: 'courses.json',
    blog_posts: 'blog-posts.json',
    library_items: 'library-items.json',
    trial_requests: 'trial-requests.json',
  };
  const fileName = map[table];
  if (!fileName) return null;
  return path.join(process.cwd(), 'public', 'fallback-data', fileName);
}

function loadFallback(table) {
  try {
    const filePath = getFallbackPath(table);
    if (!filePath || !fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.data || []);
  } catch (err) {
    console.error(`Error loading fallback for ${table}:`, err);
    return [];
  }
}

function saveFallback(table, data) {
  try {
    const filePath = getFallbackPath(table);
    if (!filePath) return false;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error saving fallback for ${table}:`, err);
    return false;
  }
}

export async function GET() {
  let isDbRestricted = false;
  let dbErrorMessage = '';

  let courses = [];
  let blogs = [];
  let trialRequests = [];
  let libraryItems = [];

  try {
    const [coursesRes, blogsRes, trialsRes, libraryRes] = await Promise.allSettled([
      supabaseAdminCore.from('courses').select('*').order('id', { ascending: false }),
      supabaseAdminBlogs.from('blog_posts').select('*').order('id', { ascending: false }),
      supabaseAdminCore.from('trial_requests').select('*').order('id', { ascending: false }),
      supabaseAdminCore.from('library_items').select('*').order('id', { ascending: false }),
    ]);

    // 1. Courses
    if (coursesRes.status === 'fulfilled' && !coursesRes.value.error && Array.isArray(coursesRes.value.data) && coursesRes.value.data.length > 0) {
      courses = coursesRes.value.data;
    } else {
      // Try healthy fallback client if core returned an error
      const healthyCourseRes = await supabaseAdminHealthy.from('courses').select('*').order('id', { ascending: false });
      if (!healthyCourseRes.error && Array.isArray(healthyCourseRes.data) && healthyCourseRes.data.length > 0) {
        courses = healthyCourseRes.data;
      } else {
        if (coursesRes.status === 'fulfilled' && coursesRes.value?.error) {
          isDbRestricted = true;
          dbErrorMessage = coursesRes.value.error.message || 'Supabase access restricted';
        }
        courses = loadFallback('courses');
      }
    }

    // 2. Blog Posts
    if (blogsRes.status === 'fulfilled' && !blogsRes.value.error && Array.isArray(blogsRes.value.data) && blogsRes.value.data.length > 0) {
      blogs = blogsRes.value.data;
    } else {
      const healthyBlogsRes = await supabaseAdminHealthy.from('blog_posts').select('*').order('id', { ascending: false });
      if (!healthyBlogsRes.error && Array.isArray(healthyBlogsRes.data) && healthyBlogsRes.data.length > 0) {
        blogs = healthyBlogsRes.data;
      } else {
        if (blogsRes.status === 'fulfilled' && blogsRes.value?.error) {
          isDbRestricted = true;
          if (!dbErrorMessage) dbErrorMessage = blogsRes.value.error.message;
        }
        blogs = loadFallback('blog_posts');
      }
    }

    // 3. Trial Requests
    if (trialsRes.status === 'fulfilled' && !trialsRes.value.error && Array.isArray(trialsRes.value.data) && trialsRes.value.data.length > 0) {
      trialRequests = trialsRes.value.data;
    } else {
      const healthyTrialsRes = await supabaseAdminHealthy.from('trial_requests').select('*').order('id', { ascending: false });
      if (!healthyTrialsRes.error && Array.isArray(healthyTrialsRes.data) && healthyTrialsRes.data.length > 0) {
        trialRequests = healthyTrialsRes.data;
      } else {
        if (trialsRes.status === 'fulfilled' && trialsRes.value?.error) {
          isDbRestricted = true;
        }
        trialRequests = loadFallback('trial_requests');
      }
    }

    // 4. Library Items
    if (libraryRes.status === 'fulfilled' && !libraryRes.value.error && Array.isArray(libraryRes.value.data) && libraryRes.value.data.length > 0) {
      libraryItems = libraryRes.value.data;
    } else {
      const healthyLibRes = await supabaseAdminHealthy.from('library_items').select('*').order('id', { ascending: false });
      if (!healthyLibRes.error && Array.isArray(healthyLibRes.data) && healthyLibRes.data.length > 0) {
        libraryItems = healthyLibRes.data;
      } else {
        if (libraryRes.status === 'fulfilled' && libraryRes.value?.error) {
          isDbRestricted = true;
        }
        libraryItems = loadFallback('library_items');
      }
    }

    return NextResponse.json({
      success: true,
      courses,
      blogs,
      trialRequests,
      libraryItems,
      dbStatus: {
        ok: !isDbRestricted,
        restricted: isDbRestricted,
        message: dbErrorMessage,
      },
    });
  } catch (err) {
    console.error('Admin GET error, loading all from fallback:', err);
    return NextResponse.json({
      success: true,
      courses: loadFallback('courses'),
      blogs: loadFallback('blog_posts'),
      trialRequests: loadFallback('trial_requests'),
      libraryItems: loadFallback('library_items'),
      dbStatus: {
        ok: false,
        restricted: true,
        message: err.message,
      },
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, table, id, data } = body;

    if (action === 'fetch_all') {
      return GET();
    }

    if (!table) {
      return NextResponse.json({ error: 'Missing table name' }, { status: 400 });
    }

    const allowedTables = ['courses', 'blog_posts', 'trial_requests', 'library_items', 'profiles', 'admins'];
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
    }

    // Attempt Supabase operation first
    let supabaseSuccess = false;
    let createdRecord = null;
    let updatedRecord = null;

    try {
      const client = getAdminClient(table);

      if (action === 'create') {
        const insertData = { ...data };
        if (table === 'trial_requests' && insertData.id) {
          delete insertData.id;
        }
        const { data: created, error } = await client
          .from(table)
          .insert(insertData)
          .select()
          .single();
        if (!error && created) {
          supabaseSuccess = true;
          createdRecord = created;
        }
      } else if (action === 'update') {
        const { data: updated, error } = await client
          .from(table)
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) {
          supabaseSuccess = true;
          updatedRecord = updated;
        }
      } else if (action === 'delete') {
        const { error } = await client.from(table).delete().eq('id', id);
        if (!error) {
          supabaseSuccess = true;
        }
      }
    } catch (dbErr) {
      console.warn(`Supabase ${action} failed, using local storage:`, dbErr.message);
    }

    // If Supabase succeeded, mirror to fallback storage so it is synchronized
    if (supabaseSuccess) {
      const items = loadFallback(table);
      if (action === 'create' && createdRecord) {
        saveFallback(table, [createdRecord, ...items]);
        return NextResponse.json({ success: true, record: createdRecord });
      }
      if (action === 'update' && updatedRecord) {
        saveFallback(table, items.map(item => (item.id === id || String(item.id) === String(id) ? { ...item, ...data, ...updatedRecord } : item)));
        return NextResponse.json({ success: true, record: updatedRecord });
      }
      if (action === 'delete') {
        saveFallback(table, items.filter(item => item.id !== id && String(item.id) !== String(id)));
        return NextResponse.json({ success: true });
      }
    }

    // Fallback handling when Supabase is restricted / payment required
    const items = loadFallback(table);
    if (action === 'create') {
      const newRecord = {
        ...data,
        id: data?.id || Date.now(),
        created_at: data?.created_at || new Date().toISOString(),
      };
      saveFallback(table, [newRecord, ...items]);
      return NextResponse.json({
        success: true,
        record: newRecord,
        fallbackMode: true,
      });
    }

    if (action === 'update') {
      if (!id) return NextResponse.json({ error: 'Missing ID for update' }, { status: 400 });
      let updatedItem = null;
      const nextItems = items.map(item => {
        if (item.id === id || String(item.id) === String(id) || item.slug === id) {
          updatedItem = { ...item, ...data };
          return updatedItem;
        }
        return item;
      });
      if (!updatedItem) {
        updatedItem = { id, ...data };
        nextItems.push(updatedItem);
      }
      saveFallback(table, nextItems);
      return NextResponse.json({
        success: true,
        record: updatedItem,
        fallbackMode: true,
      });
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing ID for delete' }, { status: 400 });
      const nextItems = items.filter(item => item.id !== id && String(item.id) !== String(id) && item.slug !== id);
      saveFallback(table, nextItems);
      return NextResponse.json({ success: true, fallbackMode: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin CRUD API Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
