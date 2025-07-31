-- Enable realtime for calls table
ALTER TABLE public.calls REPLICA IDENTITY FULL;

-- Add calls table to realtime publication
BEGIN;
  -- Add table to existing publication or create new one
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE calls;
COMMIT;