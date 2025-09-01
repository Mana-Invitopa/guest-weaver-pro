-- Create event_collaborators table for multi-admin management
CREATE TABLE public.event_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('admin', 'collaborator')),
  permissions JSONB DEFAULT '{"manage_guests": true, "manage_tables": true, "view_analytics": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS on event_collaborators
ALTER TABLE public.event_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_collaborators
CREATE POLICY "Event admins can manage collaborators"
ON public.event_collaborators
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_collaborators.event_id 
    AND events.admin_id = auth.uid()
  )
);

CREATE POLICY "Collaborators can view their own access"
ON public.event_collaborators
FOR SELECT
USING (auth.uid() = user_id);

-- Update events table to add privacy settings
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS privacy TEXT DEFAULT 'private' CHECK (privacy IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Create public events view (for public page)
CREATE OR REPLACE VIEW public.public_events AS
SELECT 
  id,
  title,
  description,
  date_time,
  location,
  event_type,
  theme,
  background_image_url,
  current_guests,
  max_guests,
  created_at
FROM public.events 
WHERE privacy = 'public' 
AND status = 'published'
AND date_time >= now() - INTERVAL '1 day';

-- Create guestbook component for weddings
CREATE TABLE public.guestbook_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guestbook_entry_id UUID NOT NULL REFERENCES public.guestbook_entries(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on guestbook_photos
ALTER TABLE public.guestbook_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for guestbook_photos
CREATE POLICY "Public can view guestbook photos"
ON public.guestbook_photos
FOR SELECT
USING (true);

CREATE POLICY "Public can insert guestbook photos"
ON public.guestbook_photos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage guestbook photos for their events"
ON public.guestbook_photos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.guestbook_entries ge
    JOIN public.events e ON ge.event_id = e.id
    WHERE ge.id = guestbook_photos.guestbook_entry_id
    AND e.admin_id = auth.uid()
  )
);

-- Create trigger for updated_at on event_collaborators
CREATE TRIGGER update_event_collaborators_updated_at
BEFORE UPDATE ON public.event_collaborators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();