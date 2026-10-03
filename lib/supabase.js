import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://cqcitgazqwajbdyxqhtl.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxY2l0Z2F6cXdhamJkeXhxaHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjY4NDcsImV4cCI6MjEwNjYwMjg0N30.12ve7ROgwlPzLnL8Jc4o-zdv-1QdSN3VRB5RljazVFw";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Avoid using old restricted instances
const isRestrictedInstance = Boolean(
  rawUrl && (rawUrl.includes("vdzwhurilkucadjgcshv") || rawUrl.includes("xydbeeyzsuqsdrygndhe") || rawUrl.includes("aawqtepmkpsiynxxokxn"))
);

const supabaseUrl = (!rawUrl || isRestrictedInstance) ? DEFAULT_SUPABASE_URL : rawUrl;
const supabaseAnonKey = (!rawAnonKey || isRestrictedInstance) ? DEFAULT_SUPABASE_ANON_KEY : rawAnonKey;

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

