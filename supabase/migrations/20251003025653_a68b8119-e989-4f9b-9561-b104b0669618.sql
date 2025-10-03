-- Fix Security Definer Views
-- Drop existing views that may have SECURITY DEFINER
DROP VIEW IF EXISTS public.public_events CASCADE;
DROP VIEW IF EXISTS public.public_event_preview CASCADE;

-- Recreate public_events view WITHOUT security definer
-- This view shows only published public events
CREATE VIEW public.public_events 
WITH (security_invoker=true)
AS
SELECT 
  id,
  title,
  description,
  location,
  event_type,
  theme,
  background_image_url,
  date_time,
  current_guests,
  max_guests,
  created_at
FROM events
WHERE is_public = true 
  AND status = 'published';

-- Recreate public_event_preview view WITHOUT security definer
-- This view shows featured public events
CREATE VIEW public.public_event_preview
WITH (security_invoker=true)
AS
SELECT 
  id,
  title,
  description,
  location,
  event_type,
  theme,
  background_image_url,
  date_time,
  current_guests,
  max_guests
FROM events
WHERE is_public = true 
  AND status = 'published'
  AND featured = true;

-- Grant appropriate permissions
GRANT SELECT ON public.public_events TO anon, authenticated;
GRANT SELECT ON public.public_event_preview TO anon, authenticated;

-- Add comment explaining the security model
COMMENT ON VIEW public.public_events IS 'Public view of published events. Uses security invoker to respect caller RLS policies.';
COMMENT ON VIEW public.public_event_preview IS 'Featured public events preview. Uses security invoker to respect caller RLS policies.';