import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fbwxtooicqpqotherube.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZid3h0b29pY3FwcW90aGVydWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5Mzc2NzYsImV4cCI6MjA1MDUxMzY3Nn0.ocomiXScS7tresXsQP9M0LlyoSd4BMZWJ2C0ySzIhAI";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);