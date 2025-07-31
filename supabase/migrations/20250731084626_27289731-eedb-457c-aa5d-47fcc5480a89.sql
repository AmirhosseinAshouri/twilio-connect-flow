-- Fix remaining RLS security issues
-- Based on the schema, these tables have policies but RLS not enabled

-- Check current RLS status and enable where needed
-- Looking at the schema, these tables likely need RLS enabled:

-- Enable RLS on contacts table (appears to have policies but RLS disabled)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on communications table (appears to have policies but RLS disabled) 
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on calls table (appears to have policies but RLS disabled)
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Enable RLS on deals table (appears to have policies but RLS disabled)
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Enable RLS on settings table (appears to have policies but RLS disabled)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mentions table (appears to have policies but RLS disabled)
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table (appears to have policies but RLS disabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;