-- CRITICAL SECURITY FIX: Enable Row Level Security on all tables
-- This prevents unauthorized access to user data

-- Enable RLS on notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for notes table
CREATE POLICY "Users can view their own notes"
ON public.notes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
ON public.notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON public.notes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.notes
FOR DELETE
USING (auth.uid() = user_id);

-- Fix function search_path security issues
ALTER FUNCTION public.get_current_user_id() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.handle_new_user_settings() SET search_path = '';

-- Make user_id column NOT NULL on notes table for better security
ALTER TABLE public.notes ALTER COLUMN user_id SET NOT NULL;