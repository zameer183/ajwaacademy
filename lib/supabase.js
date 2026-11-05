import { createClient } from "@supabase/supabase-js";

// Healthy Working Supabase Instance (Active, Unpaused, 0 Quota Issues)
export const HEALTHY_SUPABASE_URL = "https://cqcitgazqwajbdyxqhtl.supabase.co";
export const HEALTHY_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjY4NDcsImV4cCI6MjEwNjYwMjg0N30.12ve7ROgwlPzLnL8Jc4o-zdv-1QdSN3VRB5RljazVFw";

const isRestrictedUrl = (url) => {
  return !url || url.includes("vdzwhurilkucadjgcshv") || url.includes("xydbeeyzsuqsdrygndhe") || url.includes("aawqtepmkpsiynxxokxn");
};

// Database 1: Core Database (Courses, Student Leads, Library)
const rawCoreUrl = process.env.NEXT_PUBLIC_SUPABASE_CORE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawCoreKey = process.env.NEXT_PUBLIC_SUPABASE_CORE_ANON_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const CORE_SUPABASE_URL = !isRestrictedUrl(rawCoreUrl) ? rawCoreUrl : HEALTHY_SUPABASE_URL;
export const CORE_SUPABASE_ANON_KEY = !isRestrictedUrl(rawCoreUrl) && rawCoreKey ? rawCoreKey : HEALTHY_SUPABASE_ANON_KEY;

// Database 2: Blogs Database (Articles, Content, Categories)
const rawBlogsUrl = process.env.NEXT_PUBLIC_SUPABASE_BLOGS_URL?.trim();
const rawBlogsKey = process.env.NEXT_PUBLIC_SUPABASE_BLOGS_ANON_KEY?.trim();

export const BLOGS_SUPABASE_URL = !isRestrictedUrl(rawBlogsUrl) ? (rawBlogsUrl || HEALTHY_SUPABASE_URL) : HEALTHY_SUPABASE_URL;
export const BLOGS_SUPABASE_ANON_KEY = !isRestrictedUrl(rawBlogsUrl) && rawBlogsKey ? rawBlogsKey : HEALTHY_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(CORE_SUPABASE_URL && CORE_SUPABASE_ANON_KEY);

const clientOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
};

// Core database client (Courses, Leads, Library)
export const supabaseCore = CORE_SUPABASE_URL && CORE_SUPABASE_ANON_KEY
  ? createClient(CORE_SUPABASE_URL, CORE_SUPABASE_ANON_KEY, clientOptions)
  : null;

// Blogs database client (Blog posts & Content)
export const supabaseBlogs = (BLOGS_SUPABASE_URL && BLOGS_SUPABASE_URL !== CORE_SUPABASE_URL)
  ? createClient(BLOGS_SUPABASE_URL, BLOGS_SUPABASE_ANON_KEY, clientOptions)
  : supabaseCore;

// Default client for general compatibility
export const supabase = supabaseCore || supabaseBlogs;
