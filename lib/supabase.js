import { createClient } from "@supabase/supabase-js";

// Database 1: Core Database (Courses, Student Leads, Library)
export const CORE_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_CORE_URL?.trim() || "https://vdzwhurilkucadjgcshv.supabase.co";
export const CORE_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_CORE_ANON_KEY?.trim() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkendodXJpbGt1Y2Fkamdjc2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzQzNzEsImV4cCI6MjA5MTExMDM3MX0.75XO5HfFJR1vzrSzRFmRb_wKVhbBupVWkhjtaXbf5Ls";

// Database 2: Blogs Database (Articles, Content, Categories)
export const BLOGS_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_BLOGS_URL?.trim() || "https://cqcitgazqwajbdyxqhtl.supabase.co";
export const BLOGS_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_BLOGS_ANON_KEY?.trim() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjY4NDcsImV4cCI6MjEwNjYwMjg0N30.12ve7ROgwlPzLnL8Jc4o-zdv-1QdSN3VRB5RljazVFw";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const activeUrl = rawUrl || CORE_SUPABASE_URL;
const activeAnonKey = rawAnonKey || CORE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(activeUrl && activeAnonKey);

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
export const supabaseBlogs = BLOGS_SUPABASE_URL && BLOGS_SUPABASE_ANON_KEY
  ? createClient(BLOGS_SUPABASE_URL, BLOGS_SUPABASE_ANON_KEY, clientOptions)
  : supabaseCore;

// Default client for general compatibility
export const supabase = supabaseCore || supabaseBlogs;
