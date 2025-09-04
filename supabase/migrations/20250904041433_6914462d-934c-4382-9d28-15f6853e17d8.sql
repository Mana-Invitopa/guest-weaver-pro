-- Fix the security definer view by recreating it without security definer
DROP VIEW IF EXISTS public_event_preview;

CREATE VIEW public_event_preview AS
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