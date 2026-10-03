import { createClient } from "@supabase/supabase-js";

const ACTIVE_SUPABASE_URL = "https://cqcitgazqwajbdyxqhtl.supabase.co";
const ACTIVE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjY4NDcsImV4cCI6MjEwNjYwMjg0N30.12ve7ROgwlPzLnL8Jc4o-zdv-1QdSN3VRB5RljazVFw";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const supabaseUrl = (rawUrl && rawUrl === ACTIVE_SUPABASE_URL) ? rawUrl : ACTIVE_SUPABASE_URL;
const supabaseAnonKey = (rawAnonKey && rawUrl === ACTIVE_SUPABASE_URL) ? rawAnonKey : ACTIVE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

// Singleton client for browser usage (anon key only). Only instantiate when env vars exist.
export const supabase =
  supabaseEnabled
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

