import { createClient } from "@supabase/supabase-js";

const ACTIVE_SUPABASE_URL = "https://vdzwhurilkucadjgcshv.supabase.co";
const ACTIVE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkendodXJpbGt1Y2Fkamdjc2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzQzNzEsImV4cCI6MjA5MTExMDM3MX0.75XO5HfFJR1vzrSzRFmRb_wKVhbBupVWkhjtaXbf5Ls";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const isRestrictedInstance = Boolean(
  rawUrl && (rawUrl.includes("cqcitgazqwajbdyxqhtl") || rawUrl.includes("xydbeeyzsuqsdrygndhe") || rawUrl.includes("aawqtepmkpsiynxxokxn"))
);

const supabaseUrl = (!rawUrl || isRestrictedInstance) ? ACTIVE_SUPABASE_URL : rawUrl;
const supabaseAnonKey = (!rawAnonKey || isRestrictedInstance) ? ACTIVE_SUPABASE_ANON_KEY : rawAnonKey;

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
