-- Enable realtime for rsvps table
ALTER TABLE public.rsvps REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rsvps;