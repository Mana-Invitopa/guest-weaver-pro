-- Add event_type and theme columns to events table
ALTER TABLE public.events 
ADD COLUMN event_type TEXT,
ADD COLUMN theme TEXT DEFAULT 'elegant-gold';

-- Add avatar_url to profiles table for profile photo upload
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT;

-- Add rsvp_deadline to events table for RSVP management
ALTER TABLE public.events 
ADD COLUMN rsvp_deadline TIMESTAMP WITH TIME ZONE;