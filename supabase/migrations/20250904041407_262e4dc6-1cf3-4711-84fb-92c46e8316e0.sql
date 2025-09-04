-- Add public visibility to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow public access to public events
CREATE POLICY "Public can view public events" 
ON events 
FOR SELECT 
USING (is_public = true OR auth.uid() = admin_id);

-- Create a view for public events with relevant data
CREATE OR REPLACE VIEW public_event_preview AS
SELECT 
  id,
  title,
  description,
  location,
  date_time,
  event_type,
  theme,
  background_image_url,
  current_guests,
  max_guests
FROM events 
WHERE is_public = true AND status = 'published';