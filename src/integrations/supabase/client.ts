import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://fbwxtooicqpqotherube.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZid3h0b29pY3FwcW90aGVydWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5Mzc2NzYsImV4cCI6MjA1MDUxMzY3Nn0.ocomiXScS7tresXsQP9M0LlyoSd4BMZWJ2C0ySzIhAI";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
);